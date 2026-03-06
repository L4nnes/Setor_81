import type { Force, GameState, PlayerId, Territory } from '../core/types'

export const TICKS_PER_SECOND = 20
const FORCE_SPEED = 0.02
const SEND_RATIO = 0.5

export function getTerritoryById(state: GameState, id: number): Territory | undefined {
  return state.territories.find((territory) => territory.id === id)
}

export function canSend(state: GameState, originId: number, destinationId: number, owner: PlayerId): boolean {
  const origin = getTerritoryById(state, originId)
  if (!origin || origin.owner !== owner || origin.units < 2) {
    return false
  }

  return origin.connections.includes(destinationId)
}

export function sendForce(state: GameState, originId: number, destinationId: number, owner: PlayerId): boolean {
  if (!canSend(state, originId, destinationId, owner)) {
    return false
  }

  const origin = getTerritoryById(state, originId)
  if (!origin) {
    return false
  }

  const unitsToSend = Math.floor(origin.units * SEND_RATIO)
  if (unitsToSend < 1) {
    return false
  }

  origin.units -= unitsToSend

  state.forces.push({
    owner,
    units: unitsToSend,
    origin: originId,
    destination: destinationId,
    progress: 0,
    speed: FORCE_SPEED
  })

  return true
}

export function generateUnits(state: GameState): void {
  for (const territory of state.territories) {
    if (territory.owner !== null) {
      territory.units += territory.productionRate / TICKS_PER_SECOND
    }
  }
}

export function moveForces(state: GameState): void {
  for (const force of state.forces) {
    force.progress += force.speed
  }
}

function resolveArrival(destination: Territory, force: Force): void {
  if (destination.owner === force.owner) {
    destination.units += force.units
    return
  }

  if (force.units > destination.units) {
    destination.owner = force.owner
    destination.units = force.units - destination.units
    return
  }

  destination.units -= force.units
}

export function resolveArrivals(state: GameState): void {
  const remainingForces: Force[] = []

  for (const force of state.forces) {
    if (force.progress < 1) {
      remainingForces.push(force)
      continue
    }

    const destination = getTerritoryById(state, force.destination)
    if (!destination) {
      continue
    }

    resolveArrival(destination, force)
  }

  state.forces = remainingForces
}

export function updateOwnership(state: GameState): void {
  const playerTerritories = state.territories.filter((territory) => territory.owner === 0).length
  const botTerritories = state.territories.filter((territory) => territory.owner === 1).length

  if (playerTerritories === 0) {
    state.winner = 1
    state.isGameOver = true
  } else if (botTerritories === 0) {
    state.winner = 0
    state.isGameOver = true
  }
}

export function stepSimulation(state: GameState, runAI: () => void): void {
  if (state.isGameOver) {
    return
  }

  generateUnits(state)
  moveForces(state)
  resolveArrivals(state)
  updateOwnership(state)

  runAI()
  updateOwnership(state)

  state.tick += 1
}
