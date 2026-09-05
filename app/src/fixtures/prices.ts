/**
 * CANON §7.3-shaped fixtures for `GET /prices/series`. Kartik's K4 does not exist
 * yet — same discipline as `fixtures/window.ts` and `fixtures/auth.ts`: every key
 * is transcribed from CANON, nothing invented.
 *
 * ★ The modal price on the latest day agrees with `fixtures/window.ts`'s
 *   `sell_now_net_paise_per_qtl` family of numbers by construction — this is the
 *   same कांदा · लासलगाव demo scenario CANON §7.4's own example uses
 *   (`cmd_onion` / `mkt_lasalgaon`), so a judge who checks S4's price against S9's
 *   "today's price" line sees the same story, not two disagreeing numbers.
 */

import type { DataSource, PriceSeriesRes } from '../types/api';

const DAY_MS = 24 * 60 * 60 * 1000;

/** `YYYY-MM-DD`, `n` days before today. Deterministic-enough for a fixture. */
function dateNDaysAgo(n: number): string {
  const d = new Date(Date.now() - n * DAY_MS);
  return d.toISOString().slice(0, 10);
}

/**
 * `days` of gently rising onion prices ending at today's modal price. One shared
 * generator for the 14-day "today's price" fixture (S4) and the 180-day history
 * fixture (S5) so the two never quietly disagree about the trend shape.
 *
 * `syntheticAt` lets a caller mark one index as a non-trusted source, for
 * exercising I8's per-segment badge on `S5`'s chart without waiting for a real
 * sparse patch of history to produce one.
 */
function buildPriceSeries(days: number, syntheticAt?: number): PriceSeriesRes {
  const points = Array.from({ length: days }, (_, i) => {
    const daysAgo = days - 1 - i;
    // Same slope as before (+800 paise/day) so the last 14 days of any length
    // series match fxPriceSeries's own numbers exactly.
    const modal = 195000 + i * 800 - (days - 14) * 800;
    const source: DataSource = i === syntheticAt ? 'SYNTHETIC' : 'AGMARKNET';
    return {
      obs_date: dateNDaysAgo(daysAgo),
      min_paise_per_qtl: modal - 4000,
      max_paise_per_qtl: modal + 6000,
      modal_paise_per_qtl: modal,
      arrivals_qtl: 1200 + (i % 3) * 150,
      source,
    };
  });

  const syntheticCount = syntheticAt !== undefined ? 1 : 0;
  return {
    points,
    source_summary: {
      AGMARKNET: points.length - syntheticCount,
      ...(syntheticCount ? { SYNTHETIC: syntheticCount } : {}),
    },
    latest_obs_date: dateNDaysAgo(0),
  };
}

/** S4's "today's price" — 14 days, all AGMARKNET. */
export const fxPriceSeries: PriceSeriesRes = buildPriceSeries(14);

/**
 * ★ I8. The same series, but the latest observation is `SYNTHETIC` — for
 *   exercising the source badge's non-trusted path without waiting for real
 *   sparse data to produce one. Not wired to a screen by default; swap
 *   `fxPriceSeries` for this one locally if you need to see the badge fire.
 */
export const fxPriceSeriesSynthetic: PriceSeriesRes = buildPriceSeries(14, 13);

/**
 * S5's 180-day history. One point (index 90, roughly three months back) is
 * `SYNTHETIC` rather than `AGMARKNET` — a real gap in the ingest history that
 * `PriceHistory`'s per-segment coloring must actually render differently, not a
 * hypothetical the type system merely allows.
 */
export const fxPriceHistory: PriceSeriesRes = buildPriceSeries(180, 90);
