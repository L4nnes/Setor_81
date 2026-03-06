import { FORCE_DURATION_TICKS } from './constants';
import { hasForceArrived } from './force';
import { getTerritoryById } from './territory';
import type { Force, GameState, SendUnitsCommand } from './types';

export function processSendUnitsCommand(state: GameState, command: SendUnitsCommand): void {
  const source = getTerritoryById(state.territories, command.sourceTerritoryId);

  if (!source || source.owner !== command.owner || source.units < 2) {
    return;
  }

  if (!source.connections.includes(command.destinationTerritoryId)) {
    return;
  }

  const unitsToSend = Math.floor(source.units * command.percentage);

  if (unitsToSend < 1) {
    return;
  }

  source.units -= unitsToSend;

  const force: Force = {
    id: state.nextForceId++,
    owner: command.owner,
    units: unitsToSend,
    originId: source.id,
    destinationId: command.destinationTerritoryId,
    startTick: state.tick,
    durationTicks: FORCE_DURATION_TICKS,
  };

  state.forces.push(force);
}

export function splitArrivedForces(state: GameState): { arrived: Force[]; travelling: Force[] } {
  const arrived: Force[] = [];
  const travelling: Force[] = [];

  for (const force of state.forces) {
    if (hasForceArrived(force, state.tick)) {
      arrived.push(force);
    } else {
      travelling.push(force);
    }
  }

  return { arrived, travelling };
}
