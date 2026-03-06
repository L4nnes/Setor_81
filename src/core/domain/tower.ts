import { Unit, unitIsMobile } from './unit';
import { Units } from './units';
import {
  type TowerType,
  towerGeneratesMobileUnits,
  towerUnitGeneration,
} from './towerType';

export type PlayerId = number | string;

export class Tower {
  static readonly RULER_SHIELD_BOOST = 10;

  playerId: PlayerId | null = null;
  units: Units = new Units();
  towerType: TowerType;
  delay: number | null = null;

  // Temporários até o Bloco 3
  inboundForces: unknown[] = [];
  outboundForces: unknown[] = [];
  supplyLine: unknown | null = null;

  constructor(towerType: TowerType) {
    this.towerType = towerType;
  }

  static withType(towerType: TowerType): Tower {
    return new Tower(towerType);
  }

  active(): boolean {
    return this.delay === null;
  }

  canDestroy(): boolean {
    return this.inboundForces.length === 0 && this.playerId === null;
  }

  forceUnits(): Units {
    const ret = new Units();

    for (const [unit, count] of this.units.iter()) {
      if (!unitIsMobile(unit, this.towerType)) continue;
      ret.add(unit, count);
    }

    return ret;
  }

  takeForceUnits(): Units {
    const ret = this.forceUnits();

    for (const [unit, count] of ret.iter()) {
      if (!unitIsMobile(unit, this.towerType)) {
        throw new Error(`Unit ${unit} is not mobile for tower ${this.towerType}`);
      }
      const removed = this.units.subtract(unit, count);
      if (removed !== count) {
        throw new Error(`Subtraction mismatch for ${unit}`);
      }
    }

    return ret;
  }

  diminishUnitsIfDeadOrOverflow(): number {
    let mobileUnitsLost = 0;

    for (const unit of Object.values(Unit)) {
      if (
        this.playerId === null ||
        this.units.available(unit) > this.units.capacity(unit, this.towerType)
      ) {
        const removed = this.units.subtract(unit, 1);
        if (unitIsMobile(unit, this.towerType)) {
          mobileUnitsLost += removed;
        }
      }
    }

    return mobileUnitsLost;
  }

  unitGeneration(unit: Unit): number | null {
    if (unit !== Unit.Shield && this.units.hasRuler()) {
      return null;
    }
    return towerUnitGeneration(this.towerType, unit);
  }

  generatesMobileUnits(): boolean {
    return towerGeneratesMobileUnits(this.towerType);
  }

  reconcileUnits(): void {
    this.units.reconcile(this.towerType, this.playerId !== null);
  }

  setPlayerId(next: PlayerId | null): void {
    if (this.playerId === next) {
      throw new Error('setPlayerId called with same value');
    }

    if (this.playerId === null && next !== null) {
      if (this.supplyLine !== null) {
        throw new Error('Expected null supplyLine when claiming unowned tower');
      }
      if (this.units.contains(Unit.Ruler) || this.units.contains(Unit.Shield)) {
        throw new Error('Unexpected ruler/shield while claiming tower');
      }
    }

    if (this.playerId !== null) {
      this.supplyLine = null;
      if (this.units.contains(Unit.Ruler) || this.units.contains(Unit.Shield)) {
        throw new Error('Unexpected ruler/shield while changing owned tower');
      }
    }

    this.playerId = next;
  }
}
