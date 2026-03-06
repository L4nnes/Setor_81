import { createSendUnitsCommand } from '../core/command';
import { CLICK_RADIUS } from '../core/constants';
import { queueCommand } from '../core/simulation';
import type { GameState, Territory } from '../core/types';
import { distance } from '../utils/math';

export class MouseController {
  private readonly canvas: HTMLCanvasElement;
  private readonly getState: () => GameState;

  constructor(canvas: HTMLCanvasElement, getState: () => GameState) {
    this.canvas = canvas;
    this.getState = getState;
    this.canvas.addEventListener('click', this.onClick);
  }

  destroy(): void {
    this.canvas.removeEventListener('click', this.onClick);
  }

  private readonly onClick = (event: MouseEvent): void => {
    const state = this.getState();
    if (state.gameStatus !== 'running') {
      return;
    }

    const clickPosition = this.getCanvasPosition(event);
    const clicked = state.territories.find((territory) => this.isInsideTerritory(clickPosition.x, clickPosition.y, territory));

    if (!clicked) {
      state.selectedTerritoryId = null;
      return;
    }

    const selected = state.territories.find((territory) => territory.id === state.selectedTerritoryId);

    if (!selected) {
      state.selectedTerritoryId = clicked.owner === 'player' ? clicked.id : null;
      return;
    }

    if (clicked.id === selected.id) {
      state.selectedTerritoryId = null;
      return;
    }

    if (selected.owner === 'player' && selected.connections.includes(clicked.id)) {
      queueCommand(state, createSendUnitsCommand('player', selected.id, clicked.id));
    }

    state.selectedTerritoryId = clicked.owner === 'player' ? clicked.id : null;
  };

  private getCanvasPosition(event: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  private isInsideTerritory(x: number, y: number, territory: Territory): boolean {
    return distance(x, y, territory.x, territory.y) <= CLICK_RADIUS;
  }
}
