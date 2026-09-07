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

  it('returns all nulls for an empty transcript', () => {
    expect(parseFarmerDetails('   ', fxDistricts)).toEqual({
      name: null,
      districtId: null,
      village: null,
    });
  });
});
