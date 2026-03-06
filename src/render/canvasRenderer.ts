import { FORCE_RADIUS, TERRITORY_RADIUS } from '../core/constants';
import { getForceProgress } from '../core/force';
import { getTerritoryById } from '../core/territory';
import type { GameState, Owner, Territory } from '../core/types';
import { drawHud } from './hud';

const ownerColor: Record<Owner, string> = {
  player: '#2f7bff',
  enemy: '#ff4d4f',
  neutral: '#8f949f',
};

export class CanvasRenderer {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  render(state: GameState): void {
    const { ctx } = this;

    ctx.fillStyle = '#111624';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.drawConnections(state.territories);
    this.drawTerritories(state);
    this.drawForces(state);
    drawHud(ctx, state);
  }

  private drawConnections(territories: Territory[]): void {
    this.ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    this.ctx.lineWidth = 2;

    for (const territory of territories) {
      for (const connectedId of territory.connections) {
        if (connectedId < territory.id) {
          continue;
        }

        const target = getTerritoryById(territories, connectedId);
        if (!target) continue;

        this.ctx.beginPath();
        this.ctx.moveTo(territory.x, territory.y);
        this.ctx.lineTo(target.x, target.y);
        this.ctx.stroke();
      }
    }
  }

  private drawTerritories(state: GameState): void {
    for (const territory of state.territories) {
      this.ctx.fillStyle = ownerColor[territory.owner];
      this.ctx.beginPath();
      this.ctx.arc(territory.x, territory.y, TERRITORY_RADIUS, 0, Math.PI * 2);
      this.ctx.fill();

      if (state.selectedTerritoryId === territory.id) {
        this.ctx.strokeStyle = '#fffad6';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(territory.x, territory.y, TERRITORY_RADIUS + 4, 0, Math.PI * 2);
        this.ctx.stroke();
      }

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 14px sans-serif';
      this.ctx.fillText(String(territory.units), territory.x - 8, territory.y + 5);
    }
  }

  private drawForces(state: GameState): void {
    for (const force of state.forces) {
      const origin = getTerritoryById(state.territories, force.originId);
      const destination = getTerritoryById(state.territories, force.destinationId);

      if (!origin || !destination) continue;

      const progress = getForceProgress(force, state.tick);
      const x = origin.x + (destination.x - origin.x) * progress;
      const y = origin.y + (destination.y - origin.y) * progress;

      this.ctx.fillStyle = force.owner === 'player' ? '#8fb9ff' : '#ff9b99';
      this.ctx.beginPath();
      this.ctx.arc(x, y, FORCE_RADIUS, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}
