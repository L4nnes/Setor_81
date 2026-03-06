import { TowerId } from '../grid/towerId';
import { Force } from './force';

export type MovementStepResult = {
  arrived: boolean;
  currentSource: TowerId;
  currentDestination: TowerId;
  pathProgress: number;
};

export function tickForceMovement(force: Force, inboundTowerId: TowerId): MovementStepResult {
  const arrived = force.tick(inboundTowerId);

  return {
    arrived,
    currentSource: force.currentSource(),
    currentDestination: force.currentDestination(),
    pathProgress: force.pathProgress,
  };
}

export function interpolateForcePosition(
  force: Force,
  timeSinceTick: number,
  tickPeriodSecs: number,
): { x: number; y: number } {
  return force.interpolatedPosition(timeSinceTick, tickPeriodSecs);
}
