/**
 * voice.ts — Marathi offline voice engine.
 * Decomposes rupees and days into sequenced audio clips, then plays them back
 * with `react-native-sound`. Works 100% offline (I7) — every clip is a local
 * file, never a network fetch, so airplane mode is the expected path, not an
 * edge case.
 *
 * ★ CANON/12_STACK.md §"Voice" names `react-native-sound` as the sanctioned
 *   library for exactly this (pre-generated clips, sequenced), with
 *   `react-native-tts` documented as the *fallback* — not `expo-av`, since
 *   this is React Native CLI with no Expo runtime at all.
 *
 * ★ THE PRE-GENERATED CLIP CONTENT IS NOT SHIPPED IN THIS COMMIT. Generating
 *   ~123 real Marathi speech mp3s (one per id, per `assets/audio/mr/README.md`)
 *   is a TTS content pass over real audio, which nothing in a coding session
 *   can produce — so `react-native-tts` is not the fallback-of-last-resort
 *   here, it is doing the actual work: `speak()` tries the pre-generated clip
 *   first (silent today, since none exist) and falls back to the device's
 *   on-device TTS engine speaking the same Marathi text live. This is what
 *   keeps beat 7 ("voice, then airplane mode") non-silent without the mp3s —
 *   `react-native-tts` needs no network either, it speaks through whatever
 *   TTS engine and voice data are already installed on the phone.
 */

import Sound from 'react-native-sound';
import Tts from 'react-native-tts';
import type { Locale, WindowRes } from '../types/api';
import type { TFn } from './i18n';
import { buildVerdictNarrationFor } from './verdictVoice';
// ★ Upstream wrote this as `from '../api'`, which resolves to `src/api` — a
//   file that does not exist, so the narration would have failed to bundle.
//   `voice.ts` and `api.ts` are siblings in `lib/`.
import { narrate } from './api';

/**
 * Every ASCII, Android-resource-safe (`[a-z0-9_]+`, no Devanagari) clip id
 * this engine ever asks `react-native-sound` to load, and the Marathi text
 * it corresponds to — this map is the spec for whoever records or generates
 * the clips, and `assets/audio/mr/README.md` is derived from it.
 */
const CLIP_TEXT_MR: Record<string, string> = {
  hold: 'थांबा',
  sell_now: 'आज विका',
  sell_elsewhere: 'दुसऱ्या बाजारात विका',
  split: 'अर्धा आज विका',
  no_advice: 'सल्ला नाही',
  days: 'दिवस',
  exp_gain: 'अपेक्षित फायदा',
  worst_case: 'सर्वात वाईट स्थिती',
  rupees: 'रुपये',
  rupees_loss: 'रुपये तोटा',
  quintal: 'क्विंटल',
  thousand: 'हजार',
  lakh: 'लाख',
  minus: 'उणे',
};

/** Marathi 0–99, keyed by the number — `numberClipId(n)` turns a value here
 * into the ASCII id (`n7`) this engine actually loads by filename. */
const MARATHI_NUMBER_NAMES: Record<number, string> = {
  0: 'शून्य', 1: 'एक', 2: 'दोन', 3: 'तीन', 4: 'चार', 5: 'पाच', 6: 'सहा', 7: 'सात', 8: 'आठ', 9: 'नऊ', 10: 'दहा',
  11: 'अकरा', 12: 'बारा', 13: 'तेरा', 14: 'चौदा', 15: 'पंधरा', 16: 'सोळा', 17: 'सतरा', 18: 'अठरा', 19: 'एकोणीस', 20: 'वीस',
  21: 'एकवीस', 22: 'बावीस', 23: 'तेवीस', 24: 'चोवीस', 25: 'पंचवीस', 26: 'सव्वीस', 27: 'सत्तावीस', 28: 'अठ्ठावीस', 29: 'एकोणतीस', 30: 'तीस',
  31: 'एकतीस', 32: 'बत्तीस', 33: 'तेत्तीस', 34: 'चौतीस', 35: 'पाचतीस', 36: 'छत्तीस', 37: 'सदतीस', 38: 'अडतीस', 39: 'एकोणचाळीस', 40: 'चाळीस',
  41: 'एकचाळीस', 42: 'बेचाळीस', 43: 'त्रेचाळीस', 44: 'चौचाळीस', 45: 'पंचाळीस', 46: 'सहाचाळीस', 47: 'सतचाळीस', 48: 'अडचाळीस', 49: 'एकोणपन्नास', 50: 'पन्नास',
  51: 'एकपन्नास', 52: 'बावन्न', 53: 'त्रेपन्न', 54: 'चौपन्न', 55: 'पंचपन्न', 56: 'छापन्न', 57: 'सत्तावन्न', 58: 'अठ्ठावन्न', 59: 'एकोणसाठ', 60: 'साठ',
  61: 'एकसाठ', 62: 'बासाठ', 63: 'त्रेसाठ', 64: 'चौसाठ', 65: 'पासष्ट', 66: 'सहासाठ', 67: 'सदसाठ', 68: 'अडसाठ', 69: 'एकोणसत्तर', 70: 'सत्तर',
  71: 'एकसत्तर', 72: 'बायत्तर', 73: 'त्र्याहत्तर', 74: 'चौहत्तर', 75: 'पंचहत्तर', 76: 'शहात्तर', 77: 'सतहत्तर', 78: 'अठ्ठ्याहत्तर', 79: 'एकोणऐंशी', 80: 'ऐंशी',
  81: 'एकऐंशी', 82: 'ब्याऐंशी', 83: 'त्र्याऐंशी', 84: 'चौऱ्याऐंशी', 85: 'पंचऐंशी', 86: 'शहाऐंशी', 87: 'सत्ताऐंशी', 88: 'अठ्ठाऐंशी', 89: 'एकोणनव्वद', 90: 'नव्वद',
  91: 'एकणव्वद', 92: 'ब्याणव्वद', 93: 'त्र्याणव्वद', 94: 'चौऱ्याणव्वद', 95: 'पंचणव्वद', 96: 'शहाणव्वद', 97: 'सत्ताणव्वद', 98: 'अठ्ठाणव्वद', 99: 'नऊणव्वद',
};

/** Marathi hundreds (100–900), keyed 1–9 — `hundredsClipId(n)` turns a value
 * here into the ASCII id (`h3`) this engine actually loads by filename. */
const MARATHI_HUNDREDS: Record<number, string> = {
  1: 'शंभर', 2: 'दोनशे', 3: 'तीनशे', 4: 'चारशे', 5: 'पाचशे', 6: 'सहाशे', 7: 'सातशे', 8: 'आठशे', 9: 'नऊशे',
};

/**
 * `n0`..`n99` — Android resource names cannot be Devanagari, so the clip id
 * that actually flows through `decomposeRupees`/`decomposeDays`/`speak` is
 * this ASCII form, never the Marathi word itself. Returns `null` outside
 * 0–99, same as the old "lookup came back undefined" guard this replaces —
 * a rupee amount in the crores still silently drops that one word rather
 * than crashing, which is a pre-existing gap in scope (lakhs was never
 * bounded past 99) and not something this change is trying to fix.
 */
function numberClipId(n: number): string | null {
  return n in MARATHI_NUMBER_NAMES ? `n${n}` : null;
}

/** `h1`..`h9` — see `numberClipId`. */
function hundredsClipId(n: number): string | null {
  return n in MARATHI_HUNDREDS ? `h${n}` : null;
}

/**
 * Decomposes rupee amount in paise to a sequence of clip ids.
 * Example: 629000 paise -> ₹6,290 -> ["n6", "thousand", "h2", "n90", "rupees"]
 */
export function decomposeRupees(paise: number): string[] {
  const isNegative = paise < 0;
  let rupees = Math.trunc(Math.abs(paise) / 100);
  const clips: string[] = [];

  if (isNegative) {
    clips.push('minus');
  }

  if (rupees === 0) {
    clips.push('n0', 'rupees');
    return clips;
  }

  // Lakhs (1,00,000+)
  if (rupees >= 100000) {
    const lakhs = Math.floor(rupees / 100000);
    rupees %= 100000;
    const lakhsId = numberClipId(lakhs);
    if (lakhsId) {
      clips.push(lakhsId);
    }
    clips.push('lakh');
  }

  // Thousands (1,000+)
  if (rupees >= 1000) {
    const thousands = Math.floor(rupees / 1000);
    rupees %= 1000;
    const thousandsId = numberClipId(thousands);
    if (thousandsId) {
      clips.push(thousandsId);
    }
    clips.push('thousand');
  }

  // Hundreds (100-900)
  if (rupees >= 100) {
    const hundreds = Math.floor(rupees / 100);
    rupees %= 100;
    const hundredsId = hundredsClipId(hundreds);
    if (hundredsId) {
      clips.push(hundredsId);
    }
  }

  // Remaining 1-99
  const remainderId = numberClipId(rupees);
  if (rupees > 0 && remainderId) {
    clips.push(remainderId);
  }

  clips.push(isNegative ? 'rupees_loss' : 'rupees');
  return clips;
}

export function decomposeDays(days: number): string[] {
  const clips: string[] = [];
  const daysId = numberClipId(days);
  if (daysId) {
    clips.push(daysId);
  } else {
    // Outside the 0-99 vocabulary this engine has words for at all — every
    // digit read out individually beats silence for a hold period that long.
    for (const digit of String(days)) {
      const digitId = numberClipId(Number(digit));
      if (digitId) clips.push(digitId);
    }
  }
  clips.push('days');
  return clips;
}

// ─────────────────────────────────────────────────────────────────────────────
// Playback
// ─────────────────────────────────────────────────────────────────────────────

/**
 * One player per clip id, loaded once and reused — a verdict spoken twice in
 * one session (the farmer taps 🔊 again) does not re-hit the filesystem for
 * every word a second time.
 */
const soundCache = new Map<string, Sound>();

/**
 * Loads (or returns the cached) `Sound` for a clip id. Resolves to `null`,
 * never rejects, when the file does not exist or fails to decode — a
 * missing clip is not this function's business to escalate; `speak` decides
 * what a gap in the sequence means (it skips it and keeps going).
 */
function loadClip(id: string): Promise<Sound | null> {
  const cached = soundCache.get(id);
  if (cached) return Promise.resolve(cached);

  return new Promise(resolve => {
    const sound = new Sound(`${id}.mp3`, Sound.MAIN_BUNDLE, error => {
      if (error) {
        resolve(null);
        return;
      }
      soundCache.set(id, sound);
      resolve(sound);
    });
  });
}

function playClip(sound: Sound): Promise<void> {
  return new Promise(resolve => {
    sound.play(() => resolve());
  });
}

/**
 * `Tts.setDefaultLanguage('mr-IN')` once, best-effort — plenty of Android
 * phones ship with no Marathi voice data installed at all, and this must
 * never block or throw on that. If it fails, `Tts.speak()` still falls back
 * to whatever the device's default TTS language is, which beats no sound.
 */
/**
 * BCP-47 tags for the three locales the app offers. The engine needs the
 * region: bare 'hi' picks whatever Hindi voice the device defaults to, and on
 * many Indian devices that is not an Indian one.
 */
const TTS_LANGUAGE: Record<Locale, string> = {
  mr: 'mr-IN',
  hi: 'hi-IN',
  en: 'en-IN',
};

/** The locale the engine is currently set to, so we only pay for a change. */
let ttsCurrentLocale: Locale | null = null;

/**
 * ★ This used to hardcode `'mr-IN'` and cache the promise forever, so the
 *   engine was set to Marathi once at first use and never changed again. Two
 *   reported bugs came out of that single line: the verdict spoke Marathi to
 *   a farmer who had chosen English, and Hindi text read aloud in a Marathi
 *   voice mispronounced even the product's own name. The engine is now set
 *   to whichever locale the caller is speaking in, and re-set when it
 *   changes.
 */
async function ensureTtsLanguage(locale: Locale = 'mr'): Promise<void> {
  if (ttsCurrentLocale === locale) return;
  try {
    await Tts.setDefaultLanguage(TTS_LANGUAGE[locale]);
    ttsCurrentLocale = locale;
  } catch {
    // An engine without the language installed keeps whatever it had. Better
    // a wrong accent than silence.
  }
}

/**
 * Speaks `text` through the device's on-device TTS engine and resolves when
 * it finishes, errors, or is cancelled — never rejects. `Tts.speak()` returns
 * an utterance id synchronously; completion only arrives as an event, so
 * this wraps that in a promise and always cleans its own listeners up
 * afterward, matched on that id (more than one clip can be in flight only if
 * something calls `speak()` concurrently with itself, which this module
 * never does, but matching by id costs nothing and rules it out anyway).
 */
function speakViaTts(text: string): Promise<void> {
  return new Promise(resolve => {
    let utteranceId: string | number;
    const done = (event: { utteranceId: string | number }) => {
      if (event.utteranceId !== utteranceId) return;
      Tts.removeEventListener('tts-finish', done);
      Tts.removeEventListener('tts-error', done);
      Tts.removeEventListener('tts-cancel', done);
      resolve();
    };
    Tts.addEventListener('tts-finish', done);
    Tts.addEventListener('tts-error', done);
    Tts.addEventListener('tts-cancel', done);

    try {
      utteranceId = Tts.speak(text);
    } catch {
      Tts.removeEventListener('tts-finish', done);
      Tts.removeEventListener('tts-error', done);
      Tts.removeEventListener('tts-cancel', done);
      resolve();
    }
  });
}

/** Every clip id's Marathi text, for the TTS fallback below — the same
 * lookup `allClipTexts()` exposes, kept as one map rather than rebuilding
 * it per call. */
const CLIP_TEXT_BY_ID: Record<string, string> = (() => {
  const all: Record<string, string> = { ...CLIP_TEXT_MR };
  for (const [n, text] of Object.entries(MARATHI_NUMBER_NAMES)) {
    all[`n${n}`] = text;
  }
  for (const [n, text] of Object.entries(MARATHI_HUNDREDS)) {
    all[`h${n}`] = text;
  }
  return all;
})();

/**
 * Plays a sequence of clip ids, one after another, waiting for each to
 * finish before starting the next — this is speech, and a farmer needs the
 * words in order, not overlapping.
 *
 * A clip id whose pre-generated file does not exist falls back to on-device
 * TTS speaking the same Marathi text live, rather than being silently
 * skipped — see this file's header. Only an id with no Marathi text at all
 * (a caller's typo — cannot happen from this module's own two decompose
 * functions) is actually skipped.
 */
export async function speak(clips: string[]): Promise<void> {
  await ensureTtsLanguage('mr');
  for (const id of clips) {
    const sound = await loadClip(id);
    if (sound) {
      await playClip(sound);
      continue;
    }
    const text = CLIP_TEXT_BY_ID[id];
    if (text) {
      await speakViaTts(text);
    }
  }
}

/**
 * Speaks arbitrary Marathi text live through the device's on-device TTS
 * engine — for text that cannot be a pre-generated clip sequence because it
 * is not known until runtime (a farmer's own name, a village they typed or
 * spoke). `speak()` above is for the fixed, decomposable vocabulary
 * (rupees, days); this is for everything else voice.ts is asked to say.
 */
export async function speakText(text: string, locale: Locale = 'mr'): Promise<void> {
  // ★ Stop whatever is in flight before starting. Without this a second tap
  //   either queued behind the first or was dropped by the engine, which is
  //   why the speaker "only played once" — tapping again did nothing audible
  //   and there was no way to replay a sentence a farmer missed.
  await stopSpeaking();
  await ensureTtsLanguage(locale);
  await speakViaTts(text);
}

/** Cancels any utterance in flight. Safe to call when nothing is speaking. */
export async function stopSpeaking(): Promise<void> {
  try {
    await Tts.stop();
  } catch {
    // Nothing was speaking.
  }
}

/**
 * The sale-window voice agent: composes the full spoken Marathi narration for
 * a `WindowRes` (action + worth + pledge) and speaks it.
 *
 * It prefers Sarvam's prosthetic, human-grade Marathi voice (the backend
 * `POST /voice/narrate` synthesizes the dynamic sentence on demand — a lot,
 * dates and amounts can't be pre-recorded clips). Sarvam needs a server round
 * trip and a writable cache file to play back, so on-device TTS
 * (`speakText`, offline, zero deps) is the guaranteed fallback: a network or
 * server problem never silences the verdict, it only downgrades the voice.
 * This is what S9 auto-plays on load and what the 🔊 button replays — richer
 * than the clip-sequence `speakVerdict` below, because a farmer deciding
 * whether to hold needs the whole trade in his ear, not isolated word-clips.
 */
export async function speakSaleWindow(v: WindowRes, locale: Locale = 'mr'): Promise<void> {
  // ★ Composed and spoken in the farmer's own language. This used to build
  //   Marathi unconditionally and call `narrate(..., 'mr')`, so choosing
  //   English on S1 still produced a Marathi verdict — the exact complaint
  //   from the device.
  const narration = buildVerdictNarrationFor(v, locale);
  await stopSpeaking();
  try {
    await speakSarvamVerdict(narration, locale);
  } catch {
    await speakText(narration, locale);
  }
}

/**
 * Fetch `narration` as Sarvam-synthesized audio and play it. Resolves on
 * success; rejects on any failure so the caller can fall back to on-device
 * TTS. The flow: narrate -> base64 WAV -> temp cache file -> recorder player.
 * Throws (does not swallow) on network/fs/playback errors by design — the
 * fallback lives in `speakSaleWindow`, not here.
 */
async function speakSarvamVerdict(narration: string, locale: Locale = 'mr'): Promise<void> {
  const { audio_base64 } = await narrate(narration, locale);

  // Decode the base64 WAV to bytes and park it in a temp cache file the
  // native player can read. CachesDirectory is sandboxed, app-owned, and
  // survives long enough for one playback.
  const RNFS = require('react-native-fs');
  const cacheDir: string = RNFS.CachesDirectoryPath;
  let filePath = `${cacheDir}/sarvam_verdict.wav`;
  // iOS's AVPlayer wants an explicit file:// scheme; Android's MediaPlayer
  // does not. Prepend only when it is missing so neither platform chokes.
  if (!filePath.startsWith('file://')) {
    filePath = `file://${filePath}`;
  }
  await RNFS.writeFile(filePath, audio_base64, 'base64');

  const AudioRecorderPlayer = require('react-native-audio-recorder-player').default;
  const player = new AudioRecorderPlayer();
  try {
    await player.startPlayer(filePath);
    // Wait for the native finish event before resolving — otherwise we'd
    // tear the file down while it is still playing. Bound it so a hung
    // player (no event ever fires) cannot hang the farmer's session: fall
    // through to stop after a generous ceiling.
    await Promise.race([
      new Promise<void>((resolve) => {
        const onStatus = (e: { isFinished?: boolean }) => {
          if (e.isFinished) {
            player.removePlayBackListener();
            resolve();
          }
        };
        player.addPlayBackListener(onStatus);
      }),
      new Promise<void>((resolve) => setTimeout(resolve, 60_000)),
    ]);
  } finally {
    try {
      await player.stopPlayer();
    } catch {
      // already stopped
    }
    player.removePlayBackListener();
  }
}

export async function speakVerdict(v: WindowRes, t?: TFn): Promise<void> {
  if (v.action === 'NO_ADVICE') {
    await speak(['no_advice']);
    return;
  }

  const clips: string[] = [];

  // Action
  if (v.action === 'HOLD' && v.hold_days) {
    clips.push('hold', ...decomposeDays(v.hold_days));
  } else if (v.action === 'SELL_NOW') {
    clips.push('sell_now');
  } else if (v.action === 'SELL_ELSEWHERE') {
    clips.push('sell_elsewhere');
  } else if (v.action === 'SPLIT') {
    clips.push('split');
  }

  // Expected Gain
  if (v.expected_gain_paise !== null && v.expected_gain_paise !== undefined) {
    clips.push('exp_gain', ...decomposeRupees(v.expected_gain_paise));
  }

  // Worst Case (Loss)
  if (v.worst_case_paise !== null && v.worst_case_paise !== undefined) {
    clips.push('worst_case', ...decomposeRupees(v.worst_case_paise));
  }

  await speak(clips);
}

/** Every clip id this engine can ever ask for, and its Marathi text — for
 * `assets/audio/mr/README.md` and for anyone generating the actual clips.
 * Not used by playback itself (`speak` only ever needs the id). */
export function allClipTexts(): Record<string, string> {
  return { ...CLIP_TEXT_BY_ID };
}

