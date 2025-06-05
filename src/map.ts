export class Map {
  readonly width: number
  readonly height: number
  private readonly tiles: number[][]

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.tiles = []
    for (let y = 0; y < height; y++) {
      const row: number[] = []
      for (let x = 0; x < width; x++) {
        row.push(Math.random() < 0.2 ? 1 : 0)
      }
      this.tiles.push(row)
    }
  }

  get(x: number, y: number): number {
    return this.tiles[y]?.[x] ?? 0
  }
}
