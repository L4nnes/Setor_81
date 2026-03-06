import type { Force } from './types';

export function getForceProgress(force: Force, currentTick: number): number {
  if (force.durationTicks <= 0) {
    return 1;
  }

  const elapsedTicks = currentTick - force.startTick;
  return Math.max(0, Math.min(1, elapsedTicks / force.durationTicks));
}

export function hasForceArrived(force: Force, currentTick: number): boolean {
  return getForceProgress(force, currentTick) >= 1;
}
