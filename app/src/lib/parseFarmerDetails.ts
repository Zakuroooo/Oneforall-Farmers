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
 * Splits on commas first, because that is how people actually say it when
 * reading a form aloud. Falls back to the whole utterance as the name when
 * there is only one segment.
 */
export function parseFarmerDetails(
  transcript: string,
  districts: District[],
): ParsedFarmerDetails {
  const raw = transcript.trim();
  if (!raw) return { name: null, districtId: null, village: null };

  const segments = raw
    .split(/[,،]|\sआणि\s|\sand\s/)
    .map(s => s.trim())
    .filter(Boolean);

  let name: string | null = null;
  let districtId: string | null = null;
  let village: string | null = null;

  for (const seg of segments) {
    const n = normalize(seg);

    // A segment that names a district we actually have wins as the district,
    // whether or not it carries a marker word.
    const matched = districts.find(d => {
      const mr = normalize(d.name_mr);
      const en = normalize(d.name);
      return n.includes(mr) || n.includes(en);
    });

    const looksVillage = VILLAGE_MARKERS.some(m => n.includes(m));
    const looksDistrict = DISTRICT_MARKERS.some(m => n.includes(m));

    if (matched && !looksVillage && districtId === null) {
      districtId = matched.id;
      continue;
    }
    if (looksVillage && village === null) {
      village = stripMarkers(seg, [...VILLAGE_MARKERS]);
      continue;
    }
    if (looksDistrict && districtId === null) {
      // Named a district we do not carry — leave it unset rather than
      // guessing a neighbour.
      continue;
    }
    if (name === null) {
      name = seg;
    } else if (village === null && !matched) {
      village = seg;
    }
  }

  // One-segment utterances are a name, not a village.
  if (name === null && segments.length === 1) name = segments[0] ?? null;

  return {
    name: name?.trim() || null,
    districtId,
    village: village?.trim() || null,
  };
}
