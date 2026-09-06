/**
 * Runs before every test file. The AsyncStorage package ships a mock object at
 * .../jest/async-storage-mock, but it is just an exported object — something
 * still has to call jest.mock() to swap it in for the native module, which is
 * this file's only job.
 */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

/**
 * `react-native-sound` has no shipped jest mock (unlike AsyncStorage above) —
 * it reaches for its native module the moment `lib/voice.ts` is imported, at
 * module scope, which is exactly what every screen that renders a 🔊 button
 * does. No test in this suite plays a clip or waits on one finishing; this
 * mock only needs to satisfy the shape `voice.ts` actually calls
 * (`new Sound(name, basePath, cb)`, `.play(cb)`, `Sound.setCategory`,
 * `Sound.MAIN_BUNDLE`) without touching a real audio subsystem.
 */
jest.mock('react-native-sound', () => {
  class MockSound {
    constructor(_filename, _basePath, callback) {
      if (callback) callback(null);
    }
    play(onEnd) {
      if (onEnd) onEnd(true);
      return this;
    }
    release() {
      return this;
    }
  }
  MockSound.setCategory = () => {};
  MockSound.setActive = () => {};
  MockSound.MAIN_BUNDLE = 'MAIN_BUNDLE';
  MockSound.DOCUMENT = 'DOCUMENT';
  MockSound.LIBRARY = 'LIBRARY';
  MockSound.CACHES = 'CACHES';
  return MockSound;
});

/**
 * `react-native-tts` is `lib/voice.ts`'s fallback for a clip whose
 * pre-generated file does not exist — same import-time native-module problem
 * as `react-native-sound` above, same fix. `MockSound.play` above always
 * succeeds, so no test in this suite actually reaches the TTS fallback path;
 * this only needs to exist so importing `Tts` does not crash.
 */
jest.mock('react-native-tts', () => ({
  __esModule: true,
  default: {
    setDefaultLanguage: () => Promise.resolve('success'),
    speak: () => 'mock-utterance-id',
    addEventListener: () => {},
    removeEventListener: () => {},
  },
}));
