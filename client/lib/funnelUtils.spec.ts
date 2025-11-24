import { describe, it, expect } from 'vitest';
import { calculatePositionFromParams, getStartTime } from './funnelUtils';

describe('funnelUtils', () => {
  it('calculates position correctly', () => {
    const startTime = new Date('2020-01-01').getTime();
    const timestamp = new Date('2020-01-01').getTime(); // t=0
    const angle = 0;
    const radiusRatio = 1;

    // t=0 -> logT = 0
    // x = ((-93.75) / 1.083) * 1.5 = -129.8476

    const pos = calculatePositionFromParams(timestamp, angle, radiusRatio, startTime);

    expect(pos.x).toBeCloseTo(((0 * 187.5 - 93.75) / 1.083) * 1.5, 4);
    expect(pos.y).toBeCloseTo((3.75 * 1.5 / 1.083), 4); // cos(0)=1 * startRadius
    expect(pos.z).toBeCloseTo(0, 4); // sin(0)=0
  });

  it('handles getStartTime', () => {
    const repos = [
      { createdAt: 100 } as any,
      { createdAt: 200 } as any
    ];
    expect(getStartTime(repos)).toBe(100);
  });
});
