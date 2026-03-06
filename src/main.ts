import './style.css'
import { runBotAI } from './ai/bot'
import { registerPlayerInput } from './input/playerInput'
import { renderGame } from './render/canvasRenderer'
import { stepSimulation, TICKS_PER_SECOND } from './simulation/engine'
import { createInitialState } from './simulation/map'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) {
  throw new Error('Elemento #app não encontrado')
}

app.innerHTML = ''

const canvas = document.createElement('canvas')
canvas.width = 960
canvas.height = 660
app.appendChild(canvas)

const ctx = canvas.getContext('2d')
if (!ctx) {
  throw new Error('Canvas 2D indisponível')
}
const context = ctx

const state = createInitialState(30)
registerPlayerInput(canvas, state)

let accumulator = 0
let lastTime = performance.now()
const tickMs = 1000 / TICKS_PER_SECOND

function gameLoop(now: number): void {
  accumulator += now - lastTime
  lastTime = now

  while (accumulator >= tickMs) {
    stepSimulation(state, () => runBotAI(state))
    accumulator -= tickMs
  }

  renderGame(context, state)
  requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)
