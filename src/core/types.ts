export type Owner = 'player' | 'enemy' | 'neutral';

export type GameStatus = 'running' | 'victory' | 'defeat';

export interface Territory {
  id: number;
  x: number;
  y: number;
  owner: Owner;
  units: number;
  productionRate: number;
  connections: number[];
  capacity?: number;
}

export interface Force {
  id: number;
  owner: Exclude<Owner, 'neutral'>;
  units: number;
  originId: number;
  destinationId: number;
  startTick: number;
  durationTicks: number;
}

export interface SendUnitsCommand {
  type: 'sendUnits';
  owner: Exclude<Owner, 'neutral'>;
  sourceTerritoryId: number;
  destinationTerritoryId: number;
  percentage: number;
}

export type GameCommand = SendUnitsCommand;

export interface GameState {
  territories: Territory[];
  forces: Force[];
  tick: number;
  selectedTerritoryId: number | null;
  queuedCommands: GameCommand[];
  gameStatus: GameStatus;
  nextForceId: number;
  productionBuffer: Record<number, number>;
}
