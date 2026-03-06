import { WORLD_SIZE } from './worldChunks';
import { TowerId, type TowerNeighbor, towerNeighborOpposite } from './towerId';

class TowerConnectivityTable {
  private readonly table: Array<Array<TowerNeighbor | null>>;

  constructor() {
    this.table = Array.from({ length: WORLD_SIZE }, () =>
      Array<TowerNeighbor | null>(WORLD_SIZE).fill(null),
    );

    const center = TowerId.centerOfWorld();
    const centerNeighbors = center.neighbors();
    if (centerNeighbors.length > 0) {
      const firstNeighbor = center.neighborToUnchecked(centerNeighbors[0]);
      this.set(center, firstNeighbor);
    }

    const frontier: TowerId[] = [center];
    let head = 0;

    while (head < frontier.length) {
      const parent = frontier[head++];
      for (const [neighbor, towerId] of parent.neighborsEnumerated()) {
        if (this.get(towerId) !== null) continue;
        this.set(towerId, towerNeighborOpposite(neighbor));
        frontier.push(towerId);
      }
    }
  }

  get(towerId: TowerId): TowerNeighbor | null {
    if (!towerId.isValid()) return null;
    return this.table[towerId.y][towerId.x];
  }

  set(towerId: TowerId, neighbor: TowerNeighbor): void {
    if (!towerId.isValid()) return;
    this.table[towerId.y][towerId.x] = neighbor;
  }
}

const CONNECTIVITY = new TowerConnectivityTable();

export function towerConnectivity(towerId: TowerId): TowerNeighbor | null {
  return CONNECTIVITY.get(towerId);
}

export function towerConnectivityId(towerId: TowerId): TowerId | null {
  const neighbor = CONNECTIVITY.get(towerId);
  return neighbor === null ? null : towerId.neighborUnchecked(neighbor);
}
