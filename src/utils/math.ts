export function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}
