/**
 * VoiceMic — record button + ASR wrapper, shared by S2 (phone/OTP) and S3
 * (name/district/village, driving `RegistrationAgent`).
 *
 * ★ Tap once to start recording, tap again to stop — not press-and-hold.
 *   A farmer holding a phone one-handed in a mandi is the exact case a
 *   press-and-hold gesture works against.
 *
 * ★ `POST /voice/transcribe` does not exist on the server yet (see
 *   `lib/api.ts`'s voice section) — this component calls it anyway, per the
 *   explicit instruction to build the whole path now and let the backend
 *   catch up. Until it does, every recording ends in `voice_mic_error`,
 *   which is why the manual text fallback below the mic is not optional
 *   polish — it is the only way this screen is usable before that route
 *   ships.
 *
 * ★ Records to `.m4a` (AAC) — matches `transcribeAudio()`'s
 *   `type: 'audio/mp4'` multipart part.
 *
 * ★ No emoji glyphs — the mic and send affordances are drawn `Icon`s
 *   (`react-native-svg`), not a font gamble on a cheap device.
 */

import React, { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AudioRecorderPlayer, { AudioEncoderAndroidType, AudioSourceAndroidType, OutputFormatAndroidType } from 'react-native-audio-recorder-player';

import { transcribeAudio } from '../../lib/api';
import { translate } from '../../lib/i18n';
import { Icon } from './Icon';
import { colors, fontFamily, radius, space } from '../../theme/tokens';
import type { Locale } from '../../types/api';

type MicState = 'idle' | 'recording' | 'transcribing';

const AUDIO_SET = {
  AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
  AudioSourceAndroid: AudioSourceAndroidType.MIC,
  OutputFormatAndroid: OutputFormatAndroidType.MPEG_4,
};

// `PermissionsAndroid.PERMISSIONS` is typed as `{[key: string]: Permission}`,
// which `noUncheckedIndexedAccess` (tsconfig.json) reads as possibly
// `undefined` on every access — the literal string is the actual `Permission`
// value regardless, so this names it once instead of casting at each call site.
const RECORD_AUDIO_PERMISSION = 'android.permission.RECORD_AUDIO' as const;

async function ensureMicPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const already = await PermissionsAndroid.check(RECORD_AUDIO_PERMISSION);
  if (already) return true;
  const result = await PermissionsAndroid.request(RECORD_AUDIO_PERMISSION);
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export function VoiceMic({
  locale,
  onTranscript,
  disabled = false,
}: {
  locale: Locale;
  onTranscript: (text: string) => void;
  disabled?: boolean;
}) {
  const [state, setState] = useState<MicState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [manualText, setManualText] = useState('');
  // One recorder instance for the component's lifetime — re-instantiating
  // per recording has no benefit and this library's own examples reuse one.
  const recorder = useRef(new AudioRecorderPlayer()).current;

  useEffect(() => {
    return () => {
      // A farmer who navigates away mid-recording should not leave a live
      // mic behind — best-effort, the component is unmounting either way.
      if (state === 'recording') {
        recorder.stopRecorder().catch(() => {});
        recorder.removeRecordBackListener();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    setError(null);
    const granted = await ensureMicPermission();
    if (!granted) {
      setError(translate('voice_mic_permission_denied', locale));
      return;
    }
    try {
      await recorder.startRecorder(undefined, AUDIO_SET);
      recorder.addRecordBackListener(() => undefined);
      setState('recording');
    } catch {
      setError(translate('voice_mic_error', locale));
    }
  };

  const stopRecording = async () => {
    setState('transcribing');
    try {
      const uri = await recorder.stopRecorder();
      recorder.removeRecordBackListener();
      const { transcript } = await transcribeAudio(uri, locale);
      onTranscript(transcript);
    } catch {
      // Expected today — `/voice/transcribe` is not live yet (see this
      // file's header). The manual fallback below is what actually carries
      // the farmer through registration until it is.
      setError(translate('voice_mic_error', locale));
    } finally {
      setState('idle');
    }
  };

  const onPressMic = () => {
    if (disabled) return;
    if (state === 'idle') void startRecording();
    else if (state === 'recording') void stopRecording();
  };

  const label =
    state === 'recording'
      ? translate('voice_mic_recording', locale)
      : state === 'transcribing'
        ? translate('voice_mic_transcribing', locale)
        : translate('voice_mic_idle', locale);

  const submitManual = () => {
    const text = manualText.trim();
    if (!text) return;
    setManualText('');
    onTranscript(text);
  };

  return (
    <View style={styles.root}>
      <TouchableOpacity
        onPress={onPressMic}
        disabled={disabled || state === 'transcribing'}
        style={[
          styles.micButton,
          state === 'recording' && styles.micButtonRecording,
          (disabled || state === 'transcribing') && styles.micButtonDisabled,
        ]}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={label}>
        <Icon
          name="mic"
          size={20}
          color={state === 'recording' ? colors.critical : colors.primary}
        />
        <Text style={styles.micLabel}>{label}</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.manualRow}>
        <Text style={styles.manualLabel}>{translate('voice_or_type_label', locale)}</Text>
        <View style={styles.manualInputRow}>
          <TextInput
            style={styles.manualInput}
            value={manualText}
            onChangeText={setManualText}
            placeholder={translate('voice_manual_placeholder', locale)}
            placeholderTextColor={colors.outline}
            editable={!disabled}
            onSubmitEditing={submitManual}
          />
          <TouchableOpacity
            onPress={submitManual}
            disabled={disabled || manualText.trim().length === 0}
            style={[styles.sendBtn, (disabled || manualText.trim().length === 0) && styles.micButtonDisabled]}>
            <Text style={styles.sendBtnText}>{translate('voice_manual_send', locale)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginVertical: space.xs },
  micButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: space.md,
  },
  micButtonRecording: { backgroundColor: colors.criticalContainer },
  micButtonDisabled: { opacity: 0.5 },
  micLabel: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.onSurface },
  errorText: { color: colors.critical, fontSize: 13, marginTop: space.xs, textAlign: 'center' },
  manualRow: { marginTop: space.sm },
  manualLabel: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.onSurfaceVariant, marginBottom: 6 },
  manualInputRow: { flexDirection: 'row', gap: space.xs },
  manualInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    paddingHorizontal: space.sm,
    paddingVertical: 10,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.onSurface,
    backgroundColor: colors.surface,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    justifyContent: 'center',
  },
  sendBtnText: { fontFamily: fontFamily.bold, color: colors.onPrimary, fontSize: 14 },
});
