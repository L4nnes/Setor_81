import { ChunkId } from './chunkId';
import { TowerRect } from './towerRect';

export class ChunkRect {
  public readonly bottomLeft: ChunkId;
  public readonly topRight: ChunkId;

  constructor(bottomLeft: ChunkId, topRight: ChunkId) {
    this.bottomLeft = bottomLeft;
    this.topRight = topRight;
  }

  static invalid(): ChunkRect {
    return new ChunkRect(new ChunkId(255, 255), new ChunkId(0, 0));
  }

  static fromTowerRect(rect: TowerRect): ChunkRect {
    return new ChunkRect(
      ChunkId.fromTowerId(rect.bottomLeft),
      ChunkId.fromTowerId(rect.topRight),
    );
  }

  isValid(): boolean {
    return this.topRight.x >= this.bottomLeft.x && this.topRight.y >= this.bottomLeft.y;
  }

  dimensions(): { width: number; height: number } {
    return {
      width: this.topRight.x - this.bottomLeft.x + 1,
      height: this.topRight.y - this.bottomLeft.y + 1,
    };
  }

  contains(chunkId: ChunkId): boolean {
    return (
      chunkId.x >= this.bottomLeft.x &&
      chunkId.y >= this.bottomLeft.y &&
      chunkId.x <= this.topRight.x &&
      chunkId.y <= this.topRight.y
    );
  }

  clampTo(other: ChunkRect): ChunkRect {
    return new ChunkRect(
      new ChunkId(
        Math.max(this.bottomLeft.x, other.bottomLeft.x),
        Math.max(this.bottomLeft.y, other.bottomLeft.y),
      ),
      new ChunkId(
        Math.min(this.topRight.x, other.topRight.x),
        Math.min(this.topRight.y, other.topRight.y),
      ),
    );
  }

  *values(): IterableIterator<ChunkId> {
    for (let y = this.bottomLeft.y; y <= this.topRight.y; y++) {
      for (let x = this.bottomLeft.x; x <= this.topRight.x; x++) {
        yield new ChunkId(x, y);
      }
    }
  }
}
