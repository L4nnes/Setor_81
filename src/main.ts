import './style.css';
import { runBotTick } from './ai/bot';
import { createInitialGameState } from './core/gameState';
import { runSimulationTick } from './core/simulation';
import { createTickAccumulator } from './core/tick';
import { MouseController } from './input/mouseController';
import { CanvasRenderer } from './render/canvasRenderer';
import { createCamera } from './render/camera';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('App root not found');
}

app.innerHTML = `
  <div class="layout">
    <h1>Setor 81 — V0.1</h1>
    <p>Clique em um território azul e depois em um território conectado para enviar 50% das tropas.</p>
    <canvas id="game" width="920" height="560"></canvas>
  </div>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (!canvas) {
  throw new Error('Canvas not found');
}

const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('2D context not available');
}

const camera = createCamera(canvas.width, canvas.height);
void camera;

const state = createInitialGameState();
const renderer = new CanvasRenderer(ctx);
const mouseController = new MouseController(canvas, () => state);
const accumulator = createTickAccumulator();

let lastTimestamp = performance.now();

function frame(now: number): void {
  const deltaMs = now - lastTimestamp;
  lastTimestamp = now;

  const steps = accumulator.pushFrameDelta(deltaMs);
  for (let i = 0; i < steps; i += 1) {
    runSimulationTick(state, runBotTick);
  }

  renderer.render(state);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

window.addEventListener('beforeunload', () => {
  mouseController.destroy();
});
