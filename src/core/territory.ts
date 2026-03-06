import type { Territory } from './types';

export function getTerritoryById(territories: Territory[], id: number): Territory | undefined {
  return territories.find((territory) => territory.id === id);
}

export function areConnected(source: Territory, destinationId: number): boolean {
  return source.connections.includes(destinationId);
}
