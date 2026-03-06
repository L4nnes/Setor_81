import type { GameState, Territory } from '../core/types'

const COLORS = {
  background: '#111827',
  connection: '#334155',
  neutral: '#9ca3af',
  player: '#3b82f6',
  bot: '#ef4444',
  forcePlayer: '#93c5fd',
  forceBot: '#fca5a5',
  selected: '#facc15',
  text: '#f8fafc'
}

function territoryColor(owner: number | null): string {
  if (owner === 0) return COLORS.player
  if (owner === 1) return COLORS.bot
  return COLORS.neutral
}

function drawConnections(ctx: CanvasRenderingContext2D, territories: Territory[]): void {
  const drawn = new Set<string>()
  ctx.strokeStyle = COLORS.connection
  ctx.lineWidth = 2

  for (const territory of territories) {
    for (const targetId of territory.connections) {
      const key = territory.id < targetId ? `${territory.id}-${targetId}` : `${targetId}-${territory.id}`
      if (drawn.has(key)) continue

      const target = territories[targetId]
      if (!target) continue

      ctx.beginPath()
      ctx.moveTo(territory.x, territory.y)
      ctx.lineTo(target.x, target.y)
      ctx.stroke()
      drawn.add(key)
    }
  }
}

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { canvas } = ctx

  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawConnections(ctx, state.territories)

  for (const territory of state.territories) {
    ctx.beginPath()
    ctx.fillStyle = territoryColor(territory.owner)
    ctx.arc(territory.x, territory.y, 17, 0, Math.PI * 2)
    ctx.fill()

    if (state.selectedTerritoryId === territory.id) {
      ctx.strokeStyle = COLORS.selected
      ctx.lineWidth = 3
      ctx.stroke()
    }

    ctx.fillStyle = COLORS.text
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(Math.floor(territory.units)), territory.x, territory.y)
  }

  for (const force of state.forces) {
    const origin = state.territories[force.origin]
    const destination = state.territories[force.destination]
    if (!origin || !destination) continue

    const x = origin.x + (destination.x - origin.x) * force.progress
    const y = origin.y + (destination.y - origin.y) * force.progress

    ctx.beginPath()
    ctx.fillStyle = force.owner === 0 ? COLORS.forcePlayer : COLORS.forceBot
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = COLORS.text
  ctx.font = '14px sans-serif'
  ctx.fillText(`Tick: ${state.tick}`, 12, 10)
  ctx.fillText('Clique em um território azul e depois em um vizinho para enviar 50% das tropas.', 12, 30)

  if (state.isGameOver) {
    ctx.font = 'bold 32px sans-serif'
    ctx.textAlign = 'center'
    const label = state.winner === 0 ? 'Vitória!' : 'Derrota!'
    ctx.fillText(label, canvas.width / 2, 55)
  }
}
