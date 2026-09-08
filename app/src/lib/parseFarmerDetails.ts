/**
 * Turns one spoken sentence into the three fields the details screen asks
 * for: name, district and village.
 *
 * ★ Why this exists separately from `RegistrationAgent`: the agent runs a
 *   slot-by-slot conversation — it asks for the name, waits, asks for the
 *   district, waits. The new details screen asks for all three in a single
 *   breath ("Rambhau Patil, Nashik district, Niphad village") and fills the
 *   form from it, which is a parsing problem rather than a dialogue one.
 *   Keeping it pure and separate is also what makes it testable without a
 *   microphone.
 *
 * ★ It never invents. Anything it cannot identify comes back `null`, and the
 *   screen leaves that field for the farmer to type. A parser that guesses a
 *   district would put a farmer's lot in the wrong mandi.
 */

import type { District } from '../types/api';

export interface ParsedFarmerDetails {
  name: string | null;
  districtId: string | null;
  village: string | null;
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[.,!?।]/g, '');
}

/**
 * Words that mark the token before them as a district or village rather than
 * part of the name — in all three languages, plus the bare English forms.
 * "Niphad village" and "निफाड गाव" both have to work.
 */
const VILLAGE_MARKERS = ['village', 'gaon', 'gav', 'गाव', 'गाव्', 'गांव', 'ता', 'taluka'];
const DISTRICT_MARKERS = ['district', 'jila', 'zilla', 'जिल्हा', 'जिला', 'ज़िला'];

/**
 * Strips a trailing marker word: "Niphad village" -> "Niphad", "निफाड गाव" ->
 * "निफाड".
 *
 * ★ `\b` is deliberately not used for the Devanagari markers. JavaScript's
 *   word boundary is defined against `\w`, which is ASCII-only, so `\bगाव\b`
 *   never matches and "निफाड गाव" came through with the marker still attached.
 *   Latin markers keep the boundary (so "gaon" does not fire inside a name
 *   like "Gaonkar"); non-Latin ones anchor on whitespace instead.
 */
function stripMarkers(phrase: string, markers: string[]): string {
  let out = phrase.trim();
  for (const m of markers) {
    const isLatin = /^[a-z]+$/i.test(m);
    const re = isLatin
      ? new RegExp(`\\s*\\b${m}\\b\\s*$`, 'i')
      : new RegExp(`\\s*${m}\\s*$`, 'i');
    out = out.replace(re, '').trim();
  }
  return out;
}

/**
 * One marker occurrence found in the utterance: which field it introduces,
 * and where its own word starts and ends.
 */
interface MarkerHit {
  field: 'district' | 'village';
  start: number;
  end: number;
  /**
   * Devanagari markers are **postfix**: Marathi and Hindi say "नाशिक जिल्हा",
   * value first. Latin markers go either way — English speakers say both
   * "Nashik district" and "district Pune" — so those try after, then before.
   */
  postfix: boolean;
}

/**
 * Every marker word in the utterance, in the order spoken.
 *
 * ★ Markers are matched case-insensitively and, for Latin words, on word
 *   boundaries — so "gaon" does not fire inside the surname "Gaonkar", which
 *   would silently truncate a farmer's name.
 */
function findMarkers(lower: string): MarkerHit[] {
  const hits: MarkerHit[] = [];

  const scan = (markers: string[], field: 'district' | 'village') => {
    for (const m of markers) {
      const isLatin = /^[a-z]+$/i.test(m);
      // `\b` is ASCII-only in JavaScript, so it never matches a Devanagari
      // boundary — those anchor on whitespace, punctuation or a string edge.
      //
      // ★ The punctuation half matters: "नाशिक जिल्हा, निफाड गाव" puts a comma
      //   straight after the marker, and a `(?=\s|$)` lookahead misses it
      //   entirely — the marker goes undetected and the district ends up glued
      //   to the farmer's name.
      const re = isLatin
        ? new RegExp(`\\b${m}\\b`, 'gi')
        : new RegExp(`(?:^|[\\s,،।])${m}(?=[\\s,،।.]|$)`, 'g');
      for (const match of lower.matchAll(re)) {
        const idx = match.index ?? 0;
        // The whitespace-anchored form captures a leading space; the marker
        // itself starts after it.
        const lead = match[0].length - match[0].trimStart().length;
        hits.push({ field, start: idx + lead, end: idx + match[0].length, postfix: !isLatin });
      }
    }
  };

  scan(DISTRICT_MARKERS, 'district');
  scan(VILLAGE_MARKERS, 'village');

  return hits.sort((a, b) => a.start - b.start);
}

/**
 * Turns one spoken sentence into name, district and village.
 *
 * ★ This used to split on **commas** — `raw.split(/[,،]|\sand\s/)` — which is
 *   how a person writes the sentence but not how a transcriber returns it.
 *   Sarvam hands back "Pranay Sarkar district Pune village Kokamthan" with no
 *   punctuation at all, so the whole utterance arrived as a single segment and
 *   fell through into one field. The farmer had said all three correctly and
 *   the app put them in the same box.
 *
 * ★ So we split on the **marker words themselves** instead. They are what
 *   actually delimits the fields in speech: everything before the first
 *   marker is the name, and each marker claims the words that follow it until
 *   the next marker. Commas are still tolerated — they are just stripped as
 *   punctuation rather than relied upon.
 *
 * ★ It still never invents. A district we do not carry leaves `districtId`
 *   null rather than snapping to a neighbour, because a wrong district puts a
 *   farmer's lot in the wrong mandi.
 */
export function parseFarmerDetails(
  transcript: string,
  districts: District[],
): ParsedFarmerDetails {
  const raw = transcript.trim();
  if (!raw) return { name: null, districtId: null, village: null };

  const lower = raw.toLowerCase();
  const markers = findMarkers(lower);

  /** Trims filler punctuation and the joining words a person says naturally. */
  const clean = (s: string): string | null => {
    const out = s
      .replace(/[.,،!?।]/g, ' ')
      .replace(/^\s*(?:आणि|और|and|is|मी|माझं|माझे|my name is|name is)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();
    return out.length > 0 ? out : null;
  };

  // Comma-ish punctuation, which is where a segment ends when the transcriber
  // did give us some. Used only as a boundary — never required.
  const breaks: number[] = [];
  for (let i = 0; i < raw.length; i += 1) {
    if (',،।'.includes(raw[i]!)) breaks.push(i);
  }
  const nextBreak = (from: number) => breaks.find(b => b >= from) ?? raw.length;
  const prevBreak = (before: number) => {
    const b = [...breaks].reverse().find(x => x < before);
    return b === undefined ? 0 : b + 1;
  };

  let districtId: string | null = null;
  let village: string | null = null;
  // Where the field values begin. The name is whatever sits before all of it.
  let earliestValue = raw.length;
  // How far the previous marker's value reached, so two markers cannot claim
  // the same words.
  let consumedUpTo = 0;

  for (let i = 0; i < markers.length; i += 1) {
    const hit = markers[i]!;
    const next = markers[i + 1];

    /**
     * The words immediately **before** the marker, which is where a postfix
     * marker's value lives.
     *
     * ★ Only the last token, not everything back to the previous boundary.
     *   Without commas, "प्रणय सरकार नाशिक जिल्हा" has the farmer's name and
     *   his district in one unbroken run; taking the whole run would swallow
     *   the name into the district. A district or village is one word here.
     */
    const takeBefore = (): { value: string | null; start: number } => {
      const floor = Math.max(prevBreak(hit.start), consumedUpTo);
      const chunk = raw.slice(floor, hit.start);
      const trimmed = chunk.replace(/[\s,،।]+$/, '');
      const lastGap = Math.max(
        trimmed.lastIndexOf(' '),
        trimmed.lastIndexOf(','),
        trimmed.lastIndexOf('।'),
      );
      const start = floor + lastGap + 1;
      return { value: clean(raw.slice(start, hit.start)), start };
    };

    // ★ A marker takes the words **after** it in English word order ("district
    //   Pune") and the words **before** it in Marathi and Hindi ("नाशिक
    //   जिल्हा"). Devanagari is unambiguous, so it goes straight to before;
    //   Latin tries after first and falls back, because English speakers say
    //   it both ways.
    let value: string | null;
    let valueStart: number;

    if (hit.postfix) {
      const b = takeBefore();
      value = b.value;
      valueStart = b.start;
    } else {
      const afterEnd = Math.min(next ? next.start : raw.length, nextBreak(hit.end));
      const after = clean(raw.slice(hit.end, afterEnd));
      if (after !== null) {
        value = after;
        valueStart = hit.start;
      } else {
        const b = takeBefore();
        value = b.value;
        valueStart = b.start;
      }
    }

    consumedUpTo = Math.max(consumedUpTo, hit.end);
    if (value === null) continue;
    earliestValue = Math.min(earliestValue, valueStart);

    if (hit.field === 'district' && districtId === null) {
      const n = normalize(value);
      const matched = districts.find(
        d => n.includes(normalize(d.name_mr)) || n.includes(normalize(d.name)),
      );
      // Unrecognised district stays null — see the header.
      if (matched) districtId = matched.id;
    } else if (hit.field === 'village' && village === null) {
      village = stripMarkers(value, [...VILLAGE_MARKERS, ...DISTRICT_MARKERS]);
    }
  }

  // Everything before the first claimed word is the name. With no markers at
  // all, the whole utterance is the name — someone answering "what is your
  // name?" says only their name.
  const name = clean(raw.slice(0, earliestValue));

  // ★ A district can also be named without any marker word — "Pranay Sarkar,
  //   Nashik" — but only trust that when the farmer said nothing that looked
  //   like a district at all. Otherwise a village that happens to share a name
  //   with a district would overwrite the district he actually said.
  if (districtId === null && markers.every(m => m.field !== 'district') && name !== null) {
    const n = normalize(name);
    const matched = districts.find(
      d => n.includes(normalize(d.name_mr)) || n.includes(normalize(d.name)),
    );
    if (matched) {
      districtId = matched.id;
      // Strip the district out of the name so it does not appear in both.
      const stripped = clean(
        name.replace(new RegExp(matched.name_mr, 'i'), '').replace(new RegExp(matched.name, 'i'), ''),
      );
      return { name: stripped, districtId, village };
    }
  }

  return { name, districtId, village: village?.trim() || null };
}
