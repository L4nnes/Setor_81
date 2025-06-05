export type Point = { x: number; y: number }

export class Lot {
  id: number
  clusterId: number
  structureId?: number
  x: number
  y: number
  connections: Set<number>

  constructor(
    id: number,
    clusterId: number,
    x: number,
    y: number,
    structureId?: number
  ) {
    this.id = id
    this.clusterId = clusterId
    this.x = x
    this.y = y
    this.structureId = structureId
    this.connections = new Set()
  }

  toJSON() {
    return {
      id: this.id,
      clusterId: this.clusterId,
      structureId: this.structureId,
      x: this.x,
      y: this.y,
      connections: Array.from(this.connections)
    }
  }

  static fromJSON(data: any) {
    const lot = new Lot(data.id, data.clusterId, data.x, data.y, data.structureId)
    lot.connections = new Set<number>(data.connections)
    return lot
  }
}

export class Cluster {
  id: number
  center: Point
  lots: Lot[]

  constructor(id: number, center: Point) {
    this.id = id
    this.center = center
    this.lots = []
  }

  toJSON() {
    return {
      id: this.id,
      center: this.center,
      lots: this.lots.map(l => l.toJSON())
    }
  }

  static fromJSON(data: any) {
    const cluster = new Cluster(data.id, data.center)
    cluster.lots = data.lots.map((l: any) => Lot.fromJSON(l))
    return cluster
  }
}

export class Map {
  clusters: Cluster[]
  width: number
  height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.clusters = []
  }

  toJSON() {
    return {
      width: this.width,
      height: this.height,
      clusters: this.clusters.map(c => c.toJSON())
    }
  }

  static fromJSON(data: any) {
    const map = new Map(data.width, data.height)
    map.clusters = data.clusters.map((c: any) => Cluster.fromJSON(c))
    return map
  }
}

export function generateMap(
  numClusters: number,
  size: { width: number; height: number }
) {
  const map = new Map(size.width, size.height)
  let lotId = 0
  const radius = Math.min(size.width, size.height) * 0.1

  for (let i = 0; i < numClusters; i++) {
    const center = {
      x: Math.random() * size.width,
      y: Math.random() * size.height
    }
    const cluster = new Cluster(i, center)
    const lotCount = Math.floor(Math.random() * 8) + 3

    for (let j = 0; j < lotCount; j++) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * radius
      const x = Math.max(0, Math.min(size.width, center.x + Math.cos(angle) * dist))
      const y = Math.max(0, Math.min(size.height, center.y + Math.sin(angle) * dist))
      const lot = new Lot(lotId++, cluster.id, x, y)
      cluster.lots.push(lot)
    }

    for (let a = 0; a < cluster.lots.length; a++) {
      for (let b = a + 1; b < cluster.lots.length; b++) {
        const la = cluster.lots[a]
        const lb = cluster.lots[b]
        la.connections.add(lb.id)
        lb.connections.add(la.id)
      }
    }

    map.clusters.push(cluster)
  }

  for (let i = 0; i < map.clusters.length - 1; i++) {
    const current = map.clusters[i]
    const next = map.clusters[i + 1]
    let min = Infinity
    let lotA: Lot | null = null
    let lotB: Lot | null = null

    for (const a of current.lots) {
      for (const b of next.lots) {
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < min) {
          min = d
          lotA = a
          lotB = b
        }
      }
    }

    if (lotA && lotB) {
      lotA.connections.add(lotB.id)
      lotB.connections.add(lotA.id)
    }
  }

  return map
}
