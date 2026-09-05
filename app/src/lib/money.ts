/**
 * Money and units. I1, I2, I3 live in this file.
 *
 * ★ `formatPaise` and `toQuintal` are the ONLY two places in `app/src/` where a
 *   division by 100 is allowed to happen. Before every push:
 *
 *       grep -rn "/ 100\|parseFloat\|toFixed" app/src --include=*.ts --include=*.tsx
 *
 *   Two hits, both in this file. Any third hit is a bug in the money path.
 *
 * Everything above the render edge is an integer of paise. These functions are
 * the render edge, and their output never goes back into arithmetic.
 */

import type { Locale } from '../types/api';

const DEVANAGARI = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'] as const;

/**
 * Latin digits -> Devanagari, in the one place the table is read.
 *
 * The `?? d` is not defensive noise: `noUncheckedIndexedAccess` types
 * `DEVANAGARI[i]` as `string | undefined`, and the honest way to satisfy that is a
 * fallback, not a `!`. The regex only ever matches 0–9 so it cannot fire — but if
 * someone widens the pattern later, an untranslated digit is a far better failure
 * than a crash inside a currency formatter.
 */
function toDevanagari(s: string): string {
  return s.replace(/\d/g, d => DEVANAGARI[Number(d)] ?? d);
}

/**
 * Indian digit grouping: last three, then twos.
 *   6290    -> "6,290"
 *   142000  -> "1,42,000"     (not "142,000" — that is the Western grouping)
 *
 * A judge from Maharashtra reads "1,42,000" without pausing and "142,000" with a
 * pause. The pause is the bug.
 */
function groupIndian(n: number): string {
  const s = String(n);
  if (s.length <= 3) return s;
  const head = s.slice(0, -3);
  const tail = s.slice(-3);
  return head.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + tail;
}

/**
 * Paise -> a rupee string for display. Display only.
 *
 * Three choices in here are deliberate and each one is a bug if reversed:
 *
 *  1. **`Math.floor`, not `Math.round`.** Rounding up shows a farmer a rupee he
 *     will not receive. We always round toward the less flattering number.
 *
 *  2. **`Math.abs` first, sign restored after.** `Math.floor(-480050 / 100)` is
 *     `-4801` — flooring a negative rounds *away* from zero and overstates the
 *     loss by a rupee. Magnitude first, then the sign.
 *
 *  3. **The condition is `locale === 'en'`, not `locale === 'mr'`.** Hindi uses
 *     the same Devanagari digits as Marathi. Writing the test the other way round
 *     silently gives every Hindi user Latin numerals, and nobody on the team
 *     reads Hindi closely enough to catch it in review.
 *
 * The minus is U+2212 MINUS SIGN, not a hyphen — it aligns with the digits at
 * 28 sp, and at that size a hyphen visibly does not.
 */
export function formatPaise(paise: number, locale: Locale = 'mr'): string {
  const rupees = Math.floor(Math.abs(paise) / 100);
  const grouped = groupIndian(rupees);
  const digits = locale === 'en' ? grouped : toDevanagari(grouped);
  return `${paise < 0 ? '−' : ''}₹${digits}`;
}

/**
 * Kilograms -> quintals, for display. 1 qtl = 100 kg (I2).
 *
 * **Floor, never round.** 4050 kg is 40 quintals on screen, not 41. The farmer is
 * paid for 40; showing 41 is a promise the transaction does not keep.
 *
 * Storage stays in kg everywhere. This is the display edge and nothing else.
 */
export function toQuintal(kg: number): number {
  return Math.floor(kg / 100);
}

/**
 * Integer count -> Devanagari, for the non-money numbers: hold days, quintals,
 * distance. `11` -> `११`. English passes through.
 *
 * Kept next to `formatPaise` so the digit table has exactly one definition.
 */
export function formatNumber(n: number, locale: Locale = 'mr'): string {
  const s = String(Math.abs(Math.trunc(n)));
  const digits = locale === 'en' ? s : toDevanagari(s);
  return `${n < 0 ? '−' : ''}${digits}`;
}

/**
 * Basis points -> a percentage string. 2140 bps -> "२१%" / "21%".
 *
 * Floors, for the same reason as everything else here. Used for the band width on
 * S7 and the refusal screen — **never** for confidence, which is an enum string
 * (`LOW | MEDIUM | HIGH`) and is rendered as a word.
 */
export function formatBps(bps: number, locale: Locale = 'mr'): string {
  return `${formatNumber(Math.floor(bps / 100), locale)}%`;
}
