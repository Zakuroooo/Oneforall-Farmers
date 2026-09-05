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
