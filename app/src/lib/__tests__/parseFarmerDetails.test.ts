/**
 * The details screen fills a farmer's name, district and village from one
 * spoken sentence. These pin the shapes people actually say — and, more
 * importantly, that it declines to guess.
 */

import { parseFarmerDetails } from '../parseFarmerDetails';
import { fxDistricts } from '../../fixtures/auth';

describe('parseFarmerDetails', () => {
  it('parses the canonical English sentence from the design', () => {
    const r = parseFarmerDetails('Rambhau Patil, Nashik district, Niphad village', fxDistricts);
    expect(r.name).toBe('Rambhau Patil');
    expect(r.districtId).toBe(fxDistricts.find(d => d.name === 'Nashik')?.id);
    expect(r.village).toBe('Niphad');
  });

  it('parses the same sentence in Marathi', () => {
    const r = parseFarmerDetails('रामभाऊ पाटील, नाशिक जिल्हा, निफाड गाव', fxDistricts);
    expect(r.name).toBe('रामभाऊ पाटील');
    expect(r.districtId).toBe(fxDistricts.find(d => d.name === 'Nashik')?.id);
    expect(r.village).toBe('निफाड');
  });

  it('treats a single segment as the name, not a village', () => {
    const r = parseFarmerDetails('Rambhau Patil', fxDistricts);
    expect(r.name).toBe('Rambhau Patil');
    expect(r.districtId).toBeNull();
    expect(r.village).toBeNull();
  });

  it('leaves the district unset rather than guessing an unknown one', () => {
    const r = parseFarmerDetails('Rambhau Patil, Atlantis district', fxDistricts);
    expect(r.name).toBe('Rambhau Patil');
    // The one thing this parser must never do: put a farmer's lot in the
    // wrong mandi because it picked the nearest-sounding district.
    expect(r.districtId).toBeNull();
  });

  /**
   * ★ The shape that was actually broken on the device. Sarvam returns
   *   continuous speech with **no punctuation at all**, and the parser used to
   *   split on commas — so the whole sentence arrived as one segment and every
   *   word landed in the name field. The farmer had said all three correctly.
   */
  it('parses continuous speech with no commas at all', () => {
    const r = parseFarmerDetails('Pranay Sarkar district Pune village Kokamthan', fxDistricts);
    expect(r.name).toBe('Pranay Sarkar');
    expect(r.districtId).toBe(fxDistricts.find(d => d.name === 'Pune')?.id);
    expect(r.village).toBe('Kokamthan');
  });

  it('parses continuous Marathi speech with the marker after the value', () => {
    const r = parseFarmerDetails('प्रणय सरकार नाशिक जिल्हा निफाड गाव', fxDistricts);
    expect(r.name).toBe('प्रणय सरकार');
    expect(r.districtId).toBe(fxDistricts.find(d => d.name === 'Nashik')?.id);
    expect(r.village).toBe('निफाड');
  });

  it('does not fire a marker inside a surname that contains it', () => {
    // "Gaonkar" contains "gaon". Splitting there would truncate the name.
    const r = parseFarmerDetails('Suresh Gaonkar', fxDistricts);
    expect(r.name).toBe('Suresh Gaonkar');
    expect(r.village).toBeNull();
  });

  /**
   * ★ What Sarvam actually returns. Verified by a real round trip: the app's
   *   own TTS spoke the sentence, the WAV went back through /voice/transcribe,
   *   and these are the transcripts that came out. Every one of them broke the
   *   parser at some point.
   */
  describe('real Sarvam transcripts', () => {
    const cases: Array<[string, string, string | null, string | null]> = [
      // Marathi, prefix order with commas — the shape that found the bug.
      ['माझे नाव रामभाऊ पाटील, जिल्हा नाशिक, गाव निफाड.', 'रामभाऊ पाटील', 'Nashik', 'निफाड'],
      // Marathi, prefix order, no punctuation at all.
      ['माझे नाव रामभाऊ पाटील जिल्हा नाशिक गाव निफाड', 'रामभाऊ पाटील', 'Nashik', 'निफाड'],
      // Marathi, postfix order.
      ['रामभाऊ पाटील, नाशिक जिल्हा, निफाड गाव', 'रामभाऊ पाटील', 'Nashik', 'निफाड'],
      // Hindi — 'गाँव' with chandrabindu, not the anusvara spelling.
      ['मेरा नाम प्रणय सरकार है, जिला पुणे, गाँव कोकमठाण', 'प्रणय सरकार', 'Pune', 'कोकमठाण'],
      // English, both word orders.
      ['My name is Pranay Sarkar, district Pune, village Kokamthan', 'Pranay Sarkar', 'Pune', 'Kokamthan'],
      ['Pranay Sarkar district Pune village Kokamthan', 'Pranay Sarkar', 'Pune', 'Kokamthan'],
    ];
    it.each(cases)('parses %s', (input, name, district, village) => {
      const r = parseFarmerDetails(input, fxDistricts);
      expect(r.name).toBe(name);
      expect(r.districtId).toBe(fxDistricts.find(d => d.name === district)?.id);
      expect(r.village).toBe(village);
    });
  });

  it('returns all nulls for an empty transcript', () => {
    expect(parseFarmerDetails('   ', fxDistricts)).toEqual({
      name: null,
      districtId: null,
      village: null,
    });
  });
});
