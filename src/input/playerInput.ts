import type { GameState } from '../core/types'
import { sendForce } from '../simulation/engine'

function hitTest(state: GameState, x: number, y: number): number | null {
  for (const territory of state.territories) {
    const distance = Math.hypot(territory.x - x, territory.y - y)
    if (distance <= 17) {
      return territory.id
    }
  }

  return null
}

export function registerPlayerInput(canvas: HTMLCanvasElement, state: GameState): void {
  canvas.addEventListener('click', (event) => {
    if (state.isGameOver) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const clickedTerritoryId = hitTest(state, x, y)

    if (clickedTerritoryId === null) {
      state.selectedTerritoryId = null
      return
    }

    const clicked = state.territories[clickedTerritoryId]
    if (!clicked) {
      return
    }

    if (state.selectedTerritoryId === null) {
      if (clicked.owner === 0) {
        state.selectedTerritoryId = clickedTerritoryId
      }
      return
    }

    const originId = state.selectedTerritoryId
    if (originId === clickedTerritoryId) {
      state.selectedTerritoryId = null
      return
    }

    sendForce(state, originId, clickedTerritoryId, 0)
    state.selectedTerritoryId = null
  })
}
