export const WORLD_SIZE = 512;
export const CHUNK_SIZE = 16;
export const WORLD_SIZE_CHUNKS = Math.floor(WORLD_SIZE / CHUNK_SIZE);

export type ChunkCoord = {
  x: number;
  y: number;
};

export type TowerCoord = {
  x: number;
  y: number;
};

export function isPowerOfTwo(value: number): boolean {
  return value > 0 && (value & (value - 1)) === 0;
}

export function assertInteger(value: number, name: string): void {
  if (!Number.isInteger(value)) {
    throw new Error(`${name} must be an integer, got ${value}`);
  }
}

export function clampInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

export function inWorldBounds(x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < WORLD_SIZE && y < WORLD_SIZE;
}

import { ChunkId } from './chunkId';
import { TowerId } from './towerId';
import { TowerRect } from './towerRect';

export class ChunkMap<T> {
  private readonly chunks: Array<Array<T | undefined>>;

  constructor(initializer?: (chunkId: ChunkId) => T | undefined) {
    this.chunks = Array.from({ length: WORLD_SIZE_CHUNKS }, (_, y) =>
      Array.from({ length: WORLD_SIZE_CHUNKS }, (_, x) =>
        initializer ? initializer(new ChunkId(x, y)) : undefined,
      ),
    );
  }

  get(chunkId: ChunkId): T | undefined {
    return this.chunks[chunkId.y]?.[chunkId.x];
  }

  set(chunkId: ChunkId, value: T): T | undefined {
    const prev = this.chunks[chunkId.y][chunkId.x];
    this.chunks[chunkId.y][chunkId.x] = value;
    return prev;
  }

  remove(chunkId: ChunkId): T | undefined {
    const prev = this.get(chunkId);
    if (prev !== undefined) {
      this.chunks[chunkId.y][chunkId.x] = undefined;
    }
    return prev;
  }

  *entries(): IterableIterator<[ChunkId, T]> {
    for (let y = 0; y < WORLD_SIZE_CHUNKS; y++) {
      for (let x = 0; x < WORLD_SIZE_CHUNKS; x++) {
        const value = this.chunks[y][x];
        if (value !== undefined) {
          yield [new ChunkId(x, y), value];
        }
      }
    }
  }

  len(): number {
    let count = 0;
    for (const _entry of this.entries()) {
      count += 1;
    }
    return count;
  }

  retain(predicate: (chunkId: ChunkId, value: T) => boolean): void {
    for (let y = 0; y < WORLD_SIZE_CHUNKS; y++) {
      for (let x = 0; x < WORLD_SIZE_CHUNKS; x++) {
        const value = this.chunks[y][x];
        if (value === undefined) continue;
        const keep = predicate(new ChunkId(x, y), value);
        if (!keep) {
          this.chunks[y][x] = undefined;
        }
      }
    }
  }
}

export const WORLD_RECT = new TowerRect(
  new TowerId(0, 0),
  new TowerId(WORLD_SIZE - 1, WORLD_SIZE - 1),
);

export function worldContainsTower(towerId: TowerId): boolean {
  return WORLD_RECT.contains(towerId);
}

export function* iterateAllChunkIds(): IterableIterator<ChunkId> {
  for (let y = 0; y < WORLD_SIZE_CHUNKS; y++) {
    for (let x = 0; x < WORLD_SIZE_CHUNKS; x++) {
      yield new ChunkId(x, y);
    }
  }
}

export function* iterateAllTowerIds(): IterableIterator<TowerId> {
  for (let y = 0; y < WORLD_SIZE; y++) {
    for (let x = 0; x < WORLD_SIZE; x++) {
      yield new TowerId(x, y);
    }
  }
}
