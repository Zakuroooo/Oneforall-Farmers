/**
 * The farmer's voice preferences, persisted across launches.
 *
 * ★ Why this exists: `S36_LanguageSwitcher` rendered a "voice assistance"
 *   toggle and three speed tabs that were `useState` and nothing else. Tapping
 *   them changed a colour and no behaviour — and they sat on the screen a
 *   farmer opens *because* he wants the app to talk to him. A control that
 *   lies about what it does is worse on that screen than anywhere else.
 *
 * ★ The speed tabs are gone rather than wired. `speakSmart` hands text to
 *   Sarvam or to the device engine, and neither exposes a rate we can set per
 *   utterance through the path we use. Shipping a slider that quietly does
 *   nothing is the thing we are fixing; shipping one fewer control is honest.
 *
 * ★ `autoNarrate` is read by every screen that speaks itself on arrival. It
 *   defaults to **on**: a farmer who cannot read gains nothing from an app
 *   that stays silent until he finds the speaker icon, and the one who can
 *   read will turn it off once.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTO_NARRATE_KEY = 'app.autoNarrate';

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
    const raw = await AsyncStorage.getItem(AUTO_NARRATE_KEY);
    // Absent means "never set", which is on — not off.
    autoNarrate = raw === null ? true : raw === '1';
  } catch {
    autoNarrate = true;
  }
}
