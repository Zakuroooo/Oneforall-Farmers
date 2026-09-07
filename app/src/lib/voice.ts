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
 * it finishes, errors, or is cancelled — never rejects.
 *
 * ★ THE BUG THIS FIXES, because it is subtle and it wedged the UI on every
 *   screen. The previous version did:
 *
 *       let utteranceId: string | number;
 *       const done = e => { if (e.utteranceId !== utteranceId) return; ... }
 *       utteranceId = Tts.speak(text);
 *
 *   `react-native-tts`'s TypeScript declaration says `speak()` returns
 *   `string | number`. It does not. The Android native method is
 *   `speak(String utterance, ReadableMap params, Promise promise)` — a
 *   `Promise` parameter — so the bridge hands JavaScript back a **Promise**,
 *   and `utteranceId` was a Promise object. `e.utteranceId !== utteranceId`
 *   was therefore true for every event ever fired, `done` never resolved,
 *   and this function returned a promise that never settled.
 *
 *   Every caller `await`s it inside a `try/finally` that flips a `speaking`
 *   flag back off. The `finally` never ran. So the listen button changed to
 *   the muted-speaker icon when tapped and stayed that way for the life of
 *   the screen, on every screen, and the narration could not be replayed
 *   because the button was already showing its "stop" state. The
 *   `.d.ts` being wrong is why this compiled and why it survived review.
 *
 * ★ The id is now awaited before it is compared, completions that arrive
 *   before the id is known are honoured rather than dropped, and a guard
 *   timer settles the promise if the engine never reports at all. The UI
 *   flag can no longer be left stuck on by anything the engine does.
 */
const TTS_GUARD_MS = 60_000;

function speakViaTts(text: string): Promise<void> {
  return new Promise(resolve => {
    let settled = false;
    /** Known only once `Tts.speak()`'s promise resolves. */
    let utteranceId: string | number | null = null;
    /** A completion that arrived while the id was still unknown. */
    let finishedEarly = false;

    /**
     * ★ Unsubscribed through the returned subscriptions, not through
     *   `Tts.removeEventListener`. That method calls `this.removeListener()`
     *   on its `NativeEventEmitter` base — a method React Native deleted —
     *   so it threw `this.removeListener is not a function` the moment any
     *   utterance finished, and the red box took over the screen. It fired
     *   from `finish()`, meaning it hit on *every* successful narration.
     *   `addEventListener` already hands back an `EmitterSubscription`; that
     *   is what we keep and call `.remove()` on.
     */
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(guard);
      for (const sub of subscriptions) {
        try {
          sub.remove();
        } catch {
          // Already gone.
        }
      }
      resolve();
    };

    const onDone = (event?: { utteranceId?: string | number }) => {
      if (utteranceId === null) {
        // The engine beat us to it. Remember, and settle once we know the id
        // — or, if we never learn it, the guard below still ends this.
        finishedEarly = true;
        return;
      }
      const id = event?.utteranceId;
      if (id !== undefined && id !== utteranceId) return;
      finish();
    };

    const guard = setTimeout(finish, TTS_GUARD_MS);

    /* ★ The library's `.d.ts` types this as returning `void`; the JavaScript
       returns `this.addListener(...)`, an `EmitterSubscription`. Same lying
       declaration as `speak()` a few lines up, and the cast is here so the
       real return value can be used to unsubscribe. */
    const subscribe = (event: 'tts-finish' | 'tts-error' | 'tts-cancel') =>
      Tts.addEventListener(event, onDone) as unknown as { remove: () => void } | undefined;

    const subscriptions = [
      subscribe('tts-finish'),
      subscribe('tts-error'),
      subscribe('tts-cancel'),
    ].filter((sub): sub is { remove: () => void } => typeof sub?.remove === 'function');

    // Typed as `string | number` by the library and actually a Promise on
    // Android. `Promise.resolve` accepts either, so this handles both without
    // depending on which one the platform gives us.
    try {
      Promise.resolve(Tts.speak(text) as unknown as string | number).then(
        id => {
          utteranceId = id ?? '';
          if (finishedEarly) finish();
        },
        () => finish(),
      );
    } catch {
      finish();
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
  const generation = speechGeneration;
  await ensureTtsLanguage(locale);
  if (generation !== speechGeneration) return;
  await speakViaTts(text);
}

/**
 * What every Listen button on every screen now calls.
 *
 * ★ Prefers Sarvam's human-grade voice over the device's own TTS, and falls
 *   back the moment the server is unreachable. The two are not close: stock
 *   Android Marathi TTS is barely intelligible on a cheap handset, and the
 *   whole premise of this product is a farmer who does not read fluently.
 *   The verdict screen has preferred Sarvam since the backend team wired
 *   `/voice/narrate`; there was no reason the other twenty screens should
 *   not, and the fallback means a network problem downgrades the voice
 *   rather than silencing it.
 *
 * ★ I7 is not broken by this. The demo's guarantee is that it survives with
 *   *no* network, and it does — the fallback is on-device and offline. This
 *   only spends a round trip when there is one to spend.
 */
export async function speakSmart(text: string, locale: Locale = 'mr'): Promise<void> {
  await stopSpeaking();
  const generation = speechGeneration;
  try {
    await speakViaSarvam(text, locale, generation);
  } catch {
    // The farmer pressed stop while the clip was still coming down; do not
    // start the fallback on top of a deliberate silence.
    if (generation !== speechGeneration) return;
    await ensureTtsLanguage(locale);
    if (generation !== speechGeneration) return;
    await speakViaTts(text);
  }
}

/**
 * The Sarvam player currently holding audio, if any.
 *
 * ★ Why this is module state rather than a local: there are two ways this
 *   app makes sound — the on-device TTS engine and an `AudioRecorderPlayer`
 *   playing a Sarvam clip — and `stopSpeaking()` has to silence both. Before
 *   this, stopping only reached the TTS engine, so a farmer who tapped a
 *   Listen button that had chosen the Sarvam path had no way to stop it. He
 *   could leave the screen and the voice would keep talking.
 */
let activePlayer: { stopPlayer: () => Promise<unknown>; removePlayBackListener: () => void } | null =
  null;

/**
 * Bumped on every stop. Anything mid-flight compares the generation it
 * started under against this and gives up if it has moved — otherwise a
 * Sarvam clip that was still downloading when the farmer pressed stop would
 * begin playing a second later, with nothing left to stop it.
 */
let speechGeneration = 0;

/** Cancels anything in flight — TTS or Sarvam. Safe to call when silent. */
export async function stopSpeaking(): Promise<void> {
  speechGeneration += 1;
  try {
    await Tts.stop();
  } catch {
    // Nothing was speaking.
  }
  const player = activePlayer;
  activePlayer = null;
  if (player) {
    try {
      player.removePlayBackListener();
      await player.stopPlayer();
    } catch {
      // Already stopped, or never started.
    }
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
    await speakViaSarvam(narration, locale);
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
async function speakViaSarvam(
  narration: string,
  locale: Locale = 'mr',
  generation?: number,
): Promise<void> {
  const { audio_base64 } = await narrate(narration, locale);

  // The farmer pressed stop while this was still coming down the wire.
  if (generation !== undefined && generation !== speechGeneration) return;

  // Decode the base64 WAV to bytes and park it in a temp cache file the
  // native player can read. CachesDirectory is sandboxed, app-owned, and
  // survives long enough for one playback.
  const RNFS = require('react-native-fs');
  const cacheDir: string = RNFS.CachesDirectoryPath;
  // ★ One file per utterance, not a single `sarvam_verdict.wav`. Two screens
  //   speaking in quick succession were writing over each other's audio
  //   mid-playback, which on Android is a truncated clip rather than an
  //   error — the voice simply stopped mid-sentence.
  let filePath = `${cacheDir}/sarvam_${Date.now()}.wav`;
  // iOS's AVPlayer wants an explicit file:// scheme; Android's MediaPlayer
  // does not. Prepend only when it is missing so neither platform chokes.
  if (!filePath.startsWith('file://')) {
    filePath = `file://${filePath}`;
  }
  await RNFS.writeFile(filePath, audio_base64, 'base64');
  if (generation !== undefined && generation !== speechGeneration) return;

  const AudioRecorderPlayer = require('react-native-audio-recorder-player').default;
  const player = new AudioRecorderPlayer();
  // ★ Registered before playback starts, so `stopSpeaking()` can reach it.
  //   Without this the Sarvam path was unstoppable: the Listen button's stop
  //   only spoke to the TTS engine, and a farmer who tapped it heard the
  //   voice carry on.
  activePlayer = player;
  try {
    await player.startPlayer(filePath);
    // Wait for the native finish event before resolving — otherwise we'd
    // tear the file down while it is still playing. Bound it so a hung
    // player (no event ever fires) cannot hang the farmer's session: fall
    // through to stop after a generous ceiling.
    await Promise.race([
      new Promise<void>(resolve => {
        const onStatus = (e: { isFinished?: boolean }) => {
          if (e.isFinished) {
            player.removePlayBackListener();
            resolve();
          }
        };
        player.addPlayBackListener(onStatus);
      }),
      new Promise<void>(resolve => setTimeout(resolve, 60_000)),
    ]);
  } finally {
    if (activePlayer === player) activePlayer = null;
    try {
      await player.stopPlayer();
    } catch {
      // already stopped
    }
    player.removePlayBackListener();
    // Best effort — a stale cache file is harmless, a crash on cleanup is not.
    RNFS.unlink(filePath).catch(() => {});
  }
}

export async function speakVerdict(v: WindowRes, _t?: TFn): Promise<void> {
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

