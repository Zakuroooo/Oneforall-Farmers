/**
 * S1 — language picker. मराठी / हिंदी / English.
 *
 * ★ First launch only. `AuthStack` reads `hasLocale` off `useAuth()` (resolved in
 *   the same boot effect as the token check, so there is no second flash) and
 *   sets its `initialRouteName` to S2 directly when a locale is already on the
 *   device. This screen only ever exists to leave a value in `AsyncStorage` once.
 *
 * ★ Marathi is pre-selected, not just first in the list. The picker exists to let
 *   the other two out, not to make a farmer choose his own language before he can
 *   use the app (PRANAY.md §1.2).
 *
 * The three option labels are each written in their own language's script — मराठी
 * in Devanagari, हिंदी in Devanagari, English in Latin — because that is how a
 * language names itself, not a translation choice. Every other string on every
 * other farmer screen is hardcoded Marathi for now: `i18n/` (Shreya's SH1) does
 * not exist yet, and per PRANAY.md's own escape hatch, a screen with no
 * translation dictionary to draw from ships the Marathi text directly rather than
 * inventing a mini i18n system that gets thrown away the moment SH1 lands.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { setLocale } from '../../lib/locale';
import type { AuthStackParamList } from '../../navigation/AuthStack';
import type { Locale } from '../../types/api';

type Props = NativeStackScreenProps<AuthStackParamList, 'S1_Language'>;

const OPTIONS: Array<{ code: Locale; label: string }> = [
  { code: 'mr', label: 'मराठी' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'en', label: 'English' },
];

export default function S01_Language({ navigation }: Props) {
  const [selected, setSelected] = useState<Locale>('mr');
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    setSaving(true);
    await setLocale(selected);
    // `replace`, not `navigate` — S1 is a one-time gate, not a screen the back
    // button should be able to return to from S2.
    navigation.replace('S2_Phone');
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>भाषा निवडा</Text>

      <View style={styles.options}>
        {OPTIONS.map(opt => {
          const isSelected = opt.code === selected;
          return (
            <TouchableOpacity
              key={opt.code}
              onPress={() => setSelected(opt.code)}
              style={[styles.option, isSelected && styles.optionSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}>
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={confirm}
        disabled={saving}
        style={[styles.confirm, saving && styles.confirmDisabled]}>
        <Text style={styles.confirmLabel}>{saving ? '...' : 'पुढे'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const GREEN = '#1B5E20';

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 32 },
  options: { gap: 16 },
  option: {
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
  },
  optionSelected: { borderColor: GREEN, backgroundColor: '#E8F5E9' },
  optionLabel: { fontSize: 22, color: '#333' },
  optionLabelSelected: { color: GREEN, fontWeight: '700' },
  confirm: {
    marginTop: 40,
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmDisabled: { opacity: 0.6 },
  confirmLabel: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
