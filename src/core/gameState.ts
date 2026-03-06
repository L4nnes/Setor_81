import { createInitialMap } from './map';
import type { GameState } from './types';

export function createInitialGameState(): GameState {
  const territories = createInitialMap();

  return {
    territories,
    forces: [],
    tick: 0,
    selectedTerritoryId: null,
    queuedCommands: [],
    gameStatus: 'running',
    nextForceId: 1,
    productionBuffer: Object.fromEntries(territories.map((territory) => [territory.id, 0])),
  };
}
