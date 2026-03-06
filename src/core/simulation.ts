import { updateGameStatus } from './capture';
import { resolveArrivals } from './combat';
import { splitArrivedForces, processSendUnitsCommand } from './movement';
import { updateProduction } from './production';
import type { GameCommand, GameState } from './types';

export function queueCommand(state: GameState, command: GameCommand): void {
  state.queuedCommands.push(command);
}

export function runSimulationTick(
  state: GameState,
  botStep: (state: GameState) => void,
): void {
  if (state.gameStatus !== 'running') {
    return;
  }

  state.tick += 1;

  processCommands(state);
  updateProduction(state);

  const { arrived, travelling } = splitArrivedForces(state);
  state.forces = travelling;

  resolveArrivals(state, arrived);
  botStep(state);
  updateGameStatus(state);
}

function processCommands(state: GameState): void {
  const commands = [...state.queuedCommands];
  state.queuedCommands.length = 0;

  for (const command of commands) {
    if (command.type === 'sendUnits') {
      processSendUnitsCommand(state, command);
    }
  }
}
