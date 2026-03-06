import test from 'node:test';
import assert from 'node:assert/strict';
import { createSendUnitsCommand } from '../command.js';
import { resolveArrivals } from '../combat.js';
import { getForceProgress } from '../force.js';
import { createInitialGameState } from '../gameState.js';
import { processSendUnitsCommand } from '../movement.js';
import { updateProduction } from '../production.js';

function getStateForTest() {
  const state = createInitialGameState();
  state.territories[0].units = 20;
  state.territories[1].owner = 'neutral';
  state.territories[1].units = 8;
  return state;
}

test('gera unidades por tick via buffer de produção', () => {
  const state = getStateForTest();
  state.territories[0].productionRate = 0.5;

  updateProduction(state);
  updateProduction(state);

  assert.equal(state.territories[0].units, 21);
});

test('envia força ao processar comando', () => {
  const state = getStateForTest();
  processSendUnitsCommand(state, createSendUnitsCommand('player', 0, 1));

  assert.equal(state.forces.length, 1);
  assert.equal(state.territories[0].units, 10);
  assert.equal(state.forces[0].units, 10);
});

test('resolve combate e captura território em ataque vencedor', () => {
  const state = getStateForTest();
  resolveArrivals(state, [
    {
      id: 1,
      owner: 'player',
      units: 12,
      originId: 0,
      destinationId: 1,
      startTick: 0,
      durationTicks: 30,
    },
  ]);

  assert.equal(state.territories[1].owner, 'player');
  assert.equal(state.territories[1].units, 4);
});

test('reduz defesa quando ataque não vence', () => {
  const state = getStateForTest();
  resolveArrivals(state, [
    {
      id: 1,
      owner: 'player',
      units: 6,
      originId: 0,
      destinationId: 1,
      startTick: 0,
      durationTicks: 30,
    },
  ]);

  assert.equal(state.territories[1].owner, 'neutral');
  assert.equal(state.territories[1].units, 2);
});

test('deriva progresso da força com base no tick', () => {
  const force = {
    id: 1,
    owner: 'player' as const,
    units: 10,
    originId: 0,
    destinationId: 1,
    startTick: 10,
    durationTicks: 20,
  };

  assert.equal(getForceProgress(force, 10), 0);
  assert.equal(getForceProgress(force, 20), 0.5);
  assert.equal(getForceProgress(force, 35), 1);
});
