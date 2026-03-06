import { ChunkId } from '../grid/chunkId';
import { TowerId } from '../grid/towerId';
import { Player, type PlayerId, applyPlayerInput, applyPlayerMaintenance, type PlayerInput, type PlayerMaintenance } from '../domain/player';
import { Ticks } from './tick';
import { EventQueue } from '../events/eventQueue';
import {
  type ChunkInput,
  type ChunkLike,
  applyChunkInput,
} from '../events/chunkEvents';
import {
  type ChunkMaintenance,
} from '../events/chunkMaintenance';

export const WORLD_MAX_ROAD_LENGTH = 5;
export const WORLD_MAX_ROAD_LENGTH_SQUARED = Math.pow(WORLD_MAX_ROAD_LENGTH + 1, 2) - 1;
export const WORLD_MAX_PATH_ROADS = 16;

export type WorldInfoCallback = (payload: unknown) => void;

export class SingletonState {
  tick: Ticks;

  constructor() {
    this.tick = new Ticks(0);
  }

  nextTick(): void {
    this.tick = this.tick.next();
  }
}

export type WorldChunkMap = Map<string, ChunkLike>;
export type WorldPlayerMap = Map<PlayerId, Player>;

export class World {
  readonly chunks: WorldChunkMap;
  readonly players: WorldPlayerMap;
  readonly singleton: SingletonState;
  readonly eventQueue: EventQueue;

  constructor() {
    this.chunks = new Map();
    this.players = new Map();
    this.singleton = new SingletonState();
    this.eventQueue = new EventQueue();
  }

  chunkKey(chunkId: ChunkId): string {
    return chunkId.key();
  }

  getChunk(chunkId: ChunkId): ChunkLike | undefined {
    return this.chunks.get(this.chunkKey(chunkId));
  }

  setChunk(chunkId: ChunkId, chunk: ChunkLike): void {
    this.chunks.set(this.chunkKey(chunkId), chunk);
  }

  getOrCreatePlayer(playerId: PlayerId): Player {
    let player = this.players.get(playerId);
    if (!player) {
      player = new Player();
      this.players.set(playerId, player);
    }
    return player;
  }

  getPlayer(playerId: PlayerId): Player {
    const player = this.players.get(playerId);
    if (!player) {
      throw new Error(`Missing player ${String(playerId)}`);
    }
    return player;
  }

  haveAlliance(a: PlayerId, b: PlayerId): boolean {
    return this.getPlayer(a).allies.has(b) && this.getPlayer(b).allies.has(a);
  }

  dispatchChunkMaintenance(chunkId: ChunkId, maintenance: ChunkMaintenance): void {
    this.eventQueue.enqueueMaintenance(chunkId, maintenance);
  }

  dispatchPlayerMaintenance(playerId: PlayerId, maintenance: PlayerMaintenance): void {
    const player = this.getOrCreatePlayer(playerId);
    applyPlayerMaintenance(player, maintenance);
  }

  dispatchPlayerInput(playerId: PlayerId, input: PlayerInput): void {
    const player = this.getOrCreatePlayer(playerId);
    applyPlayerInput(player, input);
  }

  dispatchChunkInput(chunkId: ChunkId, input: ChunkInput, onInfo?: WorldInfoCallback): void {
    const chunk = this.getChunk(chunkId);
    if (!chunk) {
      throw new Error(`Missing chunk ${chunkId.key()}`);
    }

    applyChunkInput(chunk, input, {
      emitChunkEvent: (src, dst, event) => {
        this.eventQueue.enqueueChunkEvent({ src, dst, event });
      },
      onInfo,
    });
  }

  tickBeforeInputs(onInfo?: WorldInfoCallback): void {
    this.singleton.nextTick();

    for (const [, player] of this.players) {
      player.clearNewAlliances();
    }

    this.eventQueue.drainMaintenance(
      (chunkId) => this.getChunk(chunkId),
      onInfo,
    );
  }

  tickAfterInputs(): void {
    this.eventQueue.drainChunkEvents((chunkId) => this.getChunk(chunkId));
  }

  tickClient(
    chunkInputs: Array<{ chunkId: ChunkId; input: ChunkInput }> = [],
    playerInputs: Array<{ playerId: PlayerId; input: PlayerInput }> = [],
    playerMaintenance: Array<{ playerId: PlayerId; maintenance: PlayerMaintenance }> = [],
    chunkMaintenance: Array<{ chunkId: ChunkId; maintenance: ChunkMaintenance }> = [],
    onInfo?: WorldInfoCallback,
  ): void {
    for (const item of chunkMaintenance) {
      this.dispatchChunkMaintenance(item.chunkId, item.maintenance);
    }

    for (const item of playerMaintenance) {
      this.dispatchPlayerMaintenance(item.playerId, item.maintenance);
    }

    this.tickBeforeInputs(onInfo);

    for (const item of chunkInputs) {
      this.dispatchChunkInput(item.chunkId, item.input, onInfo);
    }

    for (const item of playerInputs) {
      this.dispatchPlayerInput(item.playerId, item.input);
    }

    this.tickAfterInputs();
  }

  distanceSquaredToCenter(towerId: TowerId): number {
    const center = TowerId.centerOfWorld();
    return center.distanceSquared(towerId);
  }
}
