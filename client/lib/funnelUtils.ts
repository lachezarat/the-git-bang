import type { Repository } from "./repositoryData";

const END_TIME_VAL = new Date("2025-12-31").getTime();
const FALLBACK_START_TIME = new Date("2011-01-01").getTime();

export const END_TIME = END_TIME_VAL;

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

  // X position along funnel length (scaled down by 1.083, extended 1.5x horizontally to match wireframe)
  // Original range: -93.75 to +93.75 (total 187.5)
  // After 1.083 scaling: -86.57 to +86.57 (total 173.15)
  // After 1.5x extension: -129.86 to +129.86 (total 259.72)
  const x = ((logT * 187.5 - 93.75) / 1.083) * 1.5;

  // Funnel radius: starts at 3.75 (narrow left) and expands to 56.25 (wide right)
  // Increased by 1.5x then scaled down by 1.083
  const startRadius = (3.75 * 1.5) / 1.083;
  const endRadius = (56.25 * 1.5) / 1.083;
  const funnelRadius = startRadius + (endRadius - startRadius) * logT;

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
