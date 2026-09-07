/**
 * The seven cases from `docs/roles/PRANAY.md` §2.4, plus the edges they imply.
 *
 * These run before a single screen exists. If `formatPaise` is wrong, every rupee
 * figure in the demo is wrong in the same direction and nobody notices until a
 * judge recomputes ₹6,290 from the screen and gets a different number.
 *
 *     npx jest src/lib
 */

import { formatPaise, toQuintal, formatNumber, formatBps, formatQuintal, quintalValuePaise } from '../money';

describe('formatPaise', () => {
  it('renders the demo gain in all three locales', () => {
    expect(formatPaise(629000, 'mr')).toBe('₹६,२९०');
    expect(formatPaise(629000, 'hi')).toBe('₹६,२९०'); // Hindi shares Devanagari digits
    expect(formatPaise(629000, 'en')).toBe('₹6,290');
  });

  it('groups the Indian way, not the Western way', () => {
    expect(formatPaise(14200000, 'mr')).toBe('₹१,४२,०००'); // not ₹१४२,०००
    expect(formatPaise(14200000, 'en')).toBe('₹1,42,000');
    expect(formatPaise(100000000, 'en')).toBe('₹10,00,000');
  });

  it('renders the demo worst case with a minus sign, not a hyphen', () => {
    expect(formatPaise(-480000, 'mr')).toBe('−₹४,८००');
    expect(formatPaise(-480000, 'en')).toBe('−₹4,800');
    expect(formatPaise(-480000, 'mr').charCodeAt(0)).toBe(0x2212);
  });

  it('floors the magnitude, so a loss is never overstated by a rupee', () => {
    // Math.floor(-480050 / 100) is -4801. Wrong. Magnitude first, sign after.
    expect(formatPaise(-480050, 'mr')).toBe('−₹४,८००');
    expect(formatPaise(-480099, 'en')).toBe('−₹4,800');
  });

  it('floors a gain too — never shows a rupee that will not arrive', () => {
    expect(formatPaise(629099, 'en')).toBe('₹6,290');
    expect(formatPaise(99, 'en')).toBe('₹0');
  });

  it('defaults to Marathi', () => {
    expect(formatPaise(629000)).toBe('₹६,२९०');
  });

  it('handles small and zero values', () => {
    expect(formatPaise(0, 'mr')).toBe('₹०');
    expect(formatPaise(50000, 'en')).toBe('₹500');
  });
});

describe('toQuintal', () => {
  it('floors — 4050 kg is 40 quintals on screen, not 41', () => {
    expect(toQuintal(4050)).toBe(40);
    expect(toQuintal(4000)).toBe(40);
    expect(toQuintal(99)).toBe(0);
  });
});

describe('formatNumber', () => {
  it('renders the hold window in Devanagari', () => {
    expect(formatNumber(11, 'mr')).toBe('११');
    expect(formatNumber(11, 'hi')).toBe('११');
    expect(formatNumber(11, 'en')).toBe('11');
    expect(formatNumber(40, 'mr')).toBe('४०');
  });
});

describe('formatBps', () => {
  it('renders a band width as a floored percentage', () => {
    expect(formatBps(2140, 'mr')).toBe('२१%');
    expect(formatBps(5820, 'mr')).toBe('५८%'); // the refusal-screen band
    expect(formatBps(3500, 'en')).toBe('35%'); // the refusal threshold
  });
});

describe('formatQuintal', () => {
  it('says the part quintal instead of flooring it away', () => {
    expect(formatQuintal(10050, 'en')).toBe('100.5');
    expect(formatQuintal(2050, 'en')).toBe('20.5');
  });

  it('stays whole when the weight is whole', () => {
    expect(formatQuintal(10000, 'en')).toBe('100');
    expect(formatQuintal(4000, 'en')).toBe('40');
  });

  it('does not render a pointless .0 for a sub-10 kg remainder', () => {
    expect(formatQuintal(10003, 'en')).toBe('100');
    // ...and rolls up rather than showing "100.10"
    expect(formatQuintal(10098, 'en')).toBe('101');
  });

  it('renders Devanagari digits, decimal point included', () => {
    expect(formatQuintal(10050, 'mr')).toBe('१००.५');
  });
});

describe('quintalValuePaise', () => {
  /**
   * The bug this exists to prevent: `price * toQuintal(kg)` floors the weight
   * first, so up to 99 kg of a lot silently stops being paid for.
   */
  it('pays for the whole weight, not the floored quintal count', () => {
    // 4050 kg at ₹1,950/qtl is ₹78,975 — not ₹78,000.
    expect(quintalValuePaise(195000, 4050)).toBe(7897500);
    expect(quintalValuePaise(195000, 4050)).not.toBe(195000 * toQuintal(4050));
  });

  it('is exact on whole quintals', () => {
    expect(quintalValuePaise(195000, 4000)).toBe(7800000);
  });

  it('returns an integer number of paise (I1)', () => {
    expect(Number.isInteger(quintalValuePaise(196333, 2051))).toBe(true);
  });
});
