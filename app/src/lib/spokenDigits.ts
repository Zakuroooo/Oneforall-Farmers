/**
 * Pulls a digit string out of something a farmer said.
 *
 * ★ Why this exists: the phone screen was doing
 *
 *       transcript.replace(/\D/g, '')
 *
 *   which keeps ASCII `0-9` and throws away everything else. Sarvam
 *   transcribing Marathi returns neither: a spoken number comes back as
 *   words — "नऊ आठ सात सहा" — or as Devanagari numerals, "९८७६". Both are
 *   `\D` to that regex, so the result was the empty string and the field
 *   silently stayed blank. The farmer had spoken his number correctly and
 *   the app had simply not listened.
 *
 * ★ Word forms are recognised in all three languages, because the transcript
 *   comes back in whichever one he chose, and the digits are the same number
 *   either way.
 *
 * ★ Order is preserved by scanning the string once rather than matching each
 *   digit word globally — "दोन सात दोन" has to come out `272`, not `227`.
 */

/** Devanagari zero through nine, in order, so the index is the value. */
const DEVANAGARI_DIGITS = '०१२३४५६७८९';

/**
 * Spoken forms per digit, across mr / hi / en, including the common
 * pronunciation variants a transcriber actually returns ("पाँच" and "पांच",
 * "छह" and "छे").
 */
const DIGIT_WORDS: Record<string, string[]> = {
  '0': ['शून्य', 'सुन्ना', 'zero', 'oh'],
  '1': ['एक', 'one'],
  '2': ['दोन', 'दो', 'two'],
  '3': ['तीन', 'three'],
  '4': ['चार', 'four'],
  '5': ['पाच', 'पाँच', 'पांच', 'five'],
  '6': ['सहा', 'छह', 'छे', 'six'],
  '7': ['सात', 'seven'],
  '8': ['आठ', 'eight'],
  '9': ['नऊ', 'नौ', 'nine'],
};

/** Longest first, so "सात" is never matched inside a longer word. */
const WORD_ENTRIES: Array<[string, string]> = Object.entries(DIGIT_WORDS)
  .flatMap(([digit, words]) => words.map(w => [w, digit] as [string, string]))
  .sort((a, b) => b[0].length - a[0].length);

/**
 * Every digit in `transcript`, in the order it was said.
 *
 * @param maxLength stop after this many digits — a phone number is 10, an
 *   OTP is 6, and a transcriber that hallucinates a trailing word should not
 *   be able to overflow the field.
 */
export function digitsFromSpeech(transcript: string, maxLength?: number): string {
  const out: string[] = [];
  const text = transcript.toLowerCase();
  let i = 0;

  while (i < text.length) {
    if (maxLength !== undefined && out.length >= maxLength) break;

    const ch = text[i]!;

    // ASCII digit.
    if (ch >= '0' && ch <= '9') {
      out.push(ch);
      i += 1;
      continue;
    }

    // Devanagari numeral.
    const dev = DEVANAGARI_DIGITS.indexOf(ch);
    if (dev !== -1) {
      out.push(String(dev));
      i += 1;
      continue;
    }

    // A spoken word, matched at this position so ordering is preserved.
    const hit = WORD_ENTRIES.find(([word]) => text.startsWith(word, i));
    if (hit) {
      out.push(hit[1]);
      i += hit[0].length;
      continue;
    }

    i += 1;
  }

  return out.join('');
}
