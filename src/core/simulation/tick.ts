export const TICK_RATE = 4;
export const TICK_PERIOD_SECS = 1 / TICK_RATE;

export class Ticks {
  value: number;

  constructor(value = 0) {
    this.value = Math.max(0, Math.trunc(value));
  }

  clone(): Ticks {
    return new Ticks(this.value);
  }

  next(): Ticks {
    return new Ticks(this.value + 1);
  }

  advance(amount = 1): Ticks {
    return new Ticks(this.value + Math.max(0, Math.trunc(amount)));
  }

  equals(other: Ticks): boolean {
    return this.value === other.value;
  }

  toNumber(): number {
    return this.value;
  }

  toSeconds(): number {
    return this.value * TICK_PERIOD_SECS;
  }
}
