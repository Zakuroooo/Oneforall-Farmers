/**
 * N2's own acceptance bar (PLAN.md): `p10 <= p50 <= p90` asserted on every
 * horizon. This fixture is built so that holds by construction — this test
 * checks it actually does, not just that it should.
 */

import { fxForecast } from '../forecast';

describe('fxForecast', () => {
  it('has 14 points, one per day of the horizon', () => {
    expect(fxForecast.points).toHaveLength(14);
  });

  it.each(fxForecast.points.map((p, i) => [i, p] as const))(
    'point %i: p10 <= p50 <= p90',
    (_i, p) => {
      expect(p.p10_paise_per_qtl).toBeLessThanOrEqual(p.p50_paise_per_qtl);
      expect(p.p50_paise_per_qtl).toBeLessThanOrEqual(p.p90_paise_per_qtl);
    },
  );

  it('every value is an integer of paise (I1)', () => {
    for (const p of fxForecast.points) {
      expect(Number.isInteger(p.p10_paise_per_qtl)).toBe(true);
      expect(Number.isInteger(p.p50_paise_per_qtl)).toBe(true);
      expect(Number.isInteger(p.p90_paise_per_qtl)).toBe(true);
    }
  });

  it('the band widens with horizon — later days are less certain, not more', () => {
    const bandWidth = (p: (typeof fxForecast.points)[number]) =>
      p.p90_paise_per_qtl - p.p10_paise_per_qtl;
    const first = fxForecast.points[0]!;
    const last = fxForecast.points[fxForecast.points.length - 1]!;
    expect(bandWidth(last)).toBeGreaterThan(bandWidth(first));
  });
});
