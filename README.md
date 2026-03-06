# Setor 81 — V0.1

Protótipo jogável de um RTS minimalista no navegador, com **simulação determinística por ticks**.

## Visão do projeto

Setor 81 foi construído para ser pequeno no front-end (singleplayer local), mas com base arquitetural correta para evoluir para replay, sincronização e multiplayer no futuro.

A versão atual já inclui:
- mapa fixo com territórios conectados;
- produção automática de unidades;
- envio de forças agregadas entre territórios;
- combate simples na chegada;
- captura de territórios;
- bot inimigo básico;
- condição de vitória/derrota.

## Como rodar

```bash
npm install
npm run dev
```

Para build de produção:

```bash
npm run build
```

Para testes unitários:

```bash
npm run test
```

## Arquitetura

```text
/src
  /core
    types.ts
    constants.ts
    command.ts
    territory.ts
    force.ts
    map.ts
    gameState.ts
    combat.ts
    production.ts
    movement.ts
    capture.ts
    simulation.ts
    tick.ts
  /ai
    bot.ts
  /render
    canvasRenderer.ts
    camera.ts
    hud.ts
  /input
    mouseController.ts
  /utils
    math.ts
    helpers.ts
  main.ts
```

## Por que simulação por ticks?

A simulação usa **20 ticks por segundo** e separa completamente regra de jogo de renderização.

Pipeline de cada tick:
1. processa comandos em fila;
2. atualiza produção;
3. atualiza movimentação/chegadas;
4. resolve combate/captura;
5. executa IA do bot;
6. recalcula vitória/derrota.

Isso garante previsibilidade e facilita no futuro:
- aplicar comandos por tick com latência;
- reproduzir partida por sequência de comandos;
- sincronizar estado entre cliente/servidor;
- manter gameplay independente do FPS.
