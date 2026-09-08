/**
 * The farmer's voice preferences, persisted across launches.
 *
 * ★ Why this exists: `S36_LanguageSwitcher` rendered a "voice assistance"
 *   toggle and three speed tabs that were `useState` and nothing else. Tapping
 *   them changed a colour and no behaviour — and they sat on the screen a
 *   farmer opens *because* he wants the app to talk to him. A control that
 *   lies about what it does is worse on that screen than anywhere else.
 *
 * ★ I first removed the speed tabs, claiming neither path exposed a rate.
 *   **That was wrong.** `react-native-tts` has `setDefaultRate`, and Sarvam's
 *   synthesis takes a `pace`. The tabs were dead because nothing was wired to
 *   them, not because the capability was missing. They are back and real: the
 *   rate applies to the on-device voice immediately, and the pace is sent to
 *   the server for the Sarvam voice.
 *
 * ★ `autoNarrate` defaults to **off**, and that is a reversal.
 *
 *   I shipped it on, reasoning that a farmer who cannot read gains nothing
 *   from an app that stays silent until he finds the speaker icon. In use it
 *   was intrusive: the phone starts talking the moment Home appears, before
 *   you have looked at anything, and it talks again every time you come back
 *   to the screen. Nobody wants that, farmer or not — and a demo where the
 *   phone starts announcing itself unprompted is worse than one that waits.
 *
 *   The speaker button is the way in. This setting stays because it is a real
 *   preference, but it is opt-in now.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTO_NARRATE_KEY = 'app.autoNarrate';
const VOICE_KEY = 'app.voice';
const SPEED_KEY = 'app.voiceSpeed';

/**
 * Which Sarvam voice reads the app aloud.
 *
 * ★ Named by who is speaking, not by a Sarvam speaker id, because the id is
 *   the server's business and it changes when the model version does. The
 *   mapping to a real speaker lives in one place (`SARVAM_SPEAKER` below) so
 *   a model bump is one edit rather than a search across screens.
 */
export type VoiceChoice = 'female' | 'male';

/**
 * Sarvam `bulbul:v3` speaker ids for each choice.
 *
 * ★ These must come from v3's own roster, which is not the v2 one. I first
 *   guessed `anushka` / `abhilash` from the older model and Sarvam rejected
 *   both outright:
 *
 *       "Speaker 'anushka' is not compatible with model bulbul:v3"
 *
 *   The v3 list is: aditya, ritu, ashutosh, priya, neha, rahul, pooja, rohan,
 *   simran, kavya, amit, dev, ishita, shreya, ratan, varun, manan, sumit,
 *   roopa, kabir, aayan, shubh, advait, anand, tanya, tarun. If the model is
 *   ever bumped again, this constant is the single place to re-map.
 */
export const SARVAM_SPEAKER: Record<VoiceChoice, string> = {
  female: 'priya',
  male: 'aditya',
};

/**
 * How fast the app talks.
 *
 * ★ I removed the original speed tabs claiming neither TTS path exposed a
 *   rate. That was wrong: `react-native-tts` has `setDefaultRate`, and Sarvam
 *   takes a `pace`. The tabs were dead because nothing was wired to them, not
 *   because the capability was missing. They are back, and real.
 *
 * ★ **Normal means the engine's normal.** I first shifted every rate down a
 *   notch on the theory that a slower read is easier to follow by ear. On the
 *   device it was simply draggy, and the fallback voice became the most
 *   irritating thing in the app. A farmer who wants it slower has the slow tab.
 */
export type VoiceSpeed = 'slow' | 'normal' | 'fast';

/** `react-native-tts` rate values; on Android 0.5 is the engine's own normal. */
export const TTS_RATE: Record<VoiceSpeed, number> = {
  slow: 0.40,
  // ★ 0.5 is the engine's own normal on Android. I previously set this to
  //   0.42 thinking a slower read would be easier to follow; on the device it
  //   was just draggy and irritating. Normal means normal — a farmer who wants
  //   it slower has the slow tab.
  normal: 0.5,
  fast: 0.62,
};

/**
 * Sarvam `pace` — 1.0 is the voice as trained.
 *
 * ★ Normal is a true 1.0, not a slowed-down 0.9. The server voice at its own
 *   natural pace is the one people actually want to listen to; anything below
 *   it reads as sluggish rather than clear.
 */
export const SARVAM_PACE: Record<VoiceSpeed, number> = {
  slow: 0.6,
  normal: 1.0,
  fast: 1.15,
};

let voice: VoiceChoice = 'female';
let speed: VoiceSpeed = 'normal';

export function getVoice(): VoiceChoice {
  return voice;
}

export function getSpeed(): VoiceSpeed {
  return speed;
}

export function getTtsRate(): number {
  return TTS_RATE[speed];
}

export function getSarvamPace(): number {
  return SARVAM_PACE[speed];
}

export async function setSpeed(next: VoiceSpeed): Promise<void> {
  speed = next;
  try {
    await AsyncStorage.setItem(SPEED_KEY, next);
  } catch {
    // Holds for this session via the mirror above.
  }
}

export function getSarvamSpeaker(): string {
  return SARVAM_SPEAKER[voice];
}

export async function setVoice(next: VoiceChoice): Promise<void> {
  voice = next;
  try {
    await AsyncStorage.setItem(VOICE_KEY, next);
  } catch {
    // Holds for this session via the mirror above.
  }
}

/** In-memory mirror so a screen mounting can decide synchronously, before the
 *  AsyncStorage read resolves — otherwise the first screen of the session
 *  always misses its own narration. Seeded by `loadVoiceSettings()` at boot. */
let autoNarrate = false;

export function isAutoNarrateOn(): boolean {
  return autoNarrate;
}

export async function setAutoNarrate(on: boolean): Promise<void> {
  autoNarrate = on;
  try {
    await AsyncStorage.setItem(AUTO_NARRATE_KEY, on ? '1' : '0');
  } catch {
    // A preference that fails to persist is not worth surfacing to a farmer;
    // it still holds for this session via the mirror above.
  }
}

/** Call once at startup, alongside the locale and token reads. */
export async function loadVoiceSettings(): Promise<void> {
  try {
    const [raw, rawVoice, rawSpeed] = await Promise.all([
      AsyncStorage.getItem(AUTO_NARRATE_KEY),
      AsyncStorage.getItem(VOICE_KEY),
      AsyncStorage.getItem(SPEED_KEY),
    ]);
    // Absent means "never set", which is OFF — the farmer opts in.
    autoNarrate = raw === '1';
    voice = rawVoice === 'male' ? 'male' : 'female';
    speed = rawSpeed === 'slow' || rawSpeed === 'fast' ? rawSpeed : 'normal';
  } catch {
    autoNarrate = false;
    voice = 'female';
    speed = 'normal';
  }
}
