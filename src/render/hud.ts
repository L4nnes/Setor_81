import type { GameState } from '../core/types';

export function drawHud(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.fillStyle = '#f5f7ff';
  ctx.font = '16px sans-serif';
  ctx.fillText(`Tick: ${state.tick}`, 20, 28);

  const playerCount = state.territories.filter((territory) => territory.owner === 'player').length;
  const enemyCount = state.territories.filter((territory) => territory.owner === 'enemy').length;

  ctx.fillText(`Player: ${playerCount} territórios`, 20, 50);
  ctx.fillText(`Enemy: ${enemyCount} territórios`, 20, 72);

  if (state.gameStatus !== 'running') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px sans-serif';
    const label = state.gameStatus === 'victory' ? 'Vitória!' : 'Derrota!';
    ctx.fillText(label, ctx.canvas.width / 2 - 90, ctx.canvas.height / 2);
  }
}
