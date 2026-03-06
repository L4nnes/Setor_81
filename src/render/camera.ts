export interface Camera {
  width: number;
  height: number;
}

export function createCamera(width: number, height: number): Camera {
  return { width, height };
}
