import './style.css'
import { Map } from './map'
import { Renderer } from './renderer'

const app = document.querySelector<HTMLDivElement>('#app')!
const canvas = document.createElement('canvas')
canvas.width = 800
canvas.height = 600
app.innerHTML = ''
app.appendChild(canvas)

const ctx = canvas.getContext('2d')!
const map = new Map(50, 50)
const renderer = new Renderer(map, ctx)
renderer.attachListeners(canvas)

function loop(): void {
  renderer.render()
  requestAnimationFrame(loop)
}

loop()
