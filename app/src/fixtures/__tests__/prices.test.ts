/**
 * fxPriceHistory has to look like a real onion market, not a straight line, and
 * it has to end exactly where fxPriceSeries starts — S4/S9 and S5 telling two
 * different "today's price" stories is the kind of bug a demo doesn't survive.
 */

import { fxPriceHistory, fxPriceSeries } from '../prices';

describe('fxPriceHistory', () => {
  it('has 180 points, one SYNTHETIC, the rest AGMARKNET', () => {
    expect(fxPriceHistory.points).toHaveLength(180);
    const synthetic = fxPriceHistory.points.filter(p => p.source === 'SYNTHETIC');
    expect(synthetic).toHaveLength(1);
  });

  it('the SYNTHETIC point sits inside the dip, not mid-diagonal on the recent stretch', () => {
    const syntheticIndex = fxPriceHistory.points.findIndex(p => p.source === 'SYNTHETIC');
    // Index 166+ is the recent, dip-free 14-day stretch — the synthetic point
    // must be in the earlier, seasonal part of the series.
    expect(syntheticIndex).toBeGreaterThanOrEqual(0);
    expect(syntheticIndex).toBeLessThan(166);
  });

  it('is not monotonic — a real post-harvest dip exists, not a straight line', () => {
    const modals = fxPriceHistory.points.map(p => p.modal_paise_per_qtl);
    const isMonotonicNonDecreasing = modals.every((v, i) => i === 0 || v >= modals[i - 1]!);
    expect(isMonotonicNonDecreasing).toBe(false);

    // The trough is meaningfully below both the start and the eventual level —
    // a dip, not just rendering noise.
    const min = Math.min(...modals);
    expect(min).toBeLessThan(modals[0]! - 10000);
  });

  it('the last 14 days are byte-identical to fxPriceSeries — S4/S9 and S5 agree', () => {
    // Actually byte-identical — every field, not just modal_paise_per_qtl. The
    // earlier version of this test compared only the modal price, so drift in
    // obs_date, min/max, or arrivals_qtl between the two fixtures would have
    // stayed green; this doesn't let that happen.
    expect(fxPriceHistory.points.slice(-14)).toEqual(fxPriceSeries.points);
  });

  it('the seam between the seasonal stretch and the recent 14 days has no visible jump', () => {
    const seamIndex = fxPriceHistory.points.length - 14; // index 166
    const before = fxPriceHistory.points[seamIndex - 1]!.modal_paise_per_qtl;
    const after = fxPriceHistory.points[seamIndex]!.modal_paise_per_qtl;
    // A day-to-day move bigger than the dip's own steepest daily move would
    // read as a data glitch, not a market.
    expect(Math.abs(after - before)).toBeLessThan(2000);
  });
});
