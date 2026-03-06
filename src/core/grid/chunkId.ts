import { CHUNK_SIZE, type ChunkCoord, type TowerCoord, assertInteger } from './worldChunks';
import { TowerId } from './towerId';

export class ChunkId {
  public readonly x: number;
  public readonly y: number;

  constructor(x: number, y: number) {
    assertInteger(x, 'ChunkId.x');
    assertInteger(y, 'ChunkId.y');
    this.x = x;
    this.y = y;
  }

  static fromTowerId(towerId: TowerId): ChunkId {
    return new ChunkId(
      Math.floor(towerId.x / CHUNK_SIZE),
      Math.floor(towerId.y / CHUNK_SIZE),
    );
  }

  toCoord(): ChunkCoord {
    return { x: this.x, y: this.y };
  }

  equals(other: ChunkId): boolean {
    return this.x === other.x && this.y === other.y;
  }

  compare(other: ChunkId): number {
    if (this.y !== other.y) return this.y - other.y;
    return this.x - other.x;
  }

  bottomLeft(): TowerId {
    return new TowerId(this.x * CHUNK_SIZE, this.y * CHUNK_SIZE);
  }

  topRight(): TowerId {
    return new TowerId(
      this.x * CHUNK_SIZE + (CHUNK_SIZE - 1),
      this.y * CHUNK_SIZE + (CHUNK_SIZE - 1),
    );
  }

  key(): string {
    return `${this.x},${this.y}`;
  }
}

export class RelativeTowerId {
  public readonly value: number;

  constructor(value: number) {
    assertInteger(value, 'RelativeTowerId.value');
    this.value = value;
  }

  static fromTowerId(towerId: TowerId): RelativeTowerId {
    const rx = towerId.x % CHUNK_SIZE;
    const ry = towerId.y % CHUNK_SIZE;
    return new RelativeTowerId(rx + ry * CHUNK_SIZE);
  }

  toVec(): TowerCoord {
    return {
      x: this.value % CHUNK_SIZE,
      y: Math.floor(this.value / CHUNK_SIZE),
    };
  }

  upgrade(chunkId: ChunkId): TowerId {
    const base = chunkId.bottomLeft();
    const rel = this.toVec();
    return new TowerId(base.x + rel.x, base.y + rel.y);
  }
}
