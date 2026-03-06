import { DEFAULT_SEND_PERCENTAGE } from './constants';
import type { GameCommand, SendUnitsCommand } from './types';

export function createSendUnitsCommand(
  owner: 'player' | 'enemy',
  sourceTerritoryId: number,
  destinationTerritoryId: number,
  percentage = DEFAULT_SEND_PERCENTAGE,
): SendUnitsCommand {
  return {
    type: 'sendUnits',
    owner,
    sourceTerritoryId,
    destinationTerritoryId,
    percentage,
  };
}

export function enqueueCommand(commands: GameCommand[], command: GameCommand): void {
  commands.push(command);
}
