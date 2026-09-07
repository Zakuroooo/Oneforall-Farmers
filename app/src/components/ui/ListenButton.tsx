/**
 * The "listen" control that sits in the corner of most screens.
 *
 * ★ Why this exists: ten screens rendered a speaker icon in a
 *   `TouchableOpacity` with no `onPress` at all. Tapping it did nothing, on
 *   the screens where hearing the number out loud matters most — the offer
 *   list, the deal confirmation, the settlement receipt. For a farmer who
 *   does not read fluently that is not a missing nicety, it is the screen
 *   failing at its job. One component now owns the behaviour, so a dead
 *   speaker button cannot come back by copy-paste.
 *
 * ★ It speaks through the device's own TTS (`lib/voice.ts`), which works
 *   offline — I7, and a farmer in a mandi with no signal still gets the
 *   number read to him.
 *
 *   For the verdict specifically, `speakSaleWindow()` prefers Sarvam's
 *   human-grade Marathi over on-device TTS — the backend team wired that
 *   (narrate -> base64 WAV -> cache file -> player, with `react-native-fs`),
 *   and it falls back to on-device TTS whenever the server is unreachable, so
 *   the verdict is never silent. This button speaks its own screen's text and
 *   uses the on-device path directly; the Sarvam path is worth extending here
 *   once the other screens have narration sentences worth synthesizing.
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors, fontFamily, radius } from '../../theme/tokens';
import { Icon } from './Icon';
import { useT } from '../../lib/i18n';
import { speakSmart, stopSpeaking } from '../../lib/voice';

export function ListenButton({ text, label }: { text: string; label?: string }) {
  const { t, locale } = useT();
  const [speaking, setSpeaking] = useState(false);

  /**
   * ★ A toggle, not a replay.
   *
   *   The button used to start playback with no way to stop it. It showed
   *   "Playing…" and a second tap restarted from the top — so a farmer who
   *   had heard enough, or who tapped it by accident on a long narration,
   *   had to sit through the whole thing or leave the screen. Worse, on the
   *   Sarvam path leaving the screen did not help either: `stopSpeaking()`
   *   only reached the on-device TTS engine, and the clip kept playing.
   *
   *   Now: tapping while it speaks stops it immediately and the label goes
   *   back to "Listen". Tapping again starts from the first word.
   *
   * ★ `stoppedRef` guards the stale-finally race. The in-flight `speakSmart`
   *   resolves shortly after a stop, and its `finally` would otherwise clear
   *   the flag on a *newer* utterance the farmer had already started.
   */
  const runIdRef = useRef(0);

  const onPress = async () => {
    if (text.trim().length === 0) return;

    if (speaking) {
      runIdRef.current += 1;
      setSpeaking(false);
      await stopSpeaking();
      return;
    }

    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    setSpeaking(true);
    try {
      // Sarvam's voice where the server is reachable, the device's own TTS
      // where it is not — and always in the language the farmer chose.
      await speakSmart(text, locale);
    } catch {
      // A farmer who taps listen and hears nothing has lost a nice-to-have,
      // not the screen. An error banner over a TTS glitch would outrank the
      // content it was meant to read.
    } finally {
      // Only the run that is still current may clear the flag.
      if (runIdRef.current === runId) setSpeaking(false);
    }
  };

  /* Leaving the screen mid-sentence should not leave a voice behind. */
  useEffect(() => {
    return () => {
      runIdRef.current += 1;
      void stopSpeaking();
    };
  }, []);

  return (
    <TouchableOpacity
      style={[styles.btn, speaking && styles.btnActive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: speaking }}
      accessibilityLabel={speaking ? t('listen_stop_a11y') : (label ?? t('listen_button'))}>
      {/* ★ A speaker when idle, a stop square when speaking — never
          `volume-off`. A crossed-out speaker means *muted*, which was the
          one thing it did not mean: there was sound, and tapping did not
          mute it. The icon now says what the tap will do. */}
      <Icon
        name={speaking ? 'x-circle' : 'volume'}
        size={14}
        color={speaking ? colors.onPrimary : colors.primary}
      />
      <Text style={[styles.label, speaking && styles.labelActive]}>
        {speaking ? t('listening_button') : t('splash_listen')}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    flexShrink: 0,
  },
  btnActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primaryContainer },
  label: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  labelActive: { color: colors.onPrimary },
});
