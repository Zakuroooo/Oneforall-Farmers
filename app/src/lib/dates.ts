/**
 * The date render edge. Pranay.
 *
 * Same role `money.ts` plays for paise: a `date` stays an ISO `YYYY-MM-DD`
 * string everywhere in `app/src/` and becomes human-readable in exactly one
 * place, here, at the moment it is put on screen.
 *
 * ★ Why this file exists: `S15_MyLots` was rendering `devNum(lot.harvest_date)`,
 *   which turns `2026-08-28` into `२०२६-०८-२८` — Devanagari digits arranged in
 *   ISO order. That is a wire format wearing a costume. No farmer reads a date
 *   that way in any language.
 *
 * ★ Why the string is parsed by hand instead of `new Date(iso)`: `new Date()` on
 *   a bare `YYYY-MM-DD` parses it as **UTC midnight**, then `getDate()` reads it
 *   back in local time. India is UTC+5:30 so we get lucky, but the same code on
 *   a machine behind UTC silently shows the previous day — and the CI box, a
 *   judge's laptop, and a rebuilt APK are all machines whose timezone we do not
 *   control. A harvest date is a calendar date, not an instant; it has no
 *   timezone, so it must never be routed through one.
 */

import { devNum, translate } from './i18n';
import type { Locale } from '../types/api';

/** `month_1` … `month_12`, so the caller cannot construct an off-by-one key. */
const MONTH_KEYS = [
  'month_1', 'month_2', 'month_3', 'month_4', 'month_5', 'month_6',
  'month_7', 'month_8', 'month_9', 'month_10', 'month_11', 'month_12',
] as const;

type YMD = { year: number; month: number; day: number };

/**
 * Splits a `YYYY-MM-DD` (optionally with a `T…` time part, which is discarded —
 * a calendar date is all we want). Returns `null` for anything else, so a
 * malformed value from the wire degrades to the caller's fallback instead of
 * rendering `NaN` on a farmer's screen.
 */
function parseIsoDate(iso: string): YMD | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match;
  // `noUncheckedIndexedAccess` — the regex guarantees all three groups, but the
  // honest way to say so is a guard, not a `!`.
  if (y === undefined || m === undefined || d === undefined) return null;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

/**
 * `2026-08-28` → `२८ ऑगस्ट २०२६` (mr/hi) or `28 August 2026` (en).
 *
 * Day-month-year in all three locales: it is the order every Indian form, ration
 * card and mandi receipt already uses, so it is the order a farmer reads without
 * having to think about which number is which.
 *
 * Returns `fallback` when `iso` is null, empty, or not a date we can parse.
 */
export function formatDate(
  iso: string | null | undefined,
  locale: Locale = 'mr',
  fallback = '',
): string {
  if (!iso) return fallback;
  const parsed = parseIsoDate(iso);
  if (!parsed) return fallback;
  const monthKey = MONTH_KEYS[parsed.month - 1];
  if (monthKey === undefined) return fallback;
  const month = translate(monthKey, locale);
  return `${devNum(parsed.day, locale)} ${month} ${devNum(parsed.year, locale)}`;
}

/**
 * The same date without the year — for a list of lots harvested this season,
 * where four rows repeating `२०२६` is noise. `2026-08-28` → `२८ ऑगस्ट`.
 */
export function formatDateShort(
  iso: string | null | undefined,
  locale: Locale = 'mr',
  fallback = '',
): string {
  if (!iso) return fallback;
  const parsed = parseIsoDate(iso);
  if (!parsed) return fallback;
  const monthKey = MONTH_KEYS[parsed.month - 1];
  if (monthKey === undefined) return fallback;
  return `${devNum(parsed.day, locale)} ${translate(monthKey, locale)}`;
}
