export type PlayerId = 0 | 1

export type Territory = {
  id: number
  x: number
  y: number
  owner: PlayerId | null
  units: number
  productionRate: number
  connections: number[]
}

export type Force = {
  owner: PlayerId
  units: number
  origin: number
  destination: number
  progress: number
  speed: number
}

export type GameState = {
  territories: Territory[]
  forces: Force[]
  tick: number
  selectedTerritoryId: number | null
  winner: PlayerId | null
  isGameOver: boolean
}
