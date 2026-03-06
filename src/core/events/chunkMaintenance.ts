import { ChunkId, RelativeTowerId } from '../grid/chunkId';
import { Unit } from '../domain/unit';
import type { PlayerId } from '../domain/force';
import { Tower } from '../domain/tower';
import type { TowerId } from '../grid/towerId';

export type ChunkLikeMaintenance = {
  chunkId: ChunkId;
  remove(towerId: RelativeTowerId): Tower | undefined;
  entries(): Array<[RelativeTowerId, Tower]>;
};

export type ChunkMaintenance =
  | { type: 'DESTROY'; towerIds: RelativeTowerId[] }
  | { type: 'KILL_PLAYER'; playerId: PlayerId; absoluteTowerId: (relativeTowerId: RelativeTowerId) => TowerId };

export type ChunkMaintenanceContext = { onInfo?: (payload: unknown) => void };

export function applyChunkMaintenance(
  chunk: ChunkLikeMaintenance,
  maintenance: ChunkMaintenance,
  context: ChunkMaintenanceContext = {},
): void {
  switch (maintenance.type) {
    case 'DESTROY': {
      for (const towerId of maintenance.towerIds) {
        const tower = chunk.remove(towerId);
        if (!tower) throw new Error(`Tried to destroy missing tower ${towerId.value}`);
        if (!tower.canDestroy()) throw new Error(`Tower ${towerId.value} cannot be destroyed yet`);
      }
      return;
    }
    case 'KILL_PLAYER': {
      for (const [relativeTowerId, tower] of chunk.entries()) {
        if (tower.playerId === maintenance.playerId) {
          tower.units.subtract(Unit.Ruler, Number.MAX_SAFE_INTEGER);
          tower.units.subtract(Unit.Shield, Number.MAX_SAFE_INTEGER);
          tower.setPlayerId(null);
          context.onInfo?.({
            type: 'LOST_TOWER',
            towerId: maintenance.absoluteTowerId(relativeTowerId),
            playerId: maintenance.playerId,
            reason: 'PLAYER_KILLED',
          });
        }
        tower.inboundForces = tower.inboundForces.filter((force) => {
          const typed = force as { playerId?: PlayerId };
          return typed.playerId !== maintenance.playerId;
        });
        tower.outboundForces = tower.outboundForces.filter((force) => {
          const typed = force as { playerId?: PlayerId };
          return typed.playerId !== maintenance.playerId;
        });
      }
      return;
    }
  }
}
