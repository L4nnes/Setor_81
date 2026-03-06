import { WORLD_SIZE } from './worldChunks';
import { TowerId } from './towerId';
import { ChunkRect } from './chunkRect';

export class TowerRect {
  public readonly bottomLeft: TowerId;
  public readonly topRight: TowerId;

  constructor(bottomLeft: TowerId, topRight: TowerId) {
    this.bottomLeft = bottomLeft;
    this.topRight = topRight;
  }

  static invalid(): TowerRect {
    return new TowerRect(
      new TowerId(WORLD_SIZE - 1, WORLD_SIZE - 1),
      new TowerId(0, 0),
    );
  }

  static newCentered(center: TowerId, width: number, height: number): TowerRect {
    if (width <= 0 || height <= 0) {
      return TowerRect.invalid();
    }

    const halfW = Math.floor(width / 2);
    const halfH = Math.floor(height / 2);

    const bottomLeft = new TowerId(center.x - halfW, center.y - halfH);
    const topRight = new TowerId(
      center.x + Math.floor((width + 1) / 2) - 1,
      center.y + Math.floor((height + 1) / 2) - 1,
    );

    return new TowerRect(bottomLeft, topRight);
  }

  static bounding(towerIds: Iterable<TowerId>): TowerRect {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let found = false;

    for (const towerId of towerIds) {
      found = true;
      minX = Math.min(minX, towerId.x);
      minY = Math.min(minY, towerId.y);
      maxX = Math.max(maxX, towerId.x);
      maxY = Math.max(maxY, towerId.y);
    }

    if (!found) {
      return TowerRect.invalid();
    }

    return new TowerRect(new TowerId(minX, minY), new TowerId(maxX, maxY));
  }

  dimensions(): { width: number; height: number } {
    return {
      width: this.topRight.x - this.bottomLeft.x + 1,
      height: this.topRight.y - this.bottomLeft.y + 1,
    };
  }

  area(): number {
    if (!this.isValid()) return 0;
    const d = this.dimensions();
    return d.width * d.height;
  }

  isValid(): boolean {
    return this.topRight.x >= this.bottomLeft.x && this.topRight.y >= this.bottomLeft.y;
  }

  contains(towerId: TowerId): boolean {
    return (
      towerId.x >= this.bottomLeft.x &&
      towerId.y >= this.bottomLeft.y &&
      towerId.x <= this.topRight.x &&
      towerId.y <= this.topRight.y
    );
  }

  addMargin(margin: number): TowerRect {
    if (!this.isValid()) return this;

    return new TowerRect(
      new TowerId(
        Math.max(0, this.bottomLeft.x - margin),
        Math.max(0, this.bottomLeft.y - margin),
      ),
      new TowerId(
        this.topRight.x + margin,
        this.topRight.y + margin,
      ),
    );
  }

  clampTo(other: TowerRect): TowerRect {
    return new TowerRect(
      new TowerId(
        Math.max(this.bottomLeft.x, other.bottomLeft.x),
        Math.max(this.bottomLeft.y, other.bottomLeft.y),
      ),
      new TowerId(
        Math.min(this.topRight.x, other.topRight.x),
        Math.min(this.topRight.y, other.topRight.y),
      ),
    );
  }

  union(other: TowerRect): TowerRect {
    if (!this.isValid()) return other;
    if (!other.isValid()) return this;

    return new TowerRect(
      new TowerId(
        Math.min(this.bottomLeft.x, other.bottomLeft.x),
        Math.min(this.bottomLeft.y, other.bottomLeft.y),
      ),
      new TowerId(
        Math.max(this.topRight.x, other.topRight.x),
        Math.max(this.topRight.y, other.topRight.y),
      ),
    );
  }

  toChunkRect(): ChunkRect {
    return ChunkRect.fromTowerRect(this);
  }

  *values(): IterableIterator<TowerId> {
    for (let y = this.bottomLeft.y; y <= this.topRight.y; y++) {
      for (let x = this.bottomLeft.x; x <= this.topRight.x; x++) {
        yield new TowerId(x, y);
      }
    }
  }
}
