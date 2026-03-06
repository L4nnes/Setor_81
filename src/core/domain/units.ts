import {
  ALWAYS_UNITS,
  MANY_UNITS,
  SINGLE_UNITS,
  Unit,
  UnitCategory,
  type Unit as UnitType,
  damageToFinite,
  unitCanCapture,
  unitCategory,
  unitForceGroundDamage,
  unitIsMobile,
  unitIsSingleUse,
  unitMaxOverflow,
  unitRangedDistance,
} from './unit';
import { type TowerType, rawUnitCapacity } from './towerType';

type SingleState = {
  unit: UnitType;
  count: number;
} | null;

export class Units {
  static readonly CAPACITY = 255;

  private readonly always = new Map<UnitType, number>();
  private readonly many = new Map<UnitType, number>();
  private single: SingleState = null;

  constructor() {
    for (const unit of ALWAYS_UNITS) this.always.set(unit, 0);
    for (const unit of MANY_UNITS) this.many.set(unit, 0);
  }

  clone(): Units {
    const next = new Units();
    for (const [unit, count] of this.always.entries()) next.always.set(unit, count);
    for (const [unit, count] of this.many.entries()) next.many.set(unit, count);
    next.single = this.single ? { ...this.single } : null;
    return next;
  }

  isMany(): boolean {
    return this.single === null;
  }

  available(unit: UnitType): number {
    switch (unitCategory(unit)) {
      case UnitCategory.Always:
        return this.always.get(unit) ?? 0;
      case UnitCategory.Many:
        return this.many.get(unit) ?? 0;
      case UnitCategory.Single:
        return this.single && this.single.unit === unit ? this.single.count : 0;
    }
  }

  contains(unit: UnitType): boolean {
    return this.available(unit) > 0;
  }

  hasRuler(): boolean {
    return this.contains(Unit.Ruler);
  }

  clear(): void {
    for (const unit of ALWAYS_UNITS) this.always.set(unit, 0);
    for (const unit of MANY_UNITS) this.many.set(unit, 0);
    this.single = null;
  }

  isEmpty(): boolean {
    return this.len() === 0;
  }

  iterWithZeros(): Array<[UnitType, number]> {
    return [
      ...ALWAYS_UNITS.map((u): [UnitType, number] => [u, this.available(u)]),
      ...MANY_UNITS.map((u): [UnitType, number] => [u, this.available(u)]),
      ...SINGLE_UNITS.map((u): [UnitType, number] => [u, this.available(u)]),
    ];
  }

  iter(): Array<[UnitType, number]> {
    return this.iterWithZeros().filter(([, count]) => count !== 0);
  }

  len(): number {
    return this.iter().reduce((sum, [, count]) => sum + count, 0);
  }

  capacity(unit: UnitType, towerType: TowerType | null): number {
    const raw = towerType ? rawUnitCapacity(towerType, unit) : Number.MAX_SAFE_INTEGER;
    const rulerBoost = unit === Unit.Shield && this.hasRuler() ? 10 : 0;
    return Math.min(Units.CAPACITY, raw + rulerBoost);
  }

  private spaceRemaining(unit: UnitType, towerType: TowerType | null, overflow: boolean): number {
    const category = unitCategory(unit);

    if (category === UnitCategory.Many && this.single !== null) {
      return 0;
    }

    if (category === UnitCategory.Single && this.single !== null && this.single.unit > unit) {
      return 0;
    }

    const max = this.capacity(unit, towerType) + (overflow ? unitMaxOverflow(unit) : 0);
    return Math.max(0, max - this.available(unit));
  }

  private addInner(
    unit: UnitType,
    count: number,
    towerType: TowerType | null,
    overflow: boolean,
  ): number {
    const added = Math.min(count, this.spaceRemaining(unit, towerType, overflow));
    if (unit === Unit.Ruler && count !== 0 && added !== 1) {
      throw new Error(`Could not add ruler to ${towerType ?? 'null'}`);
    }
    if (added === 0) return 0;

    switch (unitCategory(unit)) {
      case UnitCategory.Always:
        this.always.set(unit, this.available(unit) + added);
        break;
      case UnitCategory.Many:
        this.many.set(unit, this.available(unit) + added);
        break;
      case UnitCategory.Single:
        if (this.single === null) {
          this.single = { unit, count: added };
        } else if (this.single.unit === unit) {
          this.single.count += added;
        } else {
          this.single = { unit, count: added };
        }
        break;
    }

    return added;
  }

  add(unit: UnitType, count: number): number {
    return this.addInner(unit, count, null, true);
  }

  addToTower(unit: UnitType, count: number, towerType: TowerType, overflow: boolean): number {
    return this.addInner(unit, count, towerType, overflow);
  }

  subtract(unit: UnitType, count: number): number {
    const available = this.available(unit);
    const removed = Math.min(available, count);
    if (removed === 0) return 0;

    switch (unitCategory(unit)) {
      case UnitCategory.Always:
        this.always.set(unit, available - removed);
        break;
      case UnitCategory.Many:
        this.many.set(unit, available - removed);
        break;
      case UnitCategory.Single:
        if (!this.single || this.single.unit !== unit) {
          throw new Error(`Invalid single-state subtraction for ${unit}`);
        }
        this.single.count -= removed;
        if (this.single.count <= 0) {
          this.single = null;
        }
        break;
    }

    return removed;
  }

  addUnitsToTower(other: Units, towerType: TowerType, hasPlayer: boolean): void {
    for (const [unit, count] of other.iter()) {
      if (unitIsSingleUse(unit)) continue;
      this.addToTower(unit, count, towerType, hasPlayer);
    }
  }

  reconcile(towerType: TowerType, hasPlayer: boolean): void {
    const previous = this.clone();
    this.clear();
    this.addUnitsToTower(previous, towerType, hasPlayer);
  }

  isAlive(): boolean {
    return this.iter().some(([unit]) => unitCanCapture(unit));
  }

  maxEdgeDistance(): number | null {
    let found: number | null = null;

    for (const [unit] of this.iter()) {
      if (!unitIsMobile(unit, null) || unit === Unit.Shield) {
        throw new Error('maxEdgeDistance called with non-mobile or shield unit');
      }
      const distance = unitRangedDistance(unit);
      if (found === null) {
        found = distance;
      } else if (found !== distance) {
        throw new Error('Units must all have the same max_edge_distance');
      }
    }

    return found;
  }

  static randomUnits(damage: number, allowNuke: boolean, seed: number): Units {
    const units = new Units();
    let localSeed = seed >>> 0;

    for (const unit of [Unit.Soldier, Unit.Tank, Unit.Bomber, Unit.Nuke]) {
      if (!(allowNuke || unit !== Unit.Nuke || (localSeed & 0b11) === 0)) {
        continue;
      }

      let governor = 3 + (localSeed & 0b111);
      localSeed >>>= 3;

      while (damage > 0 && governor > 0) {
        units.add(unit, 1);
        damage = Math.max(0, damage - damageToFinite(unitForceGroundDamage(unit)));
        governor -= 1;
      }
    }

    return units;
  }
}
