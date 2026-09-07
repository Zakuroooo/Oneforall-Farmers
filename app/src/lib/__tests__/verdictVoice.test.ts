/**
 * verdictVoice — the sale-window voice agent's narration composition.
 *
 * Pins the spoken Marathi for all five actions against the real fixtures
 * (`fxHold`, `fxSellNow`, `fxSellElsewhere`, `fxSplit`, `fxNoAdvice`), and the
 * pledge sentence when a quote is present. A narration that silently drops the
 * pledge — the whole "how to afford waiting" beat — is the bug these tests
 * exist to catch.
 */

import { buildVerdictNarration, REFUSAL_MR } from '../verdictVoice';
import { fxHold, fxNoAdvice, fxSellElsewhere, fxSellNow, fxSplit } from '../../fixtures/window';

describe('buildVerdictNarration — HOLD', () => {
  it('tells the farmer to hold N days and states the expected gain', () => {
    const s = buildVerdictNarration(fxHold);
    // 11 days, ₹6,290 gain on 40 quintals
    expect(s).toContain('अकरा दिवस थांबा');
    expect(s).toContain('सहा हजार दोनशे नव्वद रुपये जास्त');
  });
  it('states the worst case as a loss', () => {
    const s = buildVerdictNarration(fxHold);
    // worst_case_paise = -₹4,800 on the whole lot
    expect(s).toContain('चार हजार आठशे रुपये तोटा');
  });
  it('includes the pledge loan terms when a pledge_quote is present', () => {
    const s = buildVerdictNarration(fxHold);
    // loan_paise 3400000 = ₹34,000 = 'चौतीस हजार'; interest_paise 9221 = ₹92 = 'ब्याण्णव'
    expect(s).toContain('चौतीस हजार रुपये चे तारण कर्ज मिळेल');
    expect(s).toContain('व्याज ब्याण्णव रुपये');
  });
});

describe('buildVerdictNarration — SELL_NOW / SPLIT / SELL_ELSEWHERE', () => {
  it('SELL_NOW uses the server explain sentence', () => {
    expect(buildVerdictNarration(fxSellNow)).toBe(fxSellNow.explain_mr);
  });
  it('SPLIT says sell half, hold half', () => {
    const s = buildVerdictNarration(fxSplit);
    expect(s).toContain('अर्धा माल आजच विका, अर्धा नऊ दिवस थांबवा');
  });
  it('SELL_ELSEWHERE names the better market and distance', () => {
    const s = buildVerdictNarration(fxSellElsewhere);
    expect(s).toContain('पुणे');
    expect(s).toContain('किलोमीटर');
  });
});

describe('buildVerdictNarration — NO_ADVICE', () => {
  it('speaks the locked refusal verbatim, never rephrased', () => {
    expect(buildVerdictNarration(fxNoAdvice)).toBe(REFUSAL_MR.BAND_TOO_WIDE);
  });
});
