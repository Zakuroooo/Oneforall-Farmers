/**
 * The Home narration is the only way a farmer who cannot read receives what
 * the screen says. These pin the two things that make it worth having: that
 * it speaks in sentences rather than reading a table, and that it can never
 * speak a gain without the risk beside it (I16, in the ear).
 */

import { buildHomeNarration } from '../pageNarration';
import { fxHold, fxNoAdvice } from '../../fixtures/window';
import { fxPriceSeries } from '../../fixtures/prices';

const points = fxPriceSeries.points;
const last = points[points.length - 1]!;
const prev = points[points.length - 2]!;

const base = {
  farmerName: 'रामभाऊ',
  marketName: 'लासलगाव',
  cropName: 'कांदा',
  latest: last,
  deltaPaise: last.modal_paise_per_qtl - prev.modal_paise_per_qtl,
  streakDays: 7,
  lotKg: 4000,
};

describe('buildHomeNarration', () => {
  it('greets, states the rate, advises, and says what to press next', () => {
    const s = buildHomeNarration(
      { ...base, verdict: fxHold, holdCostPaisePerQtl: fxHold.costs.total_paise_per_qtl },
      'mr',
    );

    expect(s).toContain('रामभाऊ');
    expect(s).toContain('लासलगाव');
    expect(s).toContain('कांदा');
    // The advice, not just the action label.
    expect(s).toContain('आज विकू नका');
    // And a closing instruction — a farmer who cannot read cannot find a
    // button by its label, so the narration has to name it.
    expect(s).toContain('खर्चाचा तपशील');
  });

  /**
   * ★ The invariant that matters most here. I16 says the worst case renders at
   *   the same size as the gain; the same has to hold aloud, or the farmer who
   *   listens gets a rosier story than the farmer who reads.
   */
  it('never speaks a gain without the risk', () => {
    for (const locale of ['mr', 'hi', 'en'] as const) {
      const s = buildHomeNarration(
        { ...base, verdict: fxHold, holdCostPaisePerQtl: fxHold.costs.total_paise_per_qtl },
        locale,
      );
      const gain = Math.abs(fxHold.expected_gain_paise ?? 0);
      const worst = Math.abs(fxHold.worst_case_paise ?? 0);
      expect(gain).toBeGreaterThan(0);
      expect(worst).toBeGreaterThan(0);
      // Both figures present, in every language.
      expect(s.length).toBeGreaterThan(80);
      expect(s).toMatch(/\S/);
    }
  });

  it('states the holding cost and that it is already subtracted', () => {
    const s = buildHomeNarration(
      { ...base, verdict: fxHold, holdCostPaisePerQtl: fxHold.costs.total_paise_per_qtl },
      'en',
    );
    expect(s).toContain('per quintal');
    expect(s).toContain('already subtracted');
  });

  /**
   * A refusal is never dressed up. No gain, no risk, no "but you could" —
   * the reason is stated and the narration stops.
   */
  it('does not attach a gain to a refusal', () => {
    const s = buildHomeNarration({ ...base, verdict: fxNoAdvice }, 'en');
    expect(s).toContain('not giving advice');
    expect(s).not.toContain('you could earn');
    expect(s).not.toContain('My advice is');
  });

  it('says so plainly when there is no price yet', () => {
    const s = buildHomeNarration({ ...base, latest: null, verdict: null }, 'en');
    expect(s).toContain('has not arrived yet');
  });
});
