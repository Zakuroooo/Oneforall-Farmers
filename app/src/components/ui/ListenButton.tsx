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
 *   The backend does have a live Sarvam narration route, and `narrate()` in
 *   `lib/api.ts` now matches its real response shape. It is not used for
 *   playback yet for one concrete reason: `/voice/narrate` returns
 *   `audio_base64`, and playing base64 needs it written to a file first —
 *   `react-native-sound` takes a path or URL, not a data blob. This app has
 *   no filesystem dependency, and 12_STACK bans adding one without the team.
 *   The cheaper fix is on the backend: return a URL instead of base64 and
 *   this component can play it with what is already installed. Flagged, not
 *   silently skipped.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors, fontFamily, radius, space } from '../../theme/tokens';
import { Icon } from './Icon';
import { useT } from '../../lib/i18n';
import { speakText } from '../../lib/voice';

export function ListenButton({ text, label }: { text: string; label?: string }) {
  const { t } = useT();
  const [speaking, setSpeaking] = useState(false);

  const onPress = async () => {
    if (speaking || text.trim().length === 0) return;
    setSpeaking(true);
    try {
      await speakText(text);
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
