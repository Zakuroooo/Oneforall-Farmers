/**
 * Sarvam rejects any input over 500 characters. The explanatory narration is
 * routinely longer than that, so every server-voice call was 400ing and the
 * app was silently falling back to the device engine.
 */

import { chunkForSarvam } from '../voice';
import { buildHomeNarration } from '../pageNarration';
import { fxHold } from '../../fixtures/window';
import { fxPriceSeries } from '../../fixtures/prices';

const LIMIT = 500;

describe('chunkForSarvam', () => {
  it('leaves a short narration as one chunk', () => {
    expect(chunkForSarvam('नमस्कार. आजचा भाव दोन हजार रुपये आहे.')).toHaveLength(1);
  });

  it('keeps every chunk inside Sarvam’s limit', () => {
    const long = 'आज लासलगाव मंडईत कांद्याचा भाव दोन हजार चौपन्न रुपये आहे. '.repeat(30);
    for (const c of chunkForSarvam(long)) {
      expect(c.length).toBeLessThanOrEqual(LIMIT);
    }
  });

  it('splits on sentence ends, including the Devanagari danda', () => {
    // Danda-separated text must not come back as one oversized chunk.
    const text = ('भाव वाढतो आहे। '.repeat(60)).trim();
    const chunks = chunkForSarvam(text);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(LIMIT);
  });

  it('never drops or reorders words', () => {
    const long = 'one two three four five six seven eight nine ten. '.repeat(25);
    const rejoined = chunkForSarvam(long).join(' ').replace(/\s+/g, ' ').trim();
    expect(rejoined).toBe(long.replace(/\s+/g, ' ').trim());
  });

  it('breaks a single over-long sentence on word boundaries', () => {
    // No terminator anywhere — the fallback path.
    const runOn = 'word '.repeat(400).trim();
    const chunks = chunkForSarvam(runOn);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.length).toBeLessThanOrEqual(LIMIT);
      // A word must never be cut in half.
      expect(c).not.toMatch(/^ord|wor$/);
    }
  });

  /**
   * ★ The regression that actually bit: the real Home narration, in every
   *   language, must be sendable to Sarvam.
   */
  it('makes the real Home narration sendable in all three languages', () => {
    const p = fxPriceSeries.points;
    const last = p[p.length - 1]!;
    const prev = p[p.length - 2]!;
    for (const locale of ['mr', 'hi', 'en'] as const) {
      const narration = buildHomeNarration(
        {
          farmerName: 'Rambhau',
          marketName: 'Lasalgaon',
          cropName: 'onion',
          latest: last,
          deltaPaise: last.modal_paise_per_qtl - prev.modal_paise_per_qtl,
          streakDays: 7,
          verdict: fxHold,
          lotKg: 4000,
          holdCostPaisePerQtl: fxHold.costs.total_paise_per_qtl,
        },
        locale,
      );
      // Proves the bug existed: this really is over the limit.
      expect(narration.length).toBeGreaterThan(LIMIT);
      for (const c of chunkForSarvam(narration)) {
        expect(c.length).toBeLessThanOrEqual(LIMIT);
      }
    }
  });
});
