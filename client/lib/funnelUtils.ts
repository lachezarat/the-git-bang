import type { Repository } from "./repositoryData";

const END_TIME_VAL = new Date("2025-12-31").getTime();
const FALLBACK_START_TIME = new Date("2011-01-01").getTime();

export const END_TIME = END_TIME_VAL;

// Funnel Dimensions
export const FUNNEL_START_X = -400;
export const FUNNEL_END_X = 400;
export const FUNNEL_START_RADIUS = 10;
export const FUNNEL_END_RADIUS = 180;

export function getStartTime(repositories: Repository[]): number {
  return repositories.length > 0
    ? Math.min(...repositories.map((r) => r.createdAt))
    : FALLBACK_START_TIME;
}

export function calculatePositionFromParams(
  timestamp: number,
  angle: number,
  radiusRatio: number, // repo.positionRadius
  startTime: number,
): { x: number; y: number; z: number } {
  // Map time to log scale
  const t = (timestamp - startTime) / (END_TIME_VAL - startTime);
  const clampedT = Math.max(0, Math.min(1, t));
  const logT = Math.log(1 + clampedT * 9) / Math.log(10);

  // X position along funnel length
  const x = FUNNEL_START_X + (FUNNEL_END_X - FUNNEL_START_X) * logT;

  // Funnel radius expands with time
  const funnelRadius = FUNNEL_START_RADIUS + (FUNNEL_END_RADIUS - FUNNEL_START_RADIUS) * logT;

  const radiusOffset = radiusRatio * funnelRadius;

  const y = Math.cos(angle) * radiusOffset;
  const z = Math.sin(angle) * radiusOffset;

  return { x, y, z };
}

export function calculateParticlePosition(
  repo: Repository,
  allRepositories: Repository[],
): { x: number; y: number; z: number } {
  const startTime = getStartTime(allRepositories);
  return calculatePositionFromParams(
    repo.createdAt,
    repo.positionAngle,
    repo.positionRadius,
    startTime,
  );
}
