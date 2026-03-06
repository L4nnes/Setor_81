import type { GameState } from './types';

export function updateGameStatus(state: GameState): void {
  const playerTerritories = state.territories.filter((territory) => territory.owner === 'player').length;
  const enemyTerritories = state.territories.filter((territory) => territory.owner === 'enemy').length;

  if (enemyTerritories === 0) {
    state.gameStatus = 'victory';
    return;
  }

  if (playerTerritories === 0) {
    state.gameStatus = 'defeat';
    return;
  }

  state.gameStatus = 'running';
}
