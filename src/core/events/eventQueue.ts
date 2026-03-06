import { ChunkId } from '../grid/chunkId';
import { type AddressedChunkEvent, applyChunkEvent, type ChunkLike } from './chunkEvents';
import { type ChunkMaintenance, applyChunkMaintenance, type ChunkLikeMaintenance } from './chunkMaintenance';

export class EventQueue {
  private readonly chunkEvents: AddressedChunkEvent[] = [];
  private readonly maintenanceEvents: Array<{ chunkId: ChunkId; maintenance: ChunkMaintenance }> = [];

  enqueueChunkEvent(event: AddressedChunkEvent): void {
    this.chunkEvents.push(event);
  }

  enqueueChunkEvents(events: AddressedChunkEvent[]): void {
    for (const event of events) this.chunkEvents.push(event);
  }

  enqueueMaintenance(chunkId: ChunkId, maintenance: ChunkMaintenance): void {
    this.maintenanceEvents.push({ chunkId, maintenance });
  }

  clear(): void {
    this.chunkEvents.length = 0;
    this.maintenanceEvents.length = 0;
  }

  hasPending(): boolean {
    return this.chunkEvents.length > 0 || this.maintenanceEvents.length > 0;
  }

  size(): { chunkEvents: number; maintenanceEvents: number } {
    return { chunkEvents: this.chunkEvents.length, maintenanceEvents: this.maintenanceEvents.length };
  }

  drainMaintenance(
    getChunk: (chunkId: ChunkId) => ChunkLikeMaintenance | undefined,
    onInfo?: (payload: unknown) => void,
  ): void {
    const items = [...this.maintenanceEvents];
    this.maintenanceEvents.length = 0;
    for (const item of items) {
      const chunk = getChunk(item.chunkId);
      if (!chunk) throw new Error(`Missing chunk for maintenance ${item.chunkId.key()}`);
      applyChunkMaintenance(chunk, item.maintenance, { onInfo });
    }
  }

  drainChunkEvents(getChunk: (chunkId: ChunkId) => ChunkLike | undefined): void {
    const items = [...this.chunkEvents];
    this.chunkEvents.length = 0;
    for (const addressed of items) {
      const chunk = getChunk(addressed.dst);
      if (!chunk) throw new Error(`Missing destination chunk ${addressed.dst.key()}`);
      applyChunkEvent(chunk, addressed.event);
    }
  }
}
