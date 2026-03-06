import type { GameState } from '../core/types'
import { TICKS_PER_SECOND, sendForce } from '../simulation/engine'

const BOT_PLAYER = 1

export function runBotAI(state: GameState): void {
  if (state.tick % TICKS_PER_SECOND !== 0) {
    return
  }

  const botTerritories = state.territories.filter((territory) => territory.owner === BOT_PLAYER)

  for (const territory of botTerritories) {
    const neighbors = territory.connections
      .map((id) => state.territories[id])
      .filter((candidate) => candidate !== undefined)
      .sort((a, b) => a.units - b.units)

    const target = neighbors[0]
    if (!target) {
      continue
    }

    if (territory.units > target.units * 1.2) {
      sendForce(state, territory.id, target.id, BOT_PLAYER)
      return
    }
  }
}
