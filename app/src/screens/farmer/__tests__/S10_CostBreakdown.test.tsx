/**
 * P5's gate, made mechanical: **the five itemised lines sum to
 * `total_paise_per_qtl`.** PRANAY.md's task table words it as "verified by hand",
 * and it was — `fxHold` closes at 8000 + 3075 + 1650 + 2310 + 500 = 15535 — but a
 * hand check verifies one fixture on one afternoon. This verifies every fixture on
 * every commit, which is the difference between having checked it and it staying
 * checked.
 *
 * ★ Note what is NOT asserted: that the *screen* computes the total. It must not.
 *   S10 renders the server's `total_paise_per_qtl` verbatim; the sum identity is a
 *   property of the contract, so it is tested against the fixtures directly. If a
 *   real response ever violates it, this suite is where that shows up as a
 *   contract bug — not as a screen quietly displaying its own arithmetic instead
 *   of the server's.
 */

import { fxHold, fxNoAdvice, fxSellElsewhere, fxSellNow, fxSplit, DEMO_QTY_KG, DEMO_QTY_QTL } from '../../../fixtures/window';
import { formatPaise, toQuintal } from '../../../lib/money';
import type { WindowRes } from '../../../types/api';

const ALL: Array<[string, WindowRes]> = [
  ['HOLD', fxHold],
  ['NO_ADVICE', fxNoAdvice],
  ['SELL_ELSEWHERE', fxSellElsewhere],
  ['SELL_NOW', fxSellNow],
  ['SPLIT', fxSplit],
];

describe('★ P5 gate — the five cost lines sum to the total', () => {
  it.each(ALL)('%s: transport + commission + storage + spoilage + loading === total', (_name, fx) => {
    const c = fx.costs;
    const sum =
      c.transport_paise_per_qtl +
      c.commission_paise_per_qtl +
      c.storage_paise_per_qtl +
      c.spoilage_paise_per_qtl +
      c.loading_paise_per_qtl;
    expect(sum).toBe(c.total_paise_per_qtl);
  });

  it('HOLD closes at the hand-checked value, so a fixture edit cannot drift silently', () => {
    expect(fxHold.costs.total_paise_per_qtl).toBe(15535);
    expect(8000 + 3075 + 1650 + 2310 + 500).toBe(15535);
  });

  /**
   * ★ I6 — a refusal still knows its costs. `fxNoAdvice` nulls every forecast
   * field but keeps `costs` populated, so S10 is fully renderable on the branch
   * where S9 refuses to advise. A judge asking "what happens when the model is
   * wrong" can still tap through to the cost sheet.
   */
  it('NO_ADVICE keeps costs populated — S10 renders on the refusal branch too', () => {
    expect(fxNoAdvice.costs.total_paise_per_qtl).toBeGreaterThan(0);
    expect(fxNoAdvice.hold_p50_net_paise_per_qtl).toBeNull();
  });
});

describe('S10 whole-lot arithmetic (I1/I2)', () => {
  it('per-quintal × floored quintals, and every input is an integer of paise', () => {
    const qtl = toQuintal(DEMO_QTY_KG);
    expect(qtl).toBe(DEMO_QTY_QTL);

    const whole = fxHold.costs.total_paise_per_qtl * qtl;
    expect(whole).toBe(621400); // ₹6,214 on four tonnes
    expect(Number.isInteger(whole)).toBe(true);
  });

  it('floors kg to quintals rather than rounding up — 4050 kg is 40 quintals, never 41', () => {
    expect(toQuintal(4050)).toBe(40);
  });

  it('renders the whole-lot total in grouped Devanagari, not Latin digits', () => {
    const whole = fxHold.costs.total_paise_per_qtl * DEMO_QTY_QTL;
    expect(formatPaise(whole, 'mr')).toBe('₹६,२१४');
    expect(formatPaise(whole, 'en')).toBe('₹6,214');
  });
});
