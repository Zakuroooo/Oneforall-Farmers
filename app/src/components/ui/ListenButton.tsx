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

import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors, fontFamily, radius, space } from '../../theme/tokens';
import { Icon } from './Icon';
import { useT } from '../../lib/i18n';
import { speakText, stopSpeaking } from '../../lib/voice';

export function ListenButton({ text, label }: { text: string; label?: string }) {
  const { t, locale } = useT();
  const [speaking, setSpeaking] = useState(false);

  /**
   * ★ Every tap restarts the narration from the beginning.
   *
   *   This used to bail out early while `speaking` was true, so a farmer who
   *   missed a sentence had no way to hear it again — the button simply did
   *   nothing until the whole utterance finished, and if the engine's finish
   *   event never arrived it stayed dead for good. Tapping mid-speech now
   *   stops and replays, which is what a farmer who did not catch something
   *   actually wants.
   */
  const onPress = async () => {
    if (text.trim().length === 0) return;
    if (speaking) {
      await stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    try {
      // Spoken in the language the farmer chose, not the app's default.
      await speakText(text, locale);
    } catch {
      // A farmer who taps listen and hears nothing has lost a nice-to-have,
      // not the screen. An error banner over a TTS glitch would outrank the
      // content it was meant to read.
    } finally {
      setSpeaking(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.btn, speaking && styles.btnActive]}
      onPress={onPress}
      disabled={speaking}
      accessibilityRole="button"
      accessibilityLabel={label ?? t('listen_button')}>
      <Icon name={speaking ? 'volume-off' : 'volume'} size={14} color={colors.primary} />
      <Text style={styles.label}>{speaking ? t('listening_button') : t('splash_listen')}</Text>
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
  btnActive: { backgroundColor: colors.onPrimaryContainer, borderColor: colors.primaryContainer },
  label: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
});
