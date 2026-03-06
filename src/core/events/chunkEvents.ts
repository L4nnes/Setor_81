import { ChunkId, RelativeTowerId } from '../grid/chunkId';
import { Path } from '../domain/path';
import { Force, type PlayerId } from '../domain/force';
import { type TowerType } from '../domain/towerType';
import { Tower } from '../domain/tower';
import { Units } from '../domain/units';
import { Unit } from '../domain/unit';
import { sendForceFromTower, deployForceFromTower } from './forceEvents';
import type { TowerId } from '../grid/towerId';

export type AddressedChunkEvent = { src?: ChunkId; dst: ChunkId; event: ChunkEvent };

export type ChunkInput =
  | { type: 'ADD_INBOUND_FORCE'; towerId: RelativeTowerId; force: Force }
  | { type: 'CLEAR_ZOMBIES'; towerId: RelativeTowerId }
  | { type: 'DEPLOY_FORCE'; towerId: RelativeTowerId; path: Path }
  | { type: 'GENERATE'; towerIds: RelativeTowerId[]; createTower: (relativeTowerId: RelativeTowerId) => Tower }
  | {
      type: 'SET_SUPPLY_LINE';
      towerId: RelativeTowerId;
      path: Path | null;
    }
  | {
      type: 'SPAWN';
      towerId: RelativeTowerId;
      playerId: PlayerId;
      rank?: number | null;
      absoluteTowerId: (relativeTowerId: RelativeTowerId) => TowerId;
    }
  | {
      type: 'UPGRADE_TOWER';
      towerId: RelativeTowerId;
      towerType: TowerType;
      upgradeDelay?: number;
    };

export type ChunkEvent =
  | { type: 'ADD_INBOUND_FORCE'; towerId: RelativeTowerId; force: Force }
  | { type: 'ADD_OUTBOUND_FORCE'; towerId: RelativeTowerId; force: Force };

export type ChunkLike = {
  chunkId: ChunkId;
  get(towerId: RelativeTowerId): Tower | undefined;
  set(towerId: RelativeTowerId, tower: Tower): void;
  remove(towerId: RelativeTowerId): Tower | undefined;
  entries(): Array<[RelativeTowerId, Tower]>;
};

export type ChunkEventContext = {
  emitChunkEvent: (src: ChunkId, dst: ChunkId, event: ChunkEvent) => void;
  onInfo?: (payload: unknown) => void;
};

function requireTower(chunk: ChunkLike, towerId: RelativeTowerId): Tower {
  const tower = chunk.get(towerId);
  if (!tower) throw new Error(`Missing tower for RelativeTowerId ${towerId.value}`);
  return tower;
}

export function applyChunkInput(chunk: ChunkLike, input: ChunkInput, context: ChunkEventContext): void {
  switch (input.type) {
    case 'ADD_INBOUND_FORCE': {
      requireTower(chunk, input.towerId).inboundForces.push(input.force);
      return;
    }
    case 'CLEAR_ZOMBIES': {
      const tower = requireTower(chunk, input.towerId);
      if (tower.playerId === null) tower.units.clear();
      return;
    }
    case 'DEPLOY_FORCE': {
      const tower = requireTower(chunk, input.towerId);
      for (const addressed of deployForceFromTower(tower, input.path)) {
        context.emitChunkEvent(chunk.chunkId, addressed.dst, addressed.event);
      }
      return;
    }
    case 'GENERATE': {
      for (const towerId of input.towerIds) chunk.set(towerId, input.createTower(towerId));
      return;
    }
    case 'SET_SUPPLY_LINE': {
      requireTower(chunk, input.towerId).supplyLine = input.path;
      return;
    }
    case 'SPAWN': {
      const tower = requireTower(chunk, input.towerId);
      const absoluteTowerId = input.absoluteTowerId(input.towerId);
      if (tower.playerId !== null) throw new Error(`Cannot spawn on owned tower ${input.towerId.value}`);
      if (tower.units.hasRuler()) throw new Error(`Spawn tower already has ruler ${input.towerId.value}`);

      tower.units = new Units();
      tower.setPlayerId(input.playerId);
      context.onInfo?.({ type: 'GAINED_TOWER', playerId: input.playerId, towerId: absoluteTowerId, reason: 'SPAWNED' });

      tower.units.addToTower(Unit.Ruler, 1, tower.towerType, false);
      tower.units.addToTower(Unit.Shield, Number.MAX_SAFE_INTEGER, tower.towerType, false);

      for (const unit of [Unit.Soldier, Unit.Fighter]) {
        const soldiers = new Units();
        soldiers.add(unit, unit === Unit.Fighter ? 2 : (input.rank ?? 0) >= 2 ? 8 : 4);
        soldiers.add(Unit.Shield, 15);

        for (const neighbor of absoluteTowerId.neighbors()) {
          const force = Force.new(input.playerId, soldiers.clone(), new Path([absoluteTowerId, neighbor]));
          for (const addressed of sendForceFromTower(tower, force)) {
            context.emitChunkEvent(chunk.chunkId, addressed.dst, addressed.event);
          }
        }
        if ((input.rank ?? 0) < 5) break;
      }
      return;
    }
    case 'UPGRADE_TOWER': {
      const tower = requireTower(chunk, input.towerId);
      tower.towerType = input.towerType;
      tower.delay = input.upgradeDelay ?? 1;
      tower.reconcileUnits();
      if (tower.supplyLine !== null && !tower.generatesMobileUnits()) tower.supplyLine = null;
      return;
    }
  }
}

export function applyChunkEvent(chunk: ChunkLike, event: ChunkEvent): void {
  switch (event.type) {
    case 'ADD_INBOUND_FORCE':
      requireTower(chunk, event.towerId).inboundForces.push(event.force);
      return;
    case 'ADD_OUTBOUND_FORCE':
      requireTower(chunk, event.towerId).outboundForces.push(event.force);
      return;
  }
}

export function addOutboundForce(towerId: RelativeTowerId, force: Force): ChunkEvent {
  return { type: 'ADD_OUTBOUND_FORCE', towerId, force: force.halted() };
}
