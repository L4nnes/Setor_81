import { ChunkId, RelativeTowerId } from '../grid/chunkId';
import { Path } from '../domain/path';
import { Force, type PlayerId } from '../domain/force';
import { Tower } from '../domain/tower';
import { type TowerType } from '../domain/towerType';

export type AddressedChunkEvent = {
  dst: ChunkId;
  event: ChunkEvent;
};

export type ChunkInput =
  | {
      type: 'ADD_INBOUND_FORCE';
      towerId: RelativeTowerId;
      force: Force;
    }
  | {
      type: 'CLEAR_ZOMBIES';
      towerId: RelativeTowerId;
    }
  | {
      type: 'DEPLOY_FORCE';
      towerId: RelativeTowerId;
      path: Path;
    }
  | {
      type: 'GENERATE';
      towerIds: RelativeTowerId[];
    }
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
    }
  | {
      type: 'UPGRADE_TOWER';
      towerId: RelativeTowerId;
      towerType: TowerType;
    };

export type ChunkEvent =
  | {
      type: 'ADD_INBOUND_FORCE';
      towerId: RelativeTowerId;
      force: Force;
    }
  | {
      type: 'ADD_OUTBOUND_FORCE';
      towerId: RelativeTowerId;
      force: Force;
    };

export function addOutboundForce(towerId: RelativeTowerId, force: Force): ChunkEvent {
  return {
    type: 'ADD_OUTBOUND_FORCE',
    towerId,
    force: force.halted(),
  };
}

export function sendForceFromTower(tower: Tower, force: Force): [AddressedChunkEvent, AddressedChunkEvent] {
  const [outChunkId, outTowerId] = force.currentSource().split();
  const outbound: AddressedChunkEvent = {
    dst: outChunkId,
    event: addOutboundForce(outTowerId, force),
  };

  const [inChunkId, inTowerId] = force.currentDestination().split();
  const inbound: AddressedChunkEvent = {
    dst: inChunkId,
    event: {
      type: 'ADD_INBOUND_FORCE',
      towerId: inTowerId,
      force,
    },
  };

  void tower;
  return [outbound, inbound];
}

export function deployForceFromTower(tower: Tower, path: Path): [AddressedChunkEvent, AddressedChunkEvent] {
  const units = tower.takeForceUnits();

  if (tower.playerId === null) {
    throw new Error('Cannot deploy force from unowned tower');
  }

  const force = Force.new(tower.playerId, units, path);
  return sendForceFromTower(tower, force);
}
