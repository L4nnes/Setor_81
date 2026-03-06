export type PlayerId = number | string;

export class Player {
  allies: Set<PlayerId>;
  newAlliances: Set<PlayerId>;

  constructor() {
    this.allies = new Set<PlayerId>();
    this.newAlliances = new Set<PlayerId>();
  }

  clone(): Player {
    const next = new Player();
    for (const ally of this.allies) next.allies.add(ally);
    for (const ally of this.newAlliances) next.newAlliances.add(ally);
    return next;
  }

  died(): void {
    this.allies.clear();
  }

  addAlly(playerId: PlayerId): void {
    this.allies.add(playerId);
  }

  newAlliance(playerId: PlayerId): void {
    this.newAlliances.add(playerId);
  }

  removeAlly(playerId: PlayerId): void {
    this.allies.delete(playerId);
  }

  removeDeadAlly(playerId: PlayerId): void {
    this.allies.delete(playerId);
  }

  clearNewAlliances(): void {
    this.newAlliances.clear();
  }
}

export type PlayerInput =
  | { type: 'DIED' }
  | { type: 'ADD_ALLY'; playerId: PlayerId }
  | { type: 'NEW_ALLIANCE'; playerId: PlayerId }
  | { type: 'REMOVE_ALLY'; playerId: PlayerId };

export type PlayerMaintenance =
  | { type: 'DIED' }
  | { type: 'REMOVE_DEAD_ALLY'; playerId: PlayerId };

export function applyPlayerInput(player: Player, input: PlayerInput): void {
  switch (input.type) {
    case 'DIED':
      player.died();
      return;
    case 'ADD_ALLY':
      player.addAlly(input.playerId);
      return;
    case 'NEW_ALLIANCE':
      player.newAlliance(input.playerId);
      return;
    case 'REMOVE_ALLY':
      player.removeAlly(input.playerId);
      return;
  }
}

export function applyPlayerMaintenance(player: Player, maintenance: PlayerMaintenance): void {
  switch (maintenance.type) {
    case 'DIED':
      player.died();
      return;
    case 'REMOVE_DEAD_ALLY':
      player.removeDeadAlly(maintenance.playerId);
      return;
  }
}
