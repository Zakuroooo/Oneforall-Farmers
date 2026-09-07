/**
 * The market screen now picks a crop and a mandi, so its fixtures take both.
 * The failure these guard against is a quiet one: a fixture that ignores its
 * arguments returns onion's chart under a tomato heading, and the screen looks
 * perfectly correct while telling a farmer something false about a crop he is
 * about to hold for two weeks.
 */

import { fxPriceHistory, fxSeriesFor } from '../prices';
import { fxForecast, fxForecastFor } from '../forecast';
import { fxCommodities, fxMarketsFor } from '../reference';
import { NO_ADVICE_BAND_THRESHOLD_BPS } from '../../config';

describe('fxSeriesFor', () => {
  it('returns the pinned demo series, by identity, for onion at Lasalgaon', () => {
    // Identity, not equality: `fixtures/window.ts` is built against this exact
    // object, and a copy would let the two drift.
    expect(fxSeriesFor('cmd_onion', 'mkt_lasalgaon')).toBe(fxPriceHistory);
  });

  it('gives every crop/mandi pair its own prices', () => {
    const pairs = [
      ['cmd_onion', 'mkt_lasalgaon'],
      ['cmd_onion', 'mkt_pune'],
      ['cmd_onion', 'mkt_ahmednagar'],
      ['cmd_tomato', 'mkt_lasalgaon'],
      ['cmd_tomato', 'mkt_pune'],
    ] as const;

    const latest = pairs.map(([c, m]) => {
      const s = fxSeriesFor(c, m);
      expect(s).not.toBeNull();
      const points = s!.points;
      return points[points.length - 1]!.modal_paise_per_qtl;
    });

    expect(new Set(latest).size).toBe(latest.length);
  });

  it('refuses a pair the mandi does not trade rather than inventing one', () => {
    // Pimpalgaon is an onion yard.
    expect(fxSeriesFor('cmd_tomato', 'mkt_pimpalgaon')).toBeNull();
    expect(fxSeriesFor('cmd_onion', 'mkt_pimpalgaon')).not.toBeNull();
    // And a mandi this app has never heard of is not quietly served either.
    expect(fxSeriesFor('cmd_onion', 'mkt_nowhere')).toBeNull();
  });

  it('keeps min <= modal <= max on every point of every pair', () => {
    for (const c of fxCommodities) {
      for (const d of ['dist_nashik', 'dist_pune', 'dist_ahmednagar']) {
        for (const m of fxMarketsFor(d)) {
          const s = fxSeriesFor(c.id, m.id);
          if (!s) continue;
          for (const p of s.points) {
            expect(p.min_paise_per_qtl).toBeLessThanOrEqual(p.modal_paise_per_qtl);
            expect(p.modal_paise_per_qtl).toBeLessThanOrEqual(p.max_paise_per_qtl);
            expect(Number.isInteger(p.modal_paise_per_qtl)).toBe(true); // I1
          }
        }
      }
    }
  });
});

describe('fxForecastFor', () => {
  it('returns the pinned demo forecast, by identity, for onion at Lasalgaon', () => {
    expect(fxForecastFor('cmd_onion', 'mkt_lasalgaon')).toBe(fxForecast);
  });

  it('keeps p10 <= p50 <= p90 on every horizon of every pair', () => {
    for (const c of fxCommodities) {
      for (const d of ['dist_nashik', 'dist_pune', 'dist_ahmednagar']) {
        for (const m of fxMarketsFor(d)) {
          const f = fxForecastFor(c.id, m.id);
          if (!f) continue;
          for (const p of f.points) {
            expect(p.p10_paise_per_qtl).toBeLessThanOrEqual(p.p50_paise_per_qtl);
            expect(p.p50_paise_per_qtl).toBeLessThanOrEqual(p.p90_paise_per_qtl);
          }
        }
      }
    }
  });

  /**
   * ★ I6. Tomato is in scope precisely because one crop cannot demonstrate a
   *   refusal. If its band ever narrows past the server's threshold, the crop
   *   picker stops being able to show a judge what the model does when it does
   *   not know — which is the behaviour the whole product is built around.
   */
  it('leaves tomato uncertain enough that the model must refuse', () => {
    const f = fxForecastFor('cmd_tomato', 'mkt_lasalgaon');
    expect(f).not.toBeNull();
    const last = f!.points[f!.points.length - 1]!;
    const bandBps = Math.round(
      ((last.p90_paise_per_qtl - last.p10_paise_per_qtl) / last.p50_paise_per_qtl) * 10000,
    );
    expect(bandBps).toBeGreaterThan(NO_ADVICE_BAND_THRESHOLD_BPS);
  });

  it('leaves onion certain enough that the model can still advise', () => {
    const f = fxForecastFor('cmd_onion', 'mkt_lasalgaon')!;
    const last = f.points[f.points.length - 1]!;
    const bandBps = Math.round(
      ((last.p90_paise_per_qtl - last.p10_paise_per_qtl) / last.p50_paise_per_qtl) * 10000,
    );
    expect(bandBps).toBeLessThan(NO_ADVICE_BAND_THRESHOLD_BPS);
  });
});

describe('fxMarketsFor', () => {
  it('gives every market back under the district it belongs to', () => {
    for (const d of ['dist_nashik', 'dist_pune', 'dist_ahmednagar']) {
      const markets = fxMarketsFor(d);
      expect(markets.length).toBeGreaterThan(0);
      for (const m of markets) expect(m.district_id).toBe(d);
    }
  });

  it('returns an empty list, not undefined, for a district with no mandi', () => {
    expect(fxMarketsFor('dist_nowhere')).toEqual([]);
  });
});
