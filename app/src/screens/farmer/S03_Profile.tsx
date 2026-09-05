/**
 * S3 — name, district, village. The `register` call.
 *
 * ★ I9. There is no Aadhaar field on this screen, there is no Aadhaar field
 *   anywhere, and there is no "optional" version of one. Phone is the identifier.
 *
 * ★ Reads `{phone, code}` from `getPendingAuth()` (`lib/auth.tsx`) — set by S2,
 *   never carried as a navigation param (I14). If it is missing — a Metro reload
 *   wiped the module-level holder, or someone reached this screen without going
 *   through S2 — there is nothing to register, so this screen sends the farmer
 *   back to S2 instead of crashing on a null phone at submit time.
 *
 * ★ `role: 'FARMER'` is fixed, not a picker. This is the farmer app's own
 *   registration screen; a buyer registers through Shreya's S17 equivalent, which
 *   sends `role: 'BUYER'`. One binary, but each onboarding path only ever writes
 *   its own role.
 *
 * District comes from `GET /ref/districts` (Kartik's K5), which does not exist
 * yet — this reads `fixtures/auth.ts`'s `fxDistricts` until it does.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ApiError, getDistricts, register } from '../../lib/api';
import { clearPendingAuth, getPendingAuth, useAuth } from '../../lib/auth';
import { getLocale } from '../../lib/locale';
import { USE_FIXTURES } from '../../config';
import { fxAuthRegistered, fxDistricts } from '../../fixtures/auth';
import type { AuthStackParamList } from '../../navigation/AuthStack';
import type { District, Locale } from '../../types/api';

type Props = NativeStackScreenProps<AuthStackParamList, 'S3_Profile'>;

export default function S03_Profile({ navigation }: Props) {
  const { signIn } = useAuth();
  const [name, setName] = useState('रामभाऊ पाटील');
  const [village, setVillage] = useState('');
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtId, setDistrictId] = useState<string | null>(null);
  const [locale, setLocaleState] = useState<Locale>('mr');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [districtsLoading, setDistrictsLoading] = useState(true);
  const [districtsError, setDistrictsError] = useState(false);

  const loadDistricts = () => {
    setDistrictsLoading(true);
    setDistrictsError(false);
    (USE_FIXTURES ? Promise.resolve(fxDistricts) : getDistricts())
      .then(list => {
        setDistricts(list);
        setDistrictId(prev => prev ?? list[0]?.id ?? null);
      })
      .catch(() => setDistrictsError(true))
      .finally(() => setDistrictsLoading(false));
  };

  useEffect(() => {
    if (!getPendingAuth()) {
      navigation.replace('S2_Phone');
      return;
    }
    getLocale().then(l => l && setLocaleState(l));
    loadDistricts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const submit = async () => {
    const pending = getPendingAuth();
    if (!pending || !districtId) return;

    setError(null);
    setLoading(true);
    try {
      // `exactOptionalPropertyTypes` (tsconfig.json) means `village?: string` can be
      // absent or a string, never explicitly `undefined` — so an empty village is a
      // spread that omits the key, not an assignment that sets it to `undefined`.
      const trimmedVillage = village.trim();
      const res = USE_FIXTURES
        ? fxAuthRegistered
        : await register({
            phone: pending.phone,
            code: pending.code,
            name: name.trim(),
            role: 'FARMER',
            locale,
            district_id: districtId,
            ...(trimmedVillage ? { village: trimmedVillage } : {}),
          });
      clearPendingAuth();
      await signIn(res);
    } catch (err) {
      // A real failure here — register independently re-validates {phone, code} —
      // means the OTP really was wrong or has expired. Unlike S2's verify
      // failure, this one is unambiguous, so it gets a real message and sends
      // the farmer back to request a fresh code.
      setError(
        err instanceof ApiError
          ? 'OTP चुकीचा किंवा कालबाह्य आहे. पुन्हा सुरू करा.'
          : 'सर्व्हरशी संपर्क होऊ शकला नाही. पुन्हा प्रयत्न करा.',
      );
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    clearPendingAuth();
    navigation.replace('S2_Phone');
  };

  const canSubmit = name.trim().length > 0 && districtId !== null && !loading;

  return (
    <View style={styles.root}>
      <Text style={styles.title}>तुमची माहिती</Text>

      <Text style={styles.label}>नाव</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="तुमचे नाव"
        accessibilityLabel="नाव"
      />

      <Text style={styles.label}>जिल्हा</Text>
      {districtsLoading ? (
        <Text style={styles.districtStatus}>जिल्हे आणत आहोत...</Text>
      ) : districtsError ? (
        <View style={styles.districtStatusRow}>
          <Text style={styles.districtStatusError}>जिल्हे आणता आले नाहीत.</Text>
          <TouchableOpacity onPress={loadDistricts}>
            <Text style={styles.restart}>पुन्हा प्रयत्न करा</Text>
          </TouchableOpacity>
        </View>
      ) : districts.length === 0 ? (
        <Text style={styles.districtStatus}>जिल्हे सापडले नाहीत.</Text>
      ) : (
        <View style={styles.districtRow}>
          {districts.map(d => {
            const isSelected = d.id === districtId;
            return (
              <TouchableOpacity
                key={d.id}
                onPress={() => setDistrictId(d.id)}
                style={[styles.districtChip, isSelected && styles.districtChipSelected]}>
                <Text style={[styles.districtLabel, isSelected && styles.districtLabelSelected]}>
                  {d.name_mr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text style={styles.label}>गाव (ऐच्छिक)</Text>
      <TextInput
        style={styles.input}
        value={village}
        onChangeText={setVillage}
        placeholder="गावाचे नाव"
        accessibilityLabel="गाव"
      />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity onPress={restart}>
            <Text style={styles.restart}>पुन्हा OTP साठी परत जा</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <TouchableOpacity
        onPress={submit}
        disabled={!canSubmit}
        style={[styles.button, !canSubmit && styles.buttonDisabled]}>
        <Text style={styles.buttonLabel}>{loading ? '...' : 'पुढे'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const GREEN = '#1B5E20';

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  label: { fontSize: 15, color: '#555', marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    marginBottom: 16,
  },
  districtRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  districtStatus: { fontSize: 14, color: '#888', marginBottom: 16 },
  districtStatusRow: { marginBottom: 16, gap: 6 },
  districtStatusError: { fontSize: 14, color: '#C62828' },
  districtChip: {
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  districtChipSelected: { borderColor: GREEN, backgroundColor: '#E8F5E9' },
  districtLabel: { fontSize: 16, color: '#333' },
  districtLabelSelected: { color: GREEN, fontWeight: '700' },
  errorBox: { marginBottom: 16 },
  error: { color: '#C62828', fontSize: 14, marginBottom: 6 },
  restart: { color: GREEN, fontSize: 14, fontWeight: '600' },
  button: {
    marginTop: 8,
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonLabel: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
