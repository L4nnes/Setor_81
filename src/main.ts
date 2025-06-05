import './style.css'

type MapGrid = number[][]

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = ''

const canvas = document.createElement('canvas')
canvas.width = 400
canvas.height = 400
app.appendChild(canvas)

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

let viewport = { x: 0, y: 0 }
let map: MapGrid = []
let keyHandler: ((e: KeyboardEvent) => void) | undefined

function generateMap(): void {
  map = []
  const rows = 20
  const cols = 20
  for (let y = 0; y < rows; y++) {
    const row: number[] = []
    for (let x = 0; x < cols; x++) {
      row.push(Math.random() > 0.5 ? 1 : 0)
    }
    map.push(row)
  }
}

function drawMap(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const tile = 20
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      ctx.fillStyle = map[y][x] ? '#646cff' : '#1a1a1a'
      ctx.fillRect(x * tile + viewport.x, y * tile + viewport.y, tile - 1, tile - 1)
    }
  }
}

function init(): void {
  if (keyHandler) {
    window.removeEventListener('keydown', keyHandler)
  }

  viewport = { x: 0, y: 0 }
  generateMap()
  drawMap()

  keyHandler = (ev: KeyboardEvent): void => {
    const step = 20
    switch (ev.key) {
      case 'ArrowUp':
        viewport.y += step
        drawMap()
        break
      case 'ArrowDown':
        viewport.y -= step
        drawMap()
        break
      case 'ArrowLeft':
        viewport.x += step
        drawMap()
        break
      case 'ArrowRight':
        viewport.x -= step
        drawMap()
        break
      case 'r':
      case 'R':
        init()
        break
    }
  }

  window.addEventListener('keydown', keyHandler)
}

init()

