/**
 * mrNumberWords — integer -> spoken Marathi words.
 *
 * The examples mirror the original voice prototype's `numberFormatter.ts`
 * (the module these words were transcribed from): 11 -> अकरा, 100 -> शंभर,
 * 1428 -> एक हजार चारशे अठ्ठावीस, 100000 -> एक लाख, 250000 -> दोन लाख
 * पन्नास हजार.
 */

import { spokenDays, spokenNumber, spokenRupees } from '../mrNumberWords';

describe('spokenNumber', () => {
  it('handles 0 and single digits', () => {
    expect(spokenNumber(0)).toBe('शून्य');
    expect(spokenNumber(5)).toBe('पाच');
  });
  it('handles teens and tens', () => {
    expect(spokenNumber(11)).toBe('अकरा');
    expect(spokenNumber(42)).toBe('बेचाळीस');
    expect(spokenNumber(99)).toBe('नव्व्याण्णव');
  });
  it('handles hundreds', () => {
    expect(spokenNumber(100)).toBe('शंभर');
    expect(spokenNumber(200)).toBe('दोनशे');
    expect(spokenNumber(6290)).toBe('सहा हजार दोनशे नव्वद');
  });
  it('handles thousands with Indian grouping', () => {
    expect(spokenNumber(1428)).toBe('एक हजार चारशे अठ्ठावीस');
  });
  it('handles lakhs and crores', () => {
    expect(spokenNumber(100000)).toBe('एक लाख');
    expect(spokenNumber(250000)).toBe('दोन लाख पन्नास हजार');
    expect(spokenNumber(10000000)).toBe('एक कोटी');
  });
});

describe('spokenRupees / spokenDays', () => {
  it('formats paise as spoken rupees', () => {
    // 629000 paise = ₹6,290
    expect(spokenRupees(629000)).toBe('सहा हजार दोनशे नव्वद रुपये');
  });
  it('formats days', () => {
    expect(spokenDays(11)).toBe('अकरा दिवस');
  });
});
