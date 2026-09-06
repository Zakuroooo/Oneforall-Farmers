/**
 * Pinning tests for `lib/grading.ts`, CANON §9. Run with the unfiltered
 * `npx jest` — nothing here is excluded by a path filter.
 *
 *     npx jest src/lib
 */

import { computeGrade } from '../grading';
import type { AssayReq } from '../../types/api';

const allAt = (v: 1 | 2 | 3, damagePct: number): AssayReq => ({
  size_uniform: v,
  colour_uniform: v,
  sprouting: v,
  damage_pct: damagePct,
  moisture_feel: v,
  foreign_matter: v,
});

describe('computeGrade — score boundaries', () => {
  it('lands on exactly 750 — the A/B boundary — and grades A', () => {
    // All five 1|2|3 dims at their max (3) contribute their full weight
    // (200+150+200+100+100 = 750); damage_pct=100 zeroes out damage's 250.
    const result = computeGrade(allAt(3, 100));
    expect(result.score).toBe(750);
    expect(result.grade).toBe('A');
  });

  it('lands on exactly 500 — the B/C boundary — and grades B', () => {
    // All five 1|2|3 dims at their middle value (2) contribute half weight
    // (100+75+100+50+50 = 375); damage_pct=50 contributes half of 250 (125).
    const result = computeGrade(allAt(2, 50));
    expect(result.score).toBe(500);
    expect(result.grade).toBe('B');
  });

  it('one below the A/B boundary grades B, not A', () => {
    const result = computeGrade(allAt(3, 100));
    const oneBelow: AssayReq = { ...allAt(3, 100), foreign_matter: 2 };
    expect(oneBelow).not.toEqual(result); // sanity: input actually changed
    expect(computeGrade(oneBelow).score).toBe(700);
    expect(computeGrade(oneBelow).grade).toBe('B');
  });

  it('one below the B/C boundary grades C, not B', () => {
    const belowB: AssayReq = { ...allAt(2, 50), foreign_matter: 1 };
    expect(computeGrade(belowB).score).toBe(450);
    expect(computeGrade(belowB).grade).toBe('C');
  });

  /**
   * ★ FRONTEND_NEEDS_AI.md §8.1(a)'s own worked example, and a deliberate
   * departure from this task's literal instruction.
   *
   * The task text asks to pin damage_pct=15 (rest at 2) to 587. The unrounded
   * value is 587.5 (checked against the handover doc's own worked example,
   * which states this exact number). Round-half-up of 587.5 is 588, not 587
   * — 587 is what floor(587.5) or round-half-*down* would give. The same
   * task instruction also says "round half-up a single time at the very
   * end", and the handover doc's own request is "round once at the end,
   * half-up, and say so". Those two instructions cannot both be satisfied
   * for this input: an algorithm that is faithfully half-up cannot produce
   * 587 from 587.5.
   *
   * Resolution: `computeGrade` implements round-half-up faithfully (matching
   * what was explicitly requested and what the handover doc asks the
   * eventual server to also do, so client and server agree digit-for-digit).
   * This test pins the value that algorithm actually produces, 588, rather
   * than asserting a number that algorithm cannot produce.
   */
  it('damage_pct=15, rest at 2, rounds half-up to 588 (not 587 — see comment)', () => {
    const result = computeGrade({
      size_uniform: 2,
      colour_uniform: 2,
      sprouting: 2,
      damage_pct: 15,
      moisture_feel: 2,
      foreign_matter: 2,
    });
    expect(result.score).toBe(588);
    expect(result.grade).toBe('B');
  });
});

describe('computeGrade — weakest_dimension tie-break', () => {
  it('breaks a tie between size_uniform and sprouting (weight 200 each) in favour of sprouting', () => {
    const input: AssayReq = {
      size_uniform: 1, // shortfall 200
      colour_uniform: 3, // shortfall 0
      sprouting: 1, // shortfall 200 — ties size_uniform
      damage_pct: 0, // shortfall 0
      moisture_feel: 3,
      foreign_matter: 3,
    };
    expect(computeGrade(input).weakest_dimension).toBe('sprouting');
  });

  it('damage_pct outranks every tie, per the fixed precedence order', () => {
    const input: AssayReq = {
      size_uniform: 1, // shortfall 200
      colour_uniform: 1, // shortfall 150
      sprouting: 1, // shortfall 200 — ties size_uniform
      damage_pct: 100, // shortfall 250 — strictly largest, must win outright
      moisture_feel: 1,
      foreign_matter: 1,
    };
    expect(computeGrade(input).weakest_dimension).toBe('damage_pct');
  });

  it('a genuine single largest shortfall wins regardless of position in the tie-break order', () => {
    const input: AssayReq = {
      size_uniform: 3,
      colour_uniform: 1, // shortfall 150 — the only non-zero one
      sprouting: 3,
      damage_pct: 0,
      moisture_feel: 3,
      foreign_matter: 3,
    };
    expect(computeGrade(input).weakest_dimension).toBe('colour_uniform');
  });

  it('a perfect score (1000) still names a weakest_dimension — first in tie-break order among equal zero shortfalls', () => {
    const perfect: AssayReq = allAt(3, 0);
    const result = computeGrade(perfect);
    expect(result.score).toBe(1000);
    expect(result.grade).toBe('A');
    // Every shortfall is 0 — an all-tied case. `weakest_dimension` is `not
    // null` in the DDL (FRONTEND_NEEDS_AI.md §8.1(b), flagged there as Q7),
    // so the fixed precedence order still names one rather than the field
    // going missing.
    expect(result.weakest_dimension).toBe('damage_pct');
  });
});

describe('computeGrade — integer-only, no photo', () => {
  it('never returns a fractional score', () => {
    for (let damage = 0; damage <= 100; damage += 7) {
      const score = computeGrade(allAt(2, damage)).score;
      expect(Number.isInteger(score)).toBe(true);
    }
  });

  it('takes no image/photo argument at all — evidence, not input (CANON §9)', () => {
    // computeGrade's parameter type is AssayReq, which has no photo field.
    // This is a type-level guarantee as much as a runtime one; the test
    // exists so the invariant is checked by something that runs, not only
    // by the type signature.
    const input: AssayReq = allAt(2, 15);
    expect('photo_path' in input).toBe(false);
    expect('photo' in input).toBe(false);
  });
});
