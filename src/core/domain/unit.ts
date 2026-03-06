import { TowerType } from './towerType';

export const Field = {
  Surface: 'surface',
  Air: 'air',
} as const;
export type Field = (typeof Field)[keyof typeof Field];

export const Unit = {
  Shield: 'Shield',
  Fighter: 'Fighter',
  Chopper: 'Chopper',
  Bomber: 'Bomber',
  Tank: 'Tank',
  Soldier: 'Soldier',
  Shell: 'Shell',
  Emp: 'Emp',
  Nuke: 'Nuke',
  Ruler: 'Ruler',
} as const;
export type Unit = (typeof Unit)[keyof typeof Unit];

export const UnitCategory = {
  Always: 'Always',
  Many: 'Many',
  Single: 'Single',
} as const;
export type UnitCategory = (typeof UnitCategory)[keyof typeof UnitCategory];

export const Speed = {
  Immobile: 0,
  Slow: 1,
  Normal: 2,
  Fast: 3,
} as const;
export type Speed = (typeof Speed)[keyof typeof Speed];

export const RangeBand = {
  Short: 'Short',
  Medium: 'Medium',
  Long: 'Long',
} as const;
export type RangeBand = (typeof RangeBand)[keyof typeof RangeBand];

export const UNIT_ORDER: Unit[] = [
  Unit.Shield,
  Unit.Fighter,
  Unit.Chopper,
  Unit.Bomber,
  Unit.Tank,
  Unit.Soldier,
  Unit.Shell,
  Unit.Emp,
  Unit.Nuke,
  Unit.Ruler,
];

export const MANY_UNITS: Unit[] = [
  Unit.Fighter,
  Unit.Chopper,
  Unit.Bomber,
  Unit.Tank,
  Unit.Soldier,
];

export const SINGLE_UNITS: Unit[] = [Unit.Shell, Unit.Emp, Unit.Nuke, Unit.Ruler];

export const ALWAYS_UNITS: Unit[] = [Unit.Shield];

export const UNIT_INFINITE_DAMAGE = 31;
export const UNIT_EMP_SECONDS = 60;
export const WORLD_MAX_ROAD_LENGTH = 5;

export function unitCategory(unit: Unit): UnitCategory {
  if (ALWAYS_UNITS.includes(unit)) return UnitCategory.Always;
  if (MANY_UNITS.includes(unit)) return UnitCategory.Many;
  return UnitCategory.Single;
}

export function unitMaxOverflow(unit: Unit): number {
  switch (unit) {
    case Unit.Shield:
      return 15;
    case Unit.Soldier:
      return 10;
    case Unit.Tank:
      return 5;
    case Unit.Fighter:
      return 4;
    case Unit.Bomber:
    case Unit.Chopper:
      return 2;
    default:
      return 0;
  }
}

export function unitDamage(unit: Unit, field: Field, enemyField: Field): number {
  switch (unit) {
    case Unit.Tank:
      return 3;
    case Unit.Fighter:
      return field === Field.Air ? 3 : 1;
    case Unit.Bomber:
      return field === Field.Air && enemyField === Field.Surface ? 5 : 1;
    case Unit.Chopper:
      return field === Field.Air ? 3 : 1;
    case Unit.Nuke:
      return UNIT_INFINITE_DAMAGE;
    case Unit.Shell:
      return 3;
    default:
      return 1;
  }
}

export function unitField(
  unit: Unit,
  overflow: boolean,
  inForce: boolean,
  anyAir: boolean,
): Field {
  switch (unit) {
    case Unit.Shield:
      return anyAir ? Field.Air : Field.Surface;
    case Unit.Bomber:
    case Unit.Chopper:
    case Unit.Fighter:
    case Unit.Shell:
    case Unit.Emp:
    case Unit.Nuke:
      return overflow || inForce ? Field.Air : Field.Surface;
    default:
      return Field.Surface;
  }
}

export function unitIsFieldPossible(unit: Unit, field: Field): boolean {
  for (let bits = 0; bits < 8; bits += 1) {
    const overflow = ((bits >> 2) & 1) === 1;
    const inForce = ((bits >> 1) & 1) === 1;
    const anyAir = (bits & 1) === 1;
    if (unitField(unit, overflow, inForce, anyAir) === field) {
      return true;
    }
  }
  return false;
}

export function unitRange(unit: Unit): RangeBand | null {
  switch (unit) {
    case Unit.Nuke:
    case Unit.Shell:
      return RangeBand.Short;
    case Unit.Emp:
      return RangeBand.Medium;
    default:
      return null;
  }
}

export function rangeToDistance(range: RangeBand): number {
  switch (range) {
    case RangeBand.Short:
      return 5 * WORLD_MAX_ROAD_LENGTH;
    case RangeBand.Medium:
      return 8 * WORLD_MAX_ROAD_LENGTH;
    case RangeBand.Long:
      return 11 * WORLD_MAX_ROAD_LENGTH;
  }
}

export function unitIsRanged(unit: Unit): boolean {
  return unitRange(unit) !== null;
}

export function unitRangedDistance(unit: Unit): number | null {
  const range = unitRange(unit);
  return range ? rangeToDistance(range) : null;
}

export function unitIsSingleUse(unit: Unit): boolean {
  return unitRangedDistance(unit) !== null;
}

export function unitSpeed(unit: Unit, towerType: TowerType | null): Speed {
  switch (unit) {
    case Unit.Bomber:
    case Unit.Fighter:
    case Unit.Chopper:
    case Unit.Shell:
      return Speed.Fast;
    case Unit.Nuke:
    case Unit.Tank:
      return Speed.Slow;
    case Unit.Shield:
      return towerType === null || towerType === TowerType.Projector
        ? Speed.Fast
        : Speed.Immobile;
    default:
      return Speed.Normal;
  }
}

export function unitWeight(unit: Unit): number {
  switch (unit) {
    case Unit.Tank:
      return 2;
    case Unit.Soldier:
      return 1;
    default:
      return 0;
  }
}

export function unitIsMobile(unit: Unit, towerType: TowerType | null): boolean {
  return unitSpeed(unit, towerType) !== Speed.Immobile;
}

export function unitCanCapture(unit: Unit): boolean {
  return unitIsMobile(unit, null) && unit !== Unit.Shield && !unitIsSingleUse(unit);
}

export function unitForceGroundDamage(unit: Unit): number {
  return unitDamage(unit, unitField(unit, false, true, false), Field.Surface);
}

export function damageToFinite(damage: number): number {
  return damage === UNIT_INFINITE_DAMAGE ? 2147483647 : damage;
}
