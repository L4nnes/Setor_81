# Setor 81 — V0.1

Protótipo jogável de estratégia em tempo real com Canvas 2D e TypeScript.

## O que já existe na V0.1

- mapa fixo com 30 territórios conectados;
- geração automática de unidades;
- envio de 50% das tropas entre territórios vizinhos;
- combate simples e captura de território;
- bot inimigo com decisão básica por vantagem numérica;
- condição de vitória e derrota.

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço exibido no terminal (normalmente `http://localhost:5173`).

## Build

```bash
npm run build
```

## Controles

- Clique em um território azul para selecionar.
- Clique em um território vizinho para enviar tropas.
- O objetivo é conquistar todos os territórios vermelhos.
