import { getTerritoryById } from './territory';
import type { Force, GameState } from './types';

export function resolveArrivals(state: GameState, arrivedForces: Force[]): void {
  for (const force of arrivedForces) {
    const target = getTerritoryById(state.territories, force.destinationId);
    if (!target) {
      continue;
    }

    if (target.owner === force.owner) {
      target.units += force.units;
      continue;
    }

    if (force.units > target.units) {
      target.units = force.units - target.units;
      target.owner = force.owner;
      state.productionBuffer[target.id] = 0;
      continue;
    }

    target.units -= force.units;
  }
}
