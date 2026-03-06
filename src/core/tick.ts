import { TICK_MS } from './constants';

export function createTickAccumulator() {
  let accumulator = 0;

  return {
    pushFrameDelta(deltaMs: number): number {
      accumulator += deltaMs;
      let ticks = 0;

      while (accumulator >= TICK_MS) {
        accumulator -= TICK_MS;
        ticks += 1;
      }

      return ticks;
    },
  };
}
