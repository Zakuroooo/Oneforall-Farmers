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
 * ★ `autoNarrate` is read by every screen that speaks itself on arrival. It
 *   defaults to **on**: a farmer who cannot read gains nothing from an app
 *   that stays silent until he finds the speaker icon, and the one who can
 *   read will turn it off once.
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
 * Sarvam `bulbul` speaker ids for each choice.
 *
 * ★ **These do not take effect yet.** `POST /voice/narrate` currently accepts
 *   only `{ text, locale }`; the speaker is a single server-wide setting
 *   (`SARVAM_TTS_SPEAKER`), so every farmer hears the same voice regardless of
 *   what he picks here. The app sends the field anyway — FastAPI ignores an
 *   unknown key rather than erroring — so the moment the route accepts it,
 *   this starts working with no client change. Filed for Akash in
 *   `docs/BLOCKERS.md`.
 */
export const SARVAM_SPEAKER: Record<VoiceChoice, string> = {
  female: 'anushka',
  male: 'abhilash',
};

/**
 * How fast the app talks.
 *
 * ★ I removed the original speed tabs claiming neither TTS path exposed a
 *   rate. That was wrong: `react-native-tts` has `setDefaultRate`, and Sarvam
 *   takes a `pace`. The tabs were dead because nothing was wired to them, not
 *   because the capability was missing. They are back, and real.
 *
 * ★ **Normal here is slower than Android's default.** The stock rate reads a
 *   long Marathi sentence about market prices too fast to follow if you are
 *   hearing the numbers rather than reading them.
 */
export type VoiceSpeed = 'slow' | 'normal' | 'fast';

/**
 * `react-native-tts` rate values. On Android the library maps roughly 0.5 to
 * the engine's normal speed; these are deliberately shifted down one notch so
 * "normal" is already gentle and "slow" is genuinely slow.
 */
export const TTS_RATE: Record<VoiceSpeed, number> = {
  slow: 0.30,
  normal: 0.42,
  fast: 0.55,
};

/** Sarvam `pace` (1.0 = as trained). Same intent as `TTS_RATE`. */
export const SARVAM_PACE: Record<VoiceSpeed, number> = {
  slow: 0.75,
  normal: 0.9,
  fast: 1.1,
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
let autoNarrate = true;

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
    // Absent means "never set", which is on — not off.
    autoNarrate = raw === null ? true : raw === '1';
    voice = rawVoice === 'male' ? 'male' : 'female';
    speed = rawSpeed === 'slow' || rawSpeed === 'fast' ? rawSpeed : 'normal';
  } catch {
    autoNarrate = true;
    voice = 'female';
    speed = 'normal';
  }
}
