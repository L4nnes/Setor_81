import { Map } from './map'

interface Viewport {
  x: number
  y: number
  scale: number
}

export class Renderer {
  private readonly map: Map
  private readonly ctx: CanvasRenderingContext2D
  private readonly tileSize: number
  private viewport: Viewport
  private readonly speed = 20

  constructor(map: Map, ctx: CanvasRenderingContext2D, tileSize = 32) {
    this.map = map
    this.ctx = ctx
    this.tileSize = tileSize
    this.viewport = { x: 0, y: 0, scale: 1 }
  }

  attachListeners(canvas: HTMLCanvasElement): void {
    window.addEventListener('keydown', this.onKeyDown)
    canvas.addEventListener('wheel', this.onWheel, { passive: false })
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    switch (e.key.toLowerCase()) {
      case 'w':
        this.viewport.y -= this.speed
        break
      case 's':
        this.viewport.y += this.speed
        break
      case 'a':
        this.viewport.x -= this.speed
        break
      case 'd':
        this.viewport.x += this.speed
        break
      default:
        return
    }
    this.clamp()
  }

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault()
    const zoom = e.deltaY > 0 ? 0.9 : 1.1
    const { offsetX, offsetY } = e
    const worldX = (offsetX + this.viewport.x) / this.viewport.scale
    const worldY = (offsetY + this.viewport.y) / this.viewport.scale
    this.viewport.scale = Math.min(4, Math.max(0.5, this.viewport.scale * zoom))
    this.viewport.x = worldX * this.viewport.scale - offsetX
    this.viewport.y = worldY * this.viewport.scale - offsetY
    this.clamp()
  }

  private clamp(): void {
    const maxX = this.map.width * this.tileSize * this.viewport.scale - this.ctx.canvas.width
    const maxY = this.map.height * this.tileSize * this.viewport.scale - this.ctx.canvas.height
    this.viewport.x = Math.min(Math.max(this.viewport.x, 0), Math.max(0, maxX))
    this.viewport.y = Math.min(Math.max(this.viewport.y, 0), Math.max(0, maxY))
  }

  render(): void {
    const { ctx } = this
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.save()
    ctx.scale(this.viewport.scale, this.viewport.scale)
    ctx.translate(-this.viewport.x / this.viewport.scale, -this.viewport.y / this.viewport.scale)

    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        ctx.fillStyle = this.map.get(x, y) === 1 ? '#444' : '#ddd'
        ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize)
      }
    }

    ctx.restore()
  }
}
