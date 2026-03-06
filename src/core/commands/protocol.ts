import { Path } from '../domain/path';
import { type TowerType } from '../domain/towerType';
import { TowerId } from '../grid/towerId';
import { type PlayerId } from '../domain/player';
import { ChunkRect } from '../grid/chunkRect';

export type PlayerAlias = string;

export type Command =
  | {
      type: 'ALLIANCE';
      with: PlayerId;
      breakAlliance: boolean;
    }
  | {
      type: 'DEPLOY_FORCE';
      towerId: TowerId;
      path: Path;
    }
  | {
      type: 'SET_SUPPLY_LINE';
      towerId: TowerId;
      path: Path | null;
    }
  | {
      type: 'SET_VIEWPORT';
      viewport: ChunkRect;
    }
  | {
      type: 'SPAWN';
      alias: PlayerAlias;
    }
  | {
      type: 'UPGRADE';
      towerId: TowerId;
      towerType: TowerType;
    };

export function deployForceFromPath(pathNodes: TowerId[]): Command {
  return {
    type: 'DEPLOY_FORCE',
    towerId: pathNodes[0],
    path: new Path(pathNodes),
  };
}

export type NonActor = {
  alive: boolean;
  alerts: unknown[];
  towerCounts: Partial<Record<TowerType, number>>;
  deathReason: string | null;
  boundingRectangle: unknown | null;
};

export type Update = {
  actorUpdate: unknown;
  nonActor: NonActor;
};
