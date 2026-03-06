import { BOT_DECISION_INTERVAL_TICKS } from '../core/constants';
import { createSendUnitsCommand } from '../core/command';
import { queueCommand } from '../core/simulation';
import type { GameState, Territory } from '../core/types';

export function runBotTick(state: GameState): void {
  if (state.tick % BOT_DECISION_INTERVAL_TICKS !== 0 || state.gameStatus !== 'running') {
    return;
  }

  const botTerritories = state.territories.filter((territory) => territory.owner === 'enemy' && territory.units >= 18);

  for (const source of botTerritories) {
    const target = chooseTarget(state.territories, source);
    if (!target) {
      continue;
    }

    queueCommand(state, createSendUnitsCommand('enemy', source.id, target.id));
    break;
  }
}

function chooseTarget(territories: Territory[], source: Territory): Territory | null {
  const connected = source.connections
    .map((id) => territories.find((territory) => territory.id === id))
    .filter((territory): territory is Territory => Boolean(territory));

  const neutralTarget = connected
    .filter((territory) => territory.owner === 'neutral')
    .sort((a, b) => a.units - b.units)[0];

  if (neutralTarget && source.units > neutralTarget.units + 2) {
    return neutralTarget;
  }

  const playerTarget = connected
    .filter((territory) => territory.owner === 'player')
    .sort((a, b) => a.units - b.units)[0];

  if (playerTarget && source.units > playerTarget.units + 6) {
    return playerTarget;
  }

  return null;
}
