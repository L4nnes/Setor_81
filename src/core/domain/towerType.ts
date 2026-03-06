import { Unit, unitIsMobile, unitRangedDistance } from './unit';

export const TowerType = {
  Airfield: 'Airfield',
  Armory: 'Armory',
  Artillery: 'Artillery',
  Barracks: 'Barracks',
  Bunker: 'Bunker',
  Centrifuge: 'Centrifuge',
  City: 'City',
  Cliff: 'Cliff',
  Ews: 'Ews',
  Factory: 'Factory',
  Generator: 'Generator',
  Headquarters: 'Headquarters',
  Helipad: 'Helipad',
  Launcher: 'Launcher',
  Mine: 'Mine',
  Projector: 'Projector',
  Quarry: 'Quarry',
  Radar: 'Radar',
  Rampart: 'Rampart',
  Reactor: 'Reactor',
  Refinery: 'Refinery',
  Rocket: 'Rocket',
  Runway: 'Runway',
  Satellite: 'Satellite',
  Silo: 'Silo',
  Town: 'Town',
  Village: 'Village',
} as const;
export type TowerType = (typeof TowerType)[keyof typeof TowerType];

export type TowerTypeConfig = {
  sensorRadius: number;
  scoreWeight?: number;
  spawnable?: boolean;
  capacity: Partial<Record<Unit, number>>;
  generation: Partial<Record<Unit, number>>;
  prerequisiteTime: number;
  prerequisites: Partial<Record<TowerType, number>>;
  downgrade?: TowerType;
};

const base = (
  capacity: Partial<Record<Unit, number>>,
  generation: Partial<Record<Unit, number>> = {},
  extra: Partial<Omit<TowerTypeConfig, 'capacity' | 'generation'>> = {},
): TowerTypeConfig => ({
  sensorRadius: extra.sensorRadius ?? 12,
  scoreWeight: extra.scoreWeight,
  spawnable: extra.spawnable,
  capacity,
  generation,
  prerequisiteTime: extra.prerequisiteTime ?? 10,
  prerequisites: extra.prerequisites ?? {},
  downgrade: extra.downgrade,
});

export const TOWER_TYPE_CONFIG: Record<TowerType, TowerTypeConfig> = {
  [TowerType.Airfield]: base(
    { [Unit.Fighter]: 4, [Unit.Bomber]: 4, [Unit.Soldier]: 4, [Unit.Tank]: 3, [Unit.Shield]: 10 },
    { [Unit.Bomber]: 30 },
    {
      spawnable: true,
      prerequisites: {
        [TowerType.Runway]: 20,
        [TowerType.Factory]: 2,
        [TowerType.Radar]: 1,
      },
      downgrade: TowerType.Runway,
    },
  ),
  [TowerType.Armory]: base(
    { [Unit.Soldier]: 4, [Unit.Tank]: 5, [Unit.Shield]: 15 },
    { [Unit.Tank]: 15 },
    {
      spawnable: true,
      prerequisites: {
        [TowerType.Barracks]: 25,
        [TowerType.Factory]: 1,
        [TowerType.Mine]: 1,
      },
      downgrade: TowerType.Barracks,
    },
  ),
  [TowerType.Artillery]: base(
    { [Unit.Shell]: 3, [Unit.Shield]: 20 },
    { [Unit.Shell]: 15 },
    {
      prerequisites: {
        [TowerType.Bunker]: 40,
        [TowerType.Refinery]: 2,
        [TowerType.Radar]: 3,
      },
      downgrade: TowerType.Bunker,
    },
  ),
  [TowerType.Barracks]: base(
    { [Unit.Soldier]: 12, [Unit.Tank]: 2, [Unit.Shield]: 10 },
    { [Unit.Soldier]: 6 },
    { spawnable: true },
  ),
  [TowerType.Bunker]: base(
    { [Unit.Soldier]: 6, [Unit.Shield]: 40 },
    {},
    {
      prerequisites: {
        [TowerType.Mine]: 30,
        [TowerType.Headquarters]: 1,
        [TowerType.Ews]: 1,
      },
      downgrade: TowerType.Mine,
    },
  ),
  [TowerType.Centrifuge]: base(
    { [Unit.Soldier]: 4, [Unit.Tank]: 2, [Unit.Shield]: 15 },
    {},
    {
      prerequisites: {
        [TowerType.Factory]: 30,
        [TowerType.Mine]: 3,
      },
      downgrade: TowerType.Factory,
    },
  ),
  [TowerType.City]: base(
    { [Unit.Fighter]: 2, [Unit.Soldier]: 6, [Unit.Tank]: 2, [Unit.Shield]: 15 },
    {},
    {
      scoreWeight: 5,
      prerequisites: {
        [TowerType.Town]: 3,
        [TowerType.Quarry]: 2,
        [TowerType.Reactor]: 1,
      },
      prerequisiteTime: 30,
      downgrade: TowerType.Town,
    },
  ),
  [TowerType.Cliff]: base(
    { [Unit.Soldier]: 4, [Unit.Tank]: 2, [Unit.Shield]: 30 },
  ),
  [TowerType.Ews]: base(
    { [Unit.Soldier]: 4, [Unit.Tank]: 2, [Unit.Shield]: 15 },
    {},
    {
      sensorRadius: 20,
      prerequisites: {
        [TowerType.Radar]: 30,
        [TowerType.Generator]: 2,
      },
      downgrade: TowerType.Radar,
    },
  ),
  [TowerType.Factory]: base(
    { [Unit.Soldier]: 4, [Unit.Tank]: 2, [Unit.Shield]: 10 },
    {},
    { scoreWeight: 2 },
  ),
  [TowerType.Generator]: base(
    { [Unit.Soldier]: 4, [Unit.Tank]: 2, [Unit.Shield]: 10 },
  ),
  [TowerType.Headquarters]: base(
    { [Unit.Soldier]: 8, [Unit.Tank]: 2, [Unit.Shield]: 40 },
    {},
    {
      prerequisites: {
        [TowerType.Village]: 20,
        [TowerType.Radar]: 1,
      },
      downgrade: TowerType.Village,
    },
  ),
  [TowerType.Helipad]: base(
    { [Unit.Chopper]: 3, [Unit.Soldier]: 4, [Unit.Tank]: 2, [Unit.Shield]: 15 },
    { [Unit.Chopper]: 30 },
    {
      spawnable: true,
      prerequisites: {
        [TowerType.Airfield]: 20,
        [TowerType.Armory]: 2,
        [TowerType.Factory]: 3,
      },
      downgrade: TowerType.Airfield,
    },
  ),
  [TowerType.Launcher]: base(
    { [Unit.Emp]: 1, [Unit.Shield]: 15 },
    { [Unit.Emp]: 80 },
    {
      prerequisites: {
        [TowerType.Rocket]: 30,
        [TowerType.Airfield]: 2,
      },
      downgrade: TowerType.Rocket,
    },
  ),
  [TowerType.Mine]: base(
    { [Unit.Soldier]: 4, [Unit.Tank]: 2, [Unit.Shield]: 15 },
    {},
    { scoreWeight: 2 },
  ),
  [TowerType.Projector]: base(
    { [Unit.Soldier]: 4, [Unit.Tank]: 2, [Unit.Shield]: 10 },
    { [Unit.Shield]: 3 },
    {
      prerequisites: {
        [TowerType.Centrifuge]: 20,
        [TowerType.Rampart]: 2,
        [TowerType.Reactor]: 2,
      },
      downgrade: TowerType.Centrifuge,
    },
  ),
  [TowerType.Quarry]: base(
    { [Unit.Soldier]: 6, [Unit.Tank]: 2, [Unit.Shield]: 10 },
    {},
    {
      scoreWeight: 2,
      prerequisites: {
        [TowerType.Cliff]: 20,
        [TowerType.Village]: 1,
      },
      downgrade: TowerType.Cliff,
    },
  ),
  [TowerType.Radar]: base(
    { [Unit.Soldier]: 4, [Unit.Tank]: 2, [Unit.Shield]: 10 },
    {},
    { sensorRadius: 16 },
  ),
  [TowerType.Rampart]: base(
    { [Unit.Soldier]: 8, [Unit.Shield]: 45 },
    { [Unit.Shield]: 3 },
    {
      prerequisites: {
        [TowerType.Cliff]: 20,
        [TowerType.Barracks]: 2,
      },
      downgrade: TowerType.Cliff,
    },
  ),
  [TowerType.Reactor]: base(
    { [Unit.Soldier]: 4, [Unit.Tank]: 2, [Unit.Shield]: 10 },
    {},
    {
      prerequisites: {
        [TowerType.Generator]: 40,
        [TowerType.Centrifuge]: 1,
      },
      downgrade: TowerType.Generator,
    },
  ),
  [TowerType.Refinery]: base(
    { [Unit.Soldier]: 4, [Unit.Tank]: 2, [Unit.Shield]: 5 },
    {},
    {
      scoreWeight: 3,
      prerequisites: {
        [TowerType.Factory]: 20,
        [TowerType.Generator]: 3,
        [TowerType.Cliff]: 1,
      },
      downgrade: TowerType.Factory,
    },
  ),
  [TowerType.Rocket]: base(
    { [Unit.Soldier]: 4, [Unit.Tank]: 2, [Unit.Shield]: 15 },
    {},
    {
      prerequisites: {
        [TowerType.Radar]: 20,
        [TowerType.Refinery]: 1,
      },
      downgrade: TowerType.Radar,
    },
  ),
  [TowerType.Runway]: base(
    { [Unit.Fighter]: 4, [Unit.Soldier]: 4, [Unit.Tank]: 2, [Unit.Shield]: 5 },
    { [Unit.Fighter]: 30 },
    {
      spawnable: true,
    },
  ),
  [TowerType.Satellite]: base(
    { [Unit.Soldier]: 4, [Unit.Tank]: 2, [Unit.Shield]: 15 },
    {},
    {
      sensorRadius: 30,
      prerequisites: {
        [TowerType.Ews]: 40,
        [TowerType.Rocket]: 2,
        [TowerType.Generator]: 5,
      },
      downgrade: TowerType.Ews,
    },
  ),
  [TowerType.Silo]: base(
    { [Unit.Nuke]: 1, [Unit.Soldier]: 4, [Unit.Tank]: 1, [Unit.Shield]: 20 },
    { [Unit.Nuke]: 120 },
    {
      prerequisites: {
        [TowerType.Quarry]: 40,
        [TowerType.Centrifuge]: 2,
      },
      downgrade: TowerType.Quarry,
    },
  ),
  [TowerType.Town]: base(
    { [Unit.Fighter]: 1, [Unit.Soldier]: 4, [Unit.Tank]: 1, [Unit.Shield]: 10 },
    {},
    {
      scoreWeight: 2,
      prerequisites: {
        [TowerType.Village]: 3,
        [TowerType.Generator]: 1,
      },
      prerequisiteTime: 20,
      downgrade: TowerType.Village,
    },
  ),
  [TowerType.Village]: base(
    { [Unit.Soldier]: 4, [Unit.Shield]: 5 },
  ),
};

export const ROOT_TOWER_TYPES: TowerType[] = [
  TowerType.Barracks,
  TowerType.Cliff,
  TowerType.Factory,
  TowerType.Generator,
  TowerType.Mine,
  TowerType.Radar,
  TowerType.Runway,
  TowerType.Village,
];

export function towerSensorRadius(towerType: TowerType): number {
  return TOWER_TYPE_CONFIG[towerType].sensorRadius;
}

export function towerScoreWeight(towerType: TowerType): number {
  return TOWER_TYPE_CONFIG[towerType].scoreWeight ?? 0;
}

export function towerIsSpawnable(towerType: TowerType): boolean {
  return TOWER_TYPE_CONFIG[towerType].spawnable ?? false;
}

export function towerPrerequisiteTime(towerType: TowerType): number {
  return TOWER_TYPE_CONFIG[towerType].prerequisiteTime;
}

export function towerPrerequisiteCount(towerType: TowerType, requiredType: TowerType): number {
  return TOWER_TYPE_CONFIG[towerType].prerequisites[requiredType] ?? 0;
}

export function towerPrerequisites(towerType: TowerType): Array<[TowerType, number]> {
  return Object.entries(TOWER_TYPE_CONFIG[towerType].prerequisites)
    .map(([key, value]) => [key as TowerType, value as number]);
}

export function towerDowngrade(towerType: TowerType): TowerType | null {
  return TOWER_TYPE_CONFIG[towerType].downgrade ?? null;
}

export function towerCanUpgradeTo(from: TowerType, to: TowerType): boolean {
  return towerDowngrade(to) === from;
}

export function towerUpgrades(from: TowerType): TowerType[] {
  return Object.values(TowerType).filter((candidate) => towerCanUpgradeTo(from, candidate));
}

export function rawUnitCapacity(towerType: TowerType, unit: Unit): number {
  return TOWER_TYPE_CONFIG[towerType].capacity[unit] ?? 0;
}

export function towerUnitGeneration(towerType: TowerType, unit: Unit): number | null {
  return TOWER_TYPE_CONFIG[towerType].generation[unit] ?? null;
}

export function towerGeneratesMobileUnits(towerType: TowerType): boolean {
  for (const unit of Object.values(Unit)) {
    if (!unitIsMobile(unit, towerType)) continue;
    if (towerUnitGeneration(towerType, unit) !== null) return true;
  }
  return false;
}

export function towerRangedDistance(towerType: TowerType): number | null {
  for (const unit of Object.values(Unit)) {
    const generation = towerUnitGeneration(towerType, unit);
    if (generation === null) continue;
    const distance = unitRangedDistance(unit);
    if (distance !== null) return distance;
  }
  return null;
}

export function towerRangedDamage(towerType: TowerType, damage: number): number {
  switch (towerType) {
    case TowerType.Bunker:
      return Math.floor(damage / 3);
    case TowerType.Headquarters:
      return Math.floor((damage * 2) / 3);
    default:
      return damage;
  }
}

export function towerMaxRangedDamage(towerType: TowerType): number {
  return towerRangedDamage(towerType, 31);
}

export function towerLevel(towerType: TowerType): number {
  const prereqLevels = towerPrerequisites(towerType).map(([type]) => towerLevel(type));
  const downgrade = towerDowngrade(towerType);
  if (downgrade) prereqLevels.push(towerLevel(downgrade));
  return prereqLevels.length === 0 ? 0 : Math.max(...prereqLevels) + 1;
}

export function towerBasis(towerType: TowerType): TowerType {
  let current = towerType;
  while (towerDowngrade(current)) {
    current = towerDowngrade(current) as TowerType;
  }
  return current;
}

export function towerHasPrerequisites(
  towerType: TowerType,
  towerCounts: Partial<Record<TowerType, number>>,
): boolean {
  return towerPrerequisites(towerType).every(
    ([requiredType, count]) => (towerCounts[requiredType] ?? 0) >= count,
  );
}

export function towerScale(_towerType: TowerType): number {
  return 1;
}

export function towerMaxRange(): number {
  return Math.max(...Object.values(TowerType).map(towerSensorRadius));
}

export function generateTowerType(hash: number): TowerType {
  return ROOT_TOWER_TYPES[Math.abs(hash) % ROOT_TOWER_TYPES.length];
}
