import type { Territory } from './types';

const points = [
  [120, 90], [250, 80], [380, 90], [510, 95], [640, 105], [770, 95],
  [95, 200], [225, 210], [355, 205], [485, 210], [615, 210], [745, 215],
  [115, 320], [245, 325], [375, 320], [505, 320], [635, 325], [765, 315],
  [145, 450], [275, 440], [405, 445], [535, 440], [665, 450], [795, 440],
] as const;

const adjacency: number[][] = points.map(() => []);

function connect(a: number, b: number): void {
  adjacency[a].push(b);
  adjacency[b].push(a);
}

const horizontalPairs: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [6, 7], [7, 8], [8, 9], [9, 10], [10, 11],
  [12, 13], [13, 14], [14, 15], [15, 16], [16, 17],
  [18, 19], [19, 20], [20, 21], [21, 22], [22, 23],
];

const verticalPairs: Array<[number, number]> = [
  [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11],
  [6, 12], [7, 13], [8, 14], [9, 15], [10, 16], [11, 17],
  [12, 18], [13, 19], [14, 20], [15, 21], [16, 22], [17, 23],
];

const diagonalPairs: Array<[number, number]> = [
  [0, 7], [1, 8], [2, 9], [3, 10], [4, 11],
  [6, 13], [7, 14], [8, 15], [9, 16], [10, 17],
  [12, 19], [13, 20], [14, 21], [15, 22], [16, 23],
];

for (const pair of [...horizontalPairs, ...verticalPairs, ...diagonalPairs]) {
  connect(pair[0], pair[1]);
}

export function createInitialMap(): Territory[] {
  return points.map(([x, y], id) => ({
    id,
    x,
    y,
    owner: getInitialOwner(id),
    units: getInitialUnits(id),
    productionRate: getProductionRate(id),
    connections: adjacency[id],
  }));
}

function getInitialOwner(id: number): Territory['owner'] {
  if ([0, 6, 12].includes(id)) {
    return 'player';
  }

  if ([11, 17, 23].includes(id)) {
    return 'enemy';
  }

  return 'neutral';
}

function getInitialUnits(id: number): number {
  if ([0, 6, 12, 11, 17, 23].includes(id)) {
    return 24;
  }

  return 12;
}

function getProductionRate(id: number): number {
  const highValue = [8, 9, 14, 15];
  return highValue.includes(id) ? 0.18 : 0.12;
}
