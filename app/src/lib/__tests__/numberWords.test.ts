/**
 * The bug the faculty found, pinned down.
 *
 * With the app set to Marathi, a farmer spoke his phone number and his OTP in
 * Marathi and the field stayed empty. Two causes, and this file covers the one
 * that lives in the app:
 *
 *   1. Sarvam was being asked to transcribe against the wrong `language_code`
 *      (server side — see `api/v1/voice/transcribe.ts` in the web repo and
 *      `voice_engine.py` in the API repo).
 *   2. **Here:** even a perfect Marathi transcript was only understood when
 *      the farmer read the number one digit at a time. Said the way numbers
 *      are actually said — "अठ्ठ्याण्णव सात सहा पाच" — every two-digit word
 *      was invisible, the run broke, and what landed in the field was a
 *      fragment or nothing at all.
 *
 * A wrong mapping here is worse than a missing one: it fills a plausible but
 * incorrect phone number. So these tests check the values, not just that
 * something came back.
 */

import { numberWordToDigits, repeatCount } from '../numberWords';
import { digitsFromSpeech } from '../spokenDigits';

describe('numberWordToDigits', () => {
  it('reads Marathi two-digit numbers as two digits', () => {
    expect(numberWordToDigits('अठ्ठ्याण्णव')).toBe('98');
    expect(numberWordToDigits('त्र्याण्णव')).toBe('93');
    expect(numberWordToDigits('पंचावन्न')).toBe('55');
    expect(numberWordToDigits('बारा')).toBe('12');
  });

  it('reads Hindi two-digit numbers', () => {
    expect(numberWordToDigits('अट्ठानवे')).toBe('98');
    expect(numberWordToDigits('निन्यानवे')).toBe('99');
    expect(numberWordToDigits('पचपन')).toBe('55');
  });

  it('still reads the single digits both scripts share', () => {
    expect(numberWordToDigits('नऊ')).toBe('9');
    expect(numberWordToDigits('नौ')).toBe('9');
    expect(numberWordToDigits('सात')).toBe('7');
    expect(numberWordToDigits('nine')).toBe('9');
  });

  it('returns null for words that are not numbers', () => {
    expect(numberWordToDigits('नंबर')).toBeNull();
    expect(numberWordToDigits('phone')).toBeNull();
    expect(numberWordToDigits('')).toBeNull();
  });

  it('knows the repeaters, and only those', () => {
    expect(repeatCount('डबल')).toBe(2);
    expect(repeatCount('double')).toBe(2);
    expect(repeatCount('ट्रिपल')).toBe(3);
    expect(repeatCount('सात')).toBeNull();
  });
});

describe('digitsFromSpeech — spoken as whole numbers', () => {
  it('reads a phone number said in pairs, which is how people say it', () => {
    expect(digitsFromSpeech('अठ्ठ्याण्णव सात सहा पाच चार तीन दोन एक शून्य', 10)).toBe('9876543210');
  });

  it('reads a Marathi OTP said in pairs', () => {
    expect(digitsFromSpeech('बारा चौतीस छप्पन्न', 6)).toBe('123456');
  });

  it('reads a Hindi OTP said in pairs', () => {
    expect(digitsFromSpeech('बारह चौंतीस छप्पन', 6)).toBe('123456');
  });

  it('handles "double" before a digit', () => {
    // नऊ=9, आठ=8, डबल सात=77, सहा=6, पाच=5 — six digits, so the
    // expected-length run is matched exactly rather than joined.
    expect(digitsFromSpeech('नऊ आठ डबल सात सहा पाच', 6)).toBe('987765');
    expect(digitsFromSpeech('double seven one', 3)).toBe('771');
  });

  it('does not let a repeater break the run when nothing follows it', () => {
    expect(digitsFromSpeech('नऊ आठ सात डबल')).toBe('987');
  });

  it('still reads the digit-by-digit case the old tests covered', () => {
    expect(digitsFromSpeech('नऊ आठ सात सहा पाच चार तीन दोन एक शून्य')).toBe('9876543210');
    expect(digitsFromSpeech('९८७६५४३२१०')).toBe('9876543210');
  });

  it('finds the number inside a whole Marathi sentence', () => {
    expect(digitsFromSpeech('माझा नंबर अठ्ठ्याण्णव सात सहा पाच चार तीन दोन एक शून्य आहे', 10)).toBe(
      '9876543210',
    );
  });

  /**
   * "एक" means one, and also starts "एक मिनिट". A stray filler must not
   * outrank the ten digits actually spoken — this is the same trap the
   * English word "phone" (containing "one") set before.
   */
  it('prefers the run of the expected length over a filler word', () => {
    expect(digitsFromSpeech('एक मिनिट अठ्ठ्याण्णव सात सहा पाच चार तीन दोन एक शून्य', 10)).toBe(
      '9876543210',
    );
  });
});
