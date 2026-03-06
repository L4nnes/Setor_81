import { TowerId } from './towerId';
import { TowerMap } from './towerMap';
import { TowerRect } from './towerRect';

export class TowerSet {
  private readonly map: TowerMap<true>;

  constructor(bounds?: TowerRect) {
    this.map = bounds ? TowerMap.withBounds<true>(bounds) : new TowerMap<true>();
  }

  static withBounds(bounds: TowerRect): TowerSet {
    return new TowerSet(bounds);
  }

  resetBounds(bounds: TowerRect): void {
    this.map.resetBounds(bounds);
  }

  clear(): void {
    this.map.clear();
  }

  insert(towerId: TowerId): boolean {
    return this.map.set(towerId, true) === undefined;
  }

  remove(towerId: TowerId): boolean {
    return this.map.remove(towerId) !== undefined;
  }

  contains(towerId: TowerId): boolean {
    return this.map.contains(towerId);
  }

  len(): number {
    return this.map.len();
  }

  isEmpty(): boolean {
    return this.map.isEmpty();
  }

  *values(): IterableIterator<TowerId> {
    for (const [towerId] of this.map.entries()) {
      yield towerId;
    }
  }
}
