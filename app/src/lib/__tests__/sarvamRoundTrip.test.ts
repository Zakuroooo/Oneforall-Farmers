/**
 * The exact string Sarvam STT returned for spoken Marathi digits, captured
 * from a live round trip through the running backend on 2026-09-07:
 *
 *   narrate("नऊ आठ सात सहा पाच चार तीन दोन एक शून्य") -> WAV
 *   transcribe(WAV) -> { transcript: "नऊ आठ सात सहा पाच चार तीन दोन एक शून्य" }
 *
 * This is the real shape of the data the phone screen receives, and it is
 * exactly what the old `transcript.replace(/\D/g, '')` turned into "".
 */

import { digitsFromSpeech } from '../spokenDigits';

const SARVAM_MARATHI_DIGITS = 'नऊ आठ सात सहा पाच चार तीन दोन एक शून्य';

describe('a real Sarvam transcript', () => {
  it('is thrown away entirely by the regex this replaced', () => {
    expect(SARVAM_MARATHI_DIGITS.replace(/\D/g, '')).toBe('');
  });

  it('is read correctly by the parser that replaced it', () => {
    expect(digitsFromSpeech(SARVAM_MARATHI_DIGITS, 10)).toBe('9876543210');
  });

  it('fills a six-digit OTP from the same transcript', () => {
    expect(digitsFromSpeech(SARVAM_MARATHI_DIGITS, 6)).toBe('987654');
  });
});
