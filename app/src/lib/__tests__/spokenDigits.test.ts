/**
 * The bug these lock down: `transcript.replace(/\D/g,'')` kept only ASCII, so
 * a farmer who spoke his number in Marathi had the field left blank.
 */

import { digitsFromSpeech } from '../spokenDigits';

describe('digitsFromSpeech', () => {
  it('reads spoken Marathi digits', () => {
    expect(digitsFromSpeech('नऊ आठ सात सहा पाच चार तीन दोन एक शून्य')).toBe('9876543210');
  });

  it('reads spoken Hindi digits, including pronunciation variants', () => {
    expect(digitsFromSpeech('नौ आठ सात छह पाँच')).toBe('98765');
    expect(digitsFromSpeech('दो पांच छे')).toBe('256');
  });

  it('reads spoken English digits', () => {
    expect(digitsFromSpeech('nine eight seven six five')).toBe('98765');
  });

  it('reads Devanagari numerals', () => {
    expect(digitsFromSpeech('९८७६५४३२१०')).toBe('9876543210');
  });

  it('still reads plain ASCII digits', () => {
    expect(digitsFromSpeech('9876543210')).toBe('9876543210');
    expect(digitsFromSpeech('+91 98765 43210')).toBe('919876543210');
  });

  /** The ordering trap: matching each word globally would sort them wrong. */
  it('keeps the order they were spoken in', () => {
    expect(digitsFromSpeech('दोन सात दोन')).toBe('272');
    expect(digitsFromSpeech('one two one two')).toBe('1212');
  });

  it('stops at maxLength so a hallucinated trailing word cannot overflow', () => {
    expect(digitsFromSpeech('नऊ आठ सात सहा पाच चार तीन दोन एक शून्य नऊ नऊ', 10)).toBe('9876543210');
    expect(digitsFromSpeech('एक दोन तीन चार पाच सहा सात', 6)).toBe('123456');
  });

  it('ignores surrounding words rather than choking on them', () => {
    expect(digitsFromSpeech('माझा नंबर नऊ आठ सात आहे')).toBe('987');
  });

  it('returns empty when nothing was heard', () => {
    expect(digitsFromSpeech('')).toBe('');
    expect(digitsFromSpeech('काहीच नाही')).toBe('');
  });
});
