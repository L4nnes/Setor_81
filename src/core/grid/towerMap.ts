import { TowerId } from './towerId';
import { TowerRect } from './towerRect';

export class TowerMap<T> {
  private data: Array<T | undefined> = [];
  private _bounds: TowerRect = TowerRect.invalid();
  private _len = 0;

  static withBounds<T>(bounds: TowerRect): TowerMap<T> {
    const map = new TowerMap<T>();
    map.resetBounds(bounds);
    return map;
  }

  bounds(): TowerRect {
    return this._bounds;
  }

  resetBounds(bounds: TowerRect): void {
    this._bounds = bounds;
    this.clear();
  }

  clear(): void {
    this.data = new Array(this._bounds.area()).fill(undefined);
    this._len = 0;
  }

  contains(towerId: TowerId): boolean {
    return this.get(towerId) !== undefined;
  }

  get(towerId: TowerId): T | undefined {
    const index = this.index(towerId);
    return index === null ? undefined : this.data[index];
  }

  set(towerId: TowerId, value: T): T | undefined {
    const index = this.index(towerId);
    if (index === null) {
      throw new Error(
        `TowerMap index out of bounds: bounds=${JSON.stringify(this._bounds)} tower=${towerId.key()}`,
      );
    }

    const previous = this.data[index];
    this.data[index] = value;
    if (previous === undefined) {
      this._len += 1;
    }
    return previous;
  }

  remove(towerId: TowerId): T | undefined {
    const index = this.index(towerId);
    if (index === null) return undefined;

    const previous = this.data[index];
    if (previous !== undefined) {
      this.data[index] = undefined;
      this._len -= 1;
    }
    return previous;
  }

  len(): number {
    return this._len;
  }

  isEmpty(): boolean {
    return this._len === 0;
  }

  *entries(): IterableIterator<[TowerId, T]> {
    for (const id of this._bounds.values()) {
      const value = this.get(id);
      if (value !== undefined) {
        yield [id, value];
      }
    }
  }

  private index(towerId: TowerId): number | null {
    if (!this._bounds.contains(towerId)) return null;
    const d = this._bounds.dimensions();
    const relX = towerId.x - this._bounds.bottomLeft.x;
    const relY = towerId.y - this._bounds.bottomLeft.y;
    return relX + relY * d.width;
  }
}
