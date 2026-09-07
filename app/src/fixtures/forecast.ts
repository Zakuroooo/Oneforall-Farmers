/**
 * CANON §7.4-shaped fixture for `GET /ai/forecast`. Nikhil's N2 does not exist
 * yet — same discipline as every other fixture in this app: every key comes from
 * CANON, nothing invented.
 *
 * ★ N2's own acceptance bar (PLAN.md) is `p10 <= p50 <= p90` on every horizon —
 *   this fixture is built by construction to satisfy that (p10/p90 are always
 *   `p50 ∓ a non-negative half-band`), and `forecast.test.ts` asserts it holds
 *   for all 14 points rather than trusting the construction blindly.
 *
 * The trend is a plausible continuation of `fixtures/prices.ts`'s history, and
 * the band widens with horizon — a forecast eleven days out is genuinely less
 * certain than one four days out, which is the whole reason `ForecastFan` draws
 * a fan and not a line.
 *
 * ★ CONTRACT GAP: CANON's `ForecastRes` has no `source` field at all — a
 *   forecast is a model output, not an observed price row, so "AGMARKNET vs
 *   SYNTHETIC" does not apply to it the way it does to `PricePoint`. PRANAY.md
 *   §2.7's rule 2 ("the source badge is part of the chart") reads as if every
 *   chart needs one; `ForecastFan` does not render one because there is nothing
 *   in this response to badge. Blocker filed to Nilesh/Nikhil.
 */

import type { ForecastPoint, ForecastRes } from '../types/api';

const DAY_MS = 24 * 60 * 60 * 1000;

function dateNDaysAhead(n: number): string {
  const d = new Date(Date.now() + n * DAY_MS);
  return d.toISOString().slice(0, 10);
}

function buildPoint(daysAhead: number): ForecastPoint {
  const p50 = 205000 + daysAhead * 1850; // continues fxPriceHistory's own trend
  const bandFraction = 0.05 + daysAhead * 0.012; // widens with horizon
  const half = Math.round((p50 * bandFraction) / 2);
  return {
    target_date: dateNDaysAhead(daysAhead),
    p10_paise_per_qtl: p50 - half,
    p50_paise_per_qtl: p50,
    p90_paise_per_qtl: p50 + half,
  };
}

/**
 * 14 points, day 1 through day 14 ahead. Point index 10 (day 11 ahead) is the
 * same horizon `fixtures/window.ts`'s `fxHold` recommends holding to — the two
 * fixtures are telling the same demo story from two different screens.
 */
export const fxForecast: ForecastRes = {
  as_of_date: dateNDaysAhead(0),
  points: Array.from({ length: 14 }, (_, i) => buildPoint(i + 1)),
  model_card: { mase: 0.71, coverage_80_bps: 7840 },
};

// ─────────────────────────────────────────────────────────────────────────────
// The picker's forecast — one per (commodity, market) pair
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Same rule as `fxSeriesFor` in `fixtures/prices.ts`: once the market screen
 * has a crop picker and a district picker, a fixture that ignores which crop
 * was asked about is a fixture that lies convincingly.
 *
 * ★ Onion at Lasalgaon returns `fxForecast` itself, so the demo scenario's
 *   numbers stay pinned to `fixtures/window.ts`.
 *
 * ★ Tomato's band is wide on purpose, and it is wide because the history is:
 *   `fxSeriesFor('cmd_tomato', …)` swings ±46,000 paise on a 23-day cycle, and
 *   a quantile model fitted to that cannot produce a narrow interval. At day 14
 *   the band runs past 35% of p50 — `NO_ADVICE_BAND_THRESHOLD_BPS`, the
 *   server's refusal threshold — which is exactly the point. I6 is not a
 *   special case the app handles; it is the honest output for a crop that
 *   genuinely cannot be forecast, and the picker is what lets a judge ask for
 *   it.
 */
const MARKET_LEVEL: Record<string, number> = {
  mkt_lasalgaon: 1,
  mkt_pimpalgaon: 0.97,
  mkt_ahmednagar: 0.93,
  mkt_pune: 1.06,
};

function tomatoPoint(daysAhead: number): ForecastPoint {
  const p50 = 130000 + daysAhead * 900;
  // Starts wide and widens fast — a seven-day shelf life leaves nothing to
  // anchor a two-week forecast on.
  const bandFraction = 0.18 + daysAhead * 0.022;
  const half = Math.round((p50 * bandFraction) / 2);
  return {
    target_date: dateNDaysAhead(daysAhead),
    p10_paise_per_qtl: p50 - half,
    p50_paise_per_qtl: p50,
    p90_paise_per_qtl: p50 + half,
  };
}

function scalePoint(p: ForecastPoint, level: number): ForecastPoint {
  return {
    target_date: p.target_date,
    p10_paise_per_qtl: Math.round(p.p10_paise_per_qtl * level),
    p50_paise_per_qtl: Math.round(p.p50_paise_per_qtl * level),
    p90_paise_per_qtl: Math.round(p.p90_paise_per_qtl * level),
  };
}

/** `null` where `fxSeriesFor` also returns null — there is nothing to forecast
 * from a mandi that does not trade the crop. */
export function fxForecastFor(commodityId: string, marketId: string): ForecastRes | null {
  const level = MARKET_LEVEL[marketId];
  if (level === undefined) return null;

  if (commodityId === 'cmd_onion') {
    if (marketId === 'mkt_lasalgaon') return fxForecast;
    return {
      as_of_date: fxForecast.as_of_date,
      points: fxForecast.points.map(p => scalePoint(p, level)),
      model_card: { ...fxForecast.model_card },
    };
  }

  if (commodityId === 'cmd_tomato') {
    if (marketId === 'mkt_pimpalgaon') return null;
    return {
      as_of_date: dateNDaysAhead(0),
      points: Array.from({ length: 14 }, (_, i) => scalePoint(tomatoPoint(i + 1), level)),
      // Worse on both counts than onion, and shown rather than hidden: a MASE
      // near 1 means the model is barely beating a naive forecast, and 61%
      // coverage on an interval sold as 80% is the model admitting it is
      // overconfident. I8's spirit — the number that undercuts us is the one
      // that has to be on screen.
      model_card: { mase: 0.98, coverage_80_bps: 6120 },
    };
  }

  return null;
}
