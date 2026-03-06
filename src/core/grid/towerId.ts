import { WORLD_SIZE, inWorldBounds } from './worldChunks';
import { ChunkId, RelativeTowerId } from './chunkId';
import { TowerRect } from './towerRect';

const FNV_OFFSET = 2166136261 >>> 0;
const FNV_PRIME = 16777619 >>> 0;
const OFFSET_MASK = WORLD_SIZE - 1;

export type Vec2 = {
  x: number;
  y: number;
};

export const TowerNeighbor = {
  N: 0,
  NE: 1,
  E: 2,
  SE: 3,
  S: 4,
  SW: 5,
  W: 6,
  NW: 7,
} as const;

export type TowerNeighbor = (typeof TowerNeighbor)[keyof typeof TowerNeighbor];

const TOWER_NEIGHBOR_LABELS: Record<TowerNeighbor, string> = {
  [TowerNeighbor.N]: 'N',
  [TowerNeighbor.NE]: 'NE',
  [TowerNeighbor.E]: 'E',
  [TowerNeighbor.SE]: 'SE',
  [TowerNeighbor.S]: 'S',
  [TowerNeighbor.SW]: 'SW',
  [TowerNeighbor.W]: 'W',
  [TowerNeighbor.NW]: 'NW',
};

const NEIGHBOR_DELTAS: Record<TowerNeighbor, Vec2> = {
  [TowerNeighbor.N]: { x: 0, y: 1 },
  [TowerNeighbor.NE]: { x: 1, y: 1 },
  [TowerNeighbor.E]: { x: 1, y: 0 },
  [TowerNeighbor.SE]: { x: 1, y: -1 },
  [TowerNeighbor.S]: { x: 0, y: -1 },
  [TowerNeighbor.SW]: { x: -1, y: -1 },
  [TowerNeighbor.W]: { x: -1, y: 0 },
  [TowerNeighbor.NW]: { x: -1, y: 1 },
};

export function integerSqrt(value: number): number {
  return Math.floor(Math.sqrt(value));
}

function condense(input: number, bits: 8 | 16): number {
  if (bits === 16) {
    const low = input & 0xffff;
    const high = (input >>> 16) & 0xffff;
    return (low ^ high) >>> 0;
  }

  const low = input & 0xff;
  const high = (input >>> 8) & 0xff;
  return (low ^ high) >>> 0;
}

function fnvWriteU8(hash: number, u: number): number {
  let next = Math.imul(hash, FNV_PRIME) >>> 0;
  next = (next ^ (u & 0xff)) >>> 0;
  return next;
}

function fnvWriteU16(hash: number, u: number): number {
  const lo = u & 0xff;
  const hi = (u >>> 8) & 0xff;
  let next = fnvWriteU8(hash, lo);
  next = fnvWriteU8(next, hi);
  return next;
}

class OffsetTable {
  private readonly offsets: number[][];

  constructor() {
    this.offsets = Array.from({ length: WORLD_SIZE }, () => Array<number>(WORLD_SIZE).fill(0));

    for (let y = 0; y < WORLD_SIZE; y++) {
      for (let x = 0; x < WORLD_SIZE; x++) {
        let hash = FNV_OFFSET;
        hash = fnvWriteU16(hash, x);
        hash = fnvWriteU16(hash, y);
        const mixed = condense(condense(hash, 16), 8);
        const ox = (mixed & 3) + 1;
        const oy = ((mixed >>> 4) & 3) + 1;
        this.offsets[y][x] = ox | (oy << 4);
      }
    }
  }

  get(towerId: TowerId): Vec2 {
    const x = towerId.x & OFFSET_MASK;
    const y = towerId.y & OFFSET_MASK;
    const encoded = this.offsets[y][x];
    return {
      x: encoded & 15,
      y: (encoded >>> 4) & 15,
    };
  }
}

class NeighborTable {
  private readonly neighbors: number[][];

  constructor() {
    this.neighbors = Array.from({ length: WORLD_SIZE }, () => Array<number>(WORLD_SIZE).fill(0));

    for (let y = 0; y < WORLD_SIZE; y++) {
      for (let x = 0; x < WORLD_SIZE; x++) {
        const towerId = new TowerId(x, y);
        let bits = 0;

        for (const n of TowerId.neighborOrder()) {
          const delta = NEIGHBOR_DELTAS[n];
          const other = new TowerId(x + delta.x, y + delta.y);
          if (NeighborTable.areNeighbors(towerId, other)) {
            bits |= 1 << n;
          }
        }

        this.neighbors[y][x] = bits >>> 0;
      }
    }
  }

  private static areNeighbors(a: TowerId, b: TowerId): boolean {
    if (a.equals(b)) return false;
    if (!inWorldBounds(b.x, b.y)) return false;

    const distance = a.distanceSquared(b);
    if (distance > TowerId.MAX_ROAD_LENGTH_SQUARED) return false;

    const diagonal = b.x !== a.x && b.y !== a.y;
    if (diagonal) {
      const other1 = new TowerId(a.x, b.y);
      const other2 = new TowerId(b.x, a.y);
      const otherDistance = other1.distanceSquared(other2);
      if (otherDistance <= distance) return false;
    }

    return true;
  }

  getBits(towerId: TowerId): number {
    if (!inWorldBounds(towerId.x, towerId.y)) return 0;
    return this.neighbors[towerId.y][towerId.x];
  }
}

const OFFSET_TABLE = new OffsetTable();
const NEIGHBOR_TABLE = new NeighborTable();

export class TowerId {
  static readonly CONVERSION = 5;
  static readonly MAX_ROAD_LENGTH = 5;
  static readonly MAX_ROAD_LENGTH_SQUARED =
    Math.pow(TowerId.MAX_ROAD_LENGTH + 1, 2) - 1;

  public readonly x: number;
  public readonly y: number;

  constructor(x: number, y: number) {
    this.x = Math.trunc(x);
    this.y = Math.trunc(y);
  }

  static centerOfWorld(): TowerId {
    return new TowerId(Math.floor(WORLD_SIZE / 2), Math.floor(WORLD_SIZE / 2));
  }

  static neighborOrder(): TowerNeighbor[] {
    return [
      TowerNeighbor.N,
      TowerNeighbor.NE,
      TowerNeighbor.E,
      TowerNeighbor.SE,
      TowerNeighbor.S,
      TowerNeighbor.SW,
      TowerNeighbor.W,
      TowerNeighbor.NW,
    ];
  }

  static rounded(worldPosition: Vec2): TowerId {
    return new TowerId(
      Math.round(worldPosition.x / TowerId.CONVERSION),
      Math.round(worldPosition.y / TowerId.CONVERSION),
    );
  }

  static floor(worldPosition: Vec2): TowerId {
    return new TowerId(
      Math.floor(worldPosition.x / TowerId.CONVERSION),
      Math.floor(worldPosition.y / TowerId.CONVERSION),
    );
  }

  static ceil(worldPosition: Vec2): TowerId {
    return new TowerId(
      Math.ceil(worldPosition.x / TowerId.CONVERSION),
      Math.ceil(worldPosition.y / TowerId.CONVERSION),
    );
  }

  static closest(worldPosition: Vec2): TowerId | null {
    const rounded = TowerId.rounded(worldPosition);
    let closest: { towerId: TowerId; distance: number } | null = null;

    for (let x = rounded.x - 1; x <= rounded.x + 1; x++) {
      for (let y = rounded.y - 1; y <= rounded.y + 1; y++) {
        if (!inWorldBounds(x, y)) continue;
        const towerId = new TowerId(x, y);
        const distance = vecDistance(towerId.asVec2(), worldPosition);

        if (closest === null || distance < closest.distance) {
          closest = { towerId, distance };
        }
      }
    }

    return closest?.towerId ?? null;
  }

  equals(other: TowerId): boolean {
    return this.x === other.x && this.y === other.y;
  }

  key(): string {
    return `${this.x},${this.y}`;
  }

  isValid(): boolean {
    return this.x >= 0 && this.y >= 0 && this.x < WORLD_SIZE && this.y < WORLD_SIZE;
  }

  split(): [ChunkId, RelativeTowerId] {
    return [ChunkId.fromTowerId(this), RelativeTowerId.fromTowerId(this)];
  }

  offset(): Vec2 {
    return OFFSET_TABLE.get(this);
  }

  integerPosition(): Vec2 {
    const offset = this.offset();
    return {
      x: this.x * TowerId.CONVERSION + offset.x,
      y: this.y * TowerId.CONVERSION + offset.y,
    };
  }

  asVec2(): Vec2 {
    return this.integerPosition();
  }

  centerPosition(): Vec2 {
    return {
      x: this.x * TowerId.CONVERSION + TowerId.CONVERSION * 0.5,
      y: this.y * TowerId.CONVERSION + TowerId.CONVERSION * 0.5,
    };
  }

  floorPosition(): Vec2 {
    return {
      x: this.x * TowerId.CONVERSION,
      y: this.y * TowerId.CONVERSION,
    };
  }

  ceilPosition(): Vec2 {
    return {
      x: (this.x + 1) * TowerId.CONVERSION,
      y: (this.y + 1) * TowerId.CONVERSION,
    };
  }

  distanceSquared(other: TowerId): number {
    const a = this.integerPosition();
    const b = other.integerPosition();
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return dx * dx + dy * dy;
  }

  distance(other: TowerId): number {
    return integerSqrt(this.distanceSquared(other));
  }

  manhattanDistance(other: TowerId): number {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }

  isNeighbor(other: TowerId): boolean {
    return this.neighborTo(other) !== null;
  }

  neighbors(): TowerId[] {
    return this.neighborsEnumerated().map((pair) => pair[1]);
  }

  neighborsEnumerated(): Array<[TowerNeighbor, TowerId]> {
    const bits = NEIGHBOR_TABLE.getBits(this);
    const result: Array<[TowerNeighbor, TowerId]> = [];

    for (const neighbor of TowerId.neighborOrder()) {
      if ((bits & (1 << neighbor)) === 0) continue;
      result.push([neighbor, this.neighborUnchecked(neighbor)]);
    }

    return result;
  }

  neighborTo(other: TowerId): TowerNeighbor | null {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const neighbor = towerNeighborFromDelta(dx, dy);
    if (neighbor === null) return null;

    const bits = NEIGHBOR_TABLE.getBits(this);
    return (bits & (1 << neighbor)) !== 0 ? neighbor : null;
  }

  neighborToUnchecked(other: TowerId): TowerNeighbor {
    const neighbor = this.neighborTo(other);
    if (neighbor === null) {
      throw new Error(`Tower ${this.key()} and ${other.key()} are not valid neighbors`);
    }
    return neighbor;
  }

  neighbor(neighbor: TowerNeighbor): TowerId | null {
    const delta = NEIGHBOR_DELTAS[neighbor];
    const other = new TowerId(this.x + delta.x, this.y + delta.y);
    return this.isNeighbor(other) ? other : null;
  }

  neighborUnchecked(neighbor: TowerNeighbor): TowerId {
    const result = this.neighbor(neighbor);
    if (!result) {
      throw new Error(`Neighbor ${TOWER_NEIGHBOR_LABELS[neighbor]} does not exist for ${this.key()}`);
    }
    return result;
  }

  iterRadius(radius: number): TowerId[] {
    const center = this.asVec2();
    const radiusSquared = radius * radius;
    const r = Math.ceil(radius / TowerId.CONVERSION);

    const rect = new TowerRect(
      new TowerId(Math.max(0, this.x - r), Math.max(0, this.y - r)),
      new TowerId(this.x + r, this.y + r),
    );

    const result: TowerId[] = [];
    for (const id of rect.values()) {
      if (!inWorldBounds(id.x, id.y)) continue;
      if (vecDistanceSquared(id.asVec2(), center) <= radiusSquared) {
        result.push(id);
      }
    }
    return result;
  }
}

export function towerNeighborOpposite(neighbor: TowerNeighbor): TowerNeighbor {
  return ((neighbor + 4) & 7) as TowerNeighbor;
}

export function towerNeighborFromDelta(dx: number, dy: number): TowerNeighbor | null {
  for (const key of TowerId.neighborOrder()) {
    const delta = NEIGHBOR_DELTAS[key];
    if (delta.x === dx && delta.y === dy) {
      return key;
    }
  }
  return null;
}

export function towerNeighborDelta(neighbor: TowerNeighbor): Vec2 {
  return NEIGHBOR_DELTAS[neighbor];
}

function vecDistance(a: Vec2, b: Vec2): number {
  return Math.sqrt(vecDistanceSquared(a, b));
}

function vecDistanceSquared(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

