/**
 * The fixtures are not decoration — they are what the demo renders from on fallback
 * rung 3. These tests hold them to CANON's own arithmetic.
 *
 * A 100× unit error is the likeliest bug in this project, and it is invisible on
 * screen: ₹62,900 looks like a bigger win, not like a broken build. The only thing
 * that catches it is multiplying it out, so we multiply it out here.
 */

import { DEMO_QTY_QTL, fxHold, fxNoAdvice, fxSellElsewhere, fxSellNow, fxSplit } from '../window';
import { formatPaise } from '../../lib/money';
import type { WindowRes } from '../../types/api';

describe('fxHold — the demo verdict', () => {
  it('satisfies CANON §7.4 expected_gain identity', () => {
    const { hold_p50_net_paise_per_qtl, sell_now_net_paise_per_qtl } = fxHold;
    expect(hold_p50_net_paise_per_qtl).not.toBeNull();
    expect(
      (hold_p50_net_paise_per_qtl! - sell_now_net_paise_per_qtl) * DEMO_QTY_QTL,
    ).toBe(fxHold.expected_gain_paise);
  });

  it('satisfies CANON §7.4 worst_case identity', () => {
    const { hold_p10_net_paise_per_qtl, sell_now_net_paise_per_qtl } = fxHold;
    expect(hold_p10_net_paise_per_qtl).not.toBeNull();
    expect(
      (hold_p10_net_paise_per_qtl! - sell_now_net_paise_per_qtl) * DEMO_QTY_QTL,
    ).toBe(fxHold.worst_case_paise);
  });

  it('renders as ₹6,290 and −₹4,800 — not ₹62,900', () => {
    expect(formatPaise(fxHold.expected_gain_paise!, 'mr')).toBe('₹६,२९०');
    expect(formatPaise(fxHold.worst_case_paise!, 'mr')).toBe('−₹४,८००');
    expect(formatPaise(fxHold.expected_gain_paise!, 'en')).toBe('₹6,290');
  });

  it('is an 8% move, not an 81% one — the sanity check a judge does in their head', () => {
    const movePct =
      ((fxHold.hold_p50_net_paise_per_qtl! - fxHold.sell_now_net_paise_per_qtl) /
        fxHold.sell_now_net_paise_per_qtl) *
      100;
    expect(movePct).toBeGreaterThan(5);
    expect(movePct).toBeLessThan(15);
  });

  it('has costs that sum to their own total', () => {
    const c = fxHold.costs;
    expect(
      c.transport_paise_per_qtl +
        c.commission_paise_per_qtl +
        c.storage_paise_per_qtl +
        c.spoilage_paise_per_qtl +
        c.loading_paise_per_qtl,
    ).toBe(c.total_paise_per_qtl);
  });

  it('has a pledge quote whose interest follows CANON §8', () => {
    const p = fxHold.pledge_quote!;
    const expected = Math.floor(
      (p.loan_paise * p.rate_bps_annual * p.days) / (10000 * 365),
    );
    expect(p.interest_paise).toBe(expected);
  });

  it('shows the pledge card only when it beats its own interest (I13)', () => {
    const p = fxHold.pledge_quote!;
    expect(fxHold.expected_gain_paise!).toBeGreaterThan(p.interest_paise);
    expect(p.is_worthwhile).toBe(true);
  });
});

describe('fxNoAdvice — the refusal (I6)', () => {
  it('nulls the forecast but keeps today’s price and the costs', () => {
    expect(fxNoAdvice.hold_p50_net_paise_per_qtl).toBeNull();
    expect(fxNoAdvice.expected_gain_paise).toBeNull();
    expect(fxNoAdvice.worst_case_paise).toBeNull();
    // Refusing to forecast is not refusing to inform.
    expect(fxNoAdvice.sell_now_net_paise_per_qtl).toBeGreaterThan(0);
    expect(fxNoAdvice.costs.total_paise_per_qtl).toBeGreaterThan(0);
  });

  it('carries a reason and never a pledge card', () => {
    expect(fxNoAdvice.refusal_reason).toBe('BAND_TOO_WIDE');
    expect(fxNoAdvice.pledge_quote).toBeNull();
  });

  it('refuses because the band is genuinely wide — 58% against a 35% threshold', () => {
    expect(fxNoAdvice.band_width_bps).toBeGreaterThan(3500);
    expect(fxNoAdvice.confidence).toBe('LOW');
  });

  it('has a Marathi explanation to render verbatim', () => {
    expect(fxNoAdvice.explain_mr.length).toBeGreaterThan(0);
    expect(fxNoAdvice.explain_mr).toMatch(/[ऀ-ॿ]/); // actually Devanagari
  });
});

describe('every fixture', () => {
  const all: Array<[string, WindowRes]> = [
    ['fxHold', fxHold],
    ['fxNoAdvice', fxNoAdvice],
    ['fxSellElsewhere', fxSellElsewhere],
    ['fxSellNow', fxSellNow],
    ['fxSplit', fxSplit],
  ];

  // P5/S10's own acceptance bar (PRANAY.md): the five per-qtl lines sum to
  // total_paise_per_qtl. Checked for every action, not just fxHold — S10 is the
  // same expandable section on every verdict, HOLD included.
  it.each(all)('%s: the five cost lines sum to total_paise_per_qtl', (_name, fx) => {
    const c = fx.costs;
    expect(
      c.transport_paise_per_qtl +
        c.commission_paise_per_qtl +
        c.storage_paise_per_qtl +
        c.spoilage_paise_per_qtl +
        c.loading_paise_per_qtl,
    ).toBe(c.total_paise_per_qtl);
  });

  it.each(all)('%s has every CANON key present, nulls and all', (_name, fx) => {
    // `pledge_quote: null` is a present key with a null value, not a missing key.
    // Screens branch on null; they must never branch on `undefined`.
    for (const key of [
      'action',
      'hold_days',
      'confidence',
      'band_width_bps',
      'sell_now_net_paise_per_qtl',
      'hold_p50_net_paise_per_qtl',
      'hold_p10_net_paise_per_qtl',
      'expected_gain_paise',
      'worst_case_paise',
      'costs',
      'alt_market',
      'pledge_quote',
      'refusal_reason',
      'model_card',
      'explain_mr',
      'explain_en',
      'data_source',
    ]) {
      expect(fx).toHaveProperty(key);
      expect((fx as unknown as Record<string, unknown>)[key]).not.toBeUndefined();
    }
  });

  it.each(all)('%s carries a refusal_reason iff it is NO_ADVICE', (_name, fx) => {
    expect(fx.refusal_reason !== null).toBe(fx.action === 'NO_ADVICE');
  });

  it.each(all)('%s labels its data source (I8)', (_name, fx) => {
    expect(['AGMARKNET', 'MSAMB', 'ARCHIVE', 'IMPUTED', 'SYNTHETIC']).toContain(fx.data_source);
  });

  it.each(all)('%s keeps every paise value an integer (I1)', (_name, fx) => {
    const money = [
      fx.sell_now_net_paise_per_qtl,
      fx.hold_p50_net_paise_per_qtl,
      fx.hold_p10_net_paise_per_qtl,
      fx.expected_gain_paise,
      fx.worst_case_paise,
      ...Object.values(fx.costs),
      ...(fx.pledge_quote ? [fx.pledge_quote.loan_paise, fx.pledge_quote.interest_paise] : []),
    ].filter((v): v is number => v !== null);

    for (const v of money) expect(Number.isInteger(v)).toBe(true);
  });
});
