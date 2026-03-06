import type { GameState } from './types';

export function updateProduction(state: GameState): void {
  for (const territory of state.territories) {
    if (territory.owner === 'neutral') {
      continue;
    }

    state.productionBuffer[territory.id] += territory.productionRate;
    const generated = Math.floor(state.productionBuffer[territory.id]);

    if (generated > 0) {
      territory.units += generated;
      state.productionBuffer[territory.id] -= generated;
    }
  }
}
