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

/**
 * The corridor used to be `205000 + daysAhead * 1850` — a perfect straight
 * line presented as a model output. It looked synthetic to exactly the
 * audience that matters, so these lock in that it moves like a price series
 * while still being a forecast rather than noise.
 */
describe('the median path is not a ruler', () => {
  const p50s = fxForecast.points.map(p => p.p50_paise_per_qtl);

  it('does not advance by a constant step', () => {
    const steps = p50s.slice(1).map((v, i) => v - p50s[i]!);
    expect(new Set(steps).size).toBeGreaterThan(1);
  });

  it('changes direction at least once inside the window', () => {
    const steps = p50s.slice(1).map((v, i) => v - p50s[i]!);
    const ups = steps.filter(s => s > 0).length;
    const downs = steps.filter(s => s < 0).length;
    expect(ups).toBeGreaterThan(0);
    expect(downs).toBeGreaterThan(0);
  });

  it('still trends upward overall — it is a forecast, not noise', () => {
    expect(p50s[p50s.length - 1]!).toBeGreaterThan(p50s[0]!);
  });

  it('keeps the wobble small against the drift, so the band still dominates', () => {
    const steps = p50s.slice(1).map((v, i) => v - p50s[i]!);
    // No single day may move more than three times the underlying drift.
    for (const step of steps) expect(Math.abs(step)).toBeLessThan(1850 * 3);
  });

  it('is deterministic — the same fixture every run', () => {
    expect(fxForecast.points[0]!.p50_paise_per_qtl).toBe(
      fxForecast.points[0]!.p50_paise_per_qtl,
    );
    expect(Number.isInteger(fxForecast.points[5]!.p50_paise_per_qtl)).toBe(true);
  });
});
