import { TowerId } from '../grid/towerId';
import { type TowerType, towerRangedDistance } from './towerType';
import { Speed, Unit, unitIsMobile, unitSpeed, unitWeight } from './unit';
import { Units } from './units';
import { Path } from './path';

export type PlayerId = number | string;

export class Force {
  path: Path;
  pathProgress: number;
  fuel: number;
  playerId: PlayerId | null;
  units: Units;

  constructor(playerId: PlayerId | null, units: Units, path: Path) {
    if (units.isEmpty()) {
      throw new Error('Force cannot be created with empty units');
    }
    if (playerId === null && units.available(Unit.Ruler) !== 0) {
      throw new Error('Force without player cannot contain ruler');
    }

    this.playerId = playerId;
    this.units = units;
    this.path = path;
    this.pathProgress = 0;
    this.fuel = 150;
  }

  static new(playerId: PlayerId, units: Units, path: Path): Force {
    return new Force(playerId, units, path);
  }

  clone(): Force {
    const cloned = new Force(
      this.playerId,
      this.units.clone(),
      this.path.clone(),
    );
    cloned.pathProgress = this.pathProgress;
    cloned.fuel = this.fuel;
    return cloned;
  }

  currentSource(): TowerId {
    return this.path.comingFrom();
  }

  currentDestination(): TowerId {
    return this.path.goingTo();
  }

  getPath(): Path {
    return this.path;
  }

  interpolatedPosition(timeSinceTick: number, tickPeriodSecs: number): { x: number; y: number } {
    const source = this.currentSource().asVec2();
    const destination = this.currentDestination().asVec2();

    const t = Math.min(
      1,
      (this.pathProgress +
        timeSinceTick * (1 / tickPeriodSecs) * this.progressPerTick()) /
        this.progressRequired(),
    );

    return {
      x: source.x + (destination.x - source.x) * t,
      y: source.y + (destination.y - source.y) * t,
    };
  }

  halt(): void {
    this.path = this.path.takeFirst(2);
  }

  halted(): Force {
    const clone = new Force(
      this.playerId,
      this.units.clone(),
      this.path.takeFirst(2),
    );
    clone.pathProgress = this.pathProgress;
    clone.fuel = this.fuel;
    return clone;
  }

  tryMoveOn(
    towerType: TowerType,
    towerUnits: Units,
    ally: PlayerId | null,
    supplyLine: Path | null,
  ): boolean {
    if (this.path.isEmpty() || ally !== null) {
      if (
        supplyLine !== null &&
        towerRangedDistance(towerType) === null &&
        this.units.isMany()
      ) {
        this.path = supplyLine.clone();

        if (ally !== null) {
          this.playerId = ally;
        } else {
          void towerUnits;
        }
      } else {
        return false;
      }
    }

    this.pathProgress = 0;

    if (this.units.isMany()) {
      this.fuel -= 1;
    }

    return true;
  }

  progressPerTick(): number {
    switch (this.speed()) {
      case Speed.Immobile:
        return 0;
      case Speed.Slow:
        return 1;
      case Speed.Normal:
        return 2;
      case Speed.Fast:
        return 3;
      default:
        return 0;
    }
  }

  progressRequired(maxRoadLength = 5): number {
    const distance = this.currentSource().distance(this.currentDestination());
    return Math.min(255, Math.floor((distance * 180) / maxRoadLength / 2));
  }

  speed(): Speed {
    const choppers = this.units.available(Unit.Chopper);

    if (choppers !== 0) {
      const weight = this.units
        .iter()
        .reduce((sum, [unit, count]) => sum + unitWeight(unit) * count, 0);

      const maxWeight = choppers * 4;

      if (weight <= maxWeight) {
        return Speed.Fast;
      }

      const slowWeight = this.units
        .iter()
        .filter(([unit]) => unitSpeed(unit, null) < Speed.Normal)
        .reduce((sum, [unit, count]) => sum + unitWeight(unit) * count, 0);

      if (slowWeight <= maxWeight) {
        return Speed.Normal;
      }

      return Speed.Slow;
    }

    const speeds = this.units
      .iter()
      .map(([unit]) => {
        if (!unitIsMobile(unit, null)) {
          throw new Error(`Non-mobile unit ${unit} found in force`);
        }
        return unitSpeed(unit, null);
      });

    if (speeds.length === 0) {
      return Speed.Fast;
    }

    return speeds.reduce((min, current) => (current < min ? current : min), speeds[0]);
  }

  rawTick(assertCurrentSourceEquals?: TowerId): boolean {
    this.pathProgress = Math.min(
      255,
      this.pathProgress + this.progressPerTick(),
    );

    if (this.pathProgress >= this.progressRequired()) {
      this.path.pop();

      if (assertCurrentSourceEquals) {
        const source = this.currentSource();
        if (!source.equals(assertCurrentSourceEquals)) {
          throw new Error(
            `Force source mismatch after arrival: expected ${assertCurrentSourceEquals.key()} got ${source.key()}`,
          );
        }
      }

      return true;
    }

    return false;
  }

  tick(inboundTowerId: TowerId): boolean {
    if (this.currentSource().equals(inboundTowerId)) {
      throw new Error('Force.tick inboundTowerId cannot equal current source');
    }

    return this.rawTick(inboundTowerId);
  }
}
