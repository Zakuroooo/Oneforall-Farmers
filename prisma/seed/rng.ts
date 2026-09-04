/**
 * Deterministic PRNG for the seed. OWNER: R5.
 *
 * WHY THIS FILE EXISTS: if the seed is non-deterministic, the ledger total on your slide
 * differs from the one on screen at demo time. A judge who notices that contradiction has
 * found a reason to distrust every other number you showed, and there is no graceful
 * recovery in the room.
 *
 * RULES
 *  - No `Math.random()` anywhere under prisma/seed. Ever.
 *  - No `new Date()` in generated history — derive every date from SEED_TODAY.
 *  - Acceptance: `npm run db:reset` twice → ledger totals byte-identical.
 *
 * SECURITY NOTE: mulberry32 is a *statistical* PRNG, not a cryptographic one. It is correct
 * here (we want reproducibility) and wrong everywhere else. OTPs and idempotency keys use
 * `crypto.randomInt` / `crypto.randomUUID` — see S-rules in docs/02_SECURITY_AND_QUALITY.md.
 */

/** The demo's "today". Every generated date is an offset from this. Never `new Date()`. */
export const SEED_TODAY = new Date('2026-09-01T00:00:00.000Z');

export const SEED = 26132; // the problem statement number, because why not

/** mulberry32 — small, fast, good enough statistically, exactly reproducible. */
export function makeRng(seed: number = SEED): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A named sub-stream. Use one per generator (`rngFor('buyers')`, `rngFor('history')`) so
 * that adding a farmer does not shift every price downstream of it — otherwise one edit
 * silently changes every number in the demo script and you re-verify all twelve beats.
 */
export function rngFor(name: string, seed: number = SEED): () => number {
  let h = seed >>> 0;
  for (let i = 0; i < name.length; i++) h = (Math.imul(h ^ name.charCodeAt(i), 0x01000193) >>> 0);
  return makeRng(h);
}

/** Integer in [min, max] inclusive. */
export function intBetween(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Pick one element. Throws on empty — a silent `undefined` here surfaces 200 rows later. */
export function pick<T>(rng: () => number, xs: readonly T[]): T {
  if (xs.length === 0) throw new Error('pick() from an empty array');
  return xs[Math.floor(rng() * xs.length)]!;
}

/** Weighted pick. Weights need not sum to 1. */
export function pickWeighted<T>(rng: () => number, xs: readonly (readonly [T, number])[]): T {
  const total = xs.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [x, w] of xs) {
    r -= w;
    if (r <= 0) return x;
  }
  return xs[xs.length - 1]![0];
}

/** Fisher-Yates, in place, deterministic. */
export function shuffle<T>(rng: () => number, xs: T[]): T[] {
  for (let i = xs.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [xs[i], xs[j]] = [xs[j]!, xs[i]!];
  }
  return xs;
}

/** Approximately normal (sum of 3 uniforms), clamped. For prices and grades, not money. */
export function jitter(rng: () => number, spread: number): number {
  const n = (rng() + rng() + rng()) / 3 - 0.5;
  return n * 2 * spread;
}

/** Days offset from SEED_TODAY. Negative = past. */
export function dayOffset(days: number): Date {
  const d = new Date(SEED_TODAY);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** ISO calendar day, the contract's date format. */
export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}
