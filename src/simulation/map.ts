import type { GameState, PlayerId, Territory } from '../core/types'

const PLAYER: PlayerId = 0
const BOT: PlayerId = 1

function createRingConnection(index: number, total: number): number[] {
  const prev = (index - 1 + total) % total
  const next = (index + 1) % total
  const jump = (index + 5) % total
  return Array.from(new Set([prev, next, jump]))
}

export function createInitialState(totalTerritories = 30): GameState {
  const territories: Territory[] = []
  const centerX = 480
  const centerY = 330
  const radius = 250

  for (let i = 0; i < totalTerritories; i++) {
    const angle = (Math.PI * 2 * i) / totalTerritories
    const wobble = 1 + ((i % 3) - 1) * 0.08

    territories.push({
      id: i,
      x: centerX + Math.cos(angle) * radius * wobble,
      y: centerY + Math.sin(angle) * radius * wobble,
      owner: null,
      units: 10,
      productionRate: 1,
      connections: createRingConnection(i, totalTerritories)
    })
  }

  const playerStart = [0, 1, 2]
  const botStart = [15, 16, 17]

  for (const id of playerStart) {
    territories[id].owner = PLAYER
    territories[id].units = 35
  }

  for (const id of botStart) {
    territories[id].owner = BOT
    territories[id].units = 35
  }

  return {
    territories,
    forces: [],
    tick: 0,
    selectedTerritoryId: null,
    winner: null,
    isGameOver: false
  }
}
