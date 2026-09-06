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
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ApiError, getDistricts, register } from '../../lib/api';
import { clearPendingAuth, getPendingAuth, useAuth } from '../../lib/auth';
import { getLocale } from '../../lib/locale';
import { translate } from '../../lib/i18n';
import { speakText } from '../../lib/voice';
import { RegistrationAgent } from '../../lib/registrationAgent';
import type { AgentAction } from '../../lib/registrationAgent';
import { VoiceMic } from '../../components/ui/VoiceMic';
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

  // ★ Registration by voice — `RegistrationAgent` owns the name/district/
  // village slot logic; this screen only renders whatever action it hands
  // back and applies a confirmed value into the same state the manual form
  // above already uses, so voice and typing stay two paths into one form,
  // never two sources of truth.
  const [agent, setAgent] = useState<RegistrationAgent | null>(null);
  const [agentAction, setAgentAction] = useState<AgentAction | null>(null);

  const loadDistricts = () => {
    setDistrictsLoading(true);
    setDistrictsError(false);
    (USE_FIXTURES ? Promise.resolve(fxDistricts) : getDistricts())
      .then(list => {
        setDistricts(list);
        setDistrictId(prev => prev ?? list[0]?.id ?? null);
        const a = new RegistrationAgent(list);
        setAgent(a);
        setAgentAction(a.start());
      })
      .catch(() => setDistrictsError(true))
      .finally(() => setDistrictsLoading(false));
  };

  // Speaks whatever the agent is currently asking or confirming — every
  // `ask`/`retry`/`prefill` transition gets its own utterance; `done` is
  // silent (the "पुढे" button lighting up is feedback enough).
  useEffect(() => {
    if (!agentAction) return;
    if (agentAction.type === 'ask') void speakText(agentAction.question_mr);
    else if (agentAction.type === 'retry') void speakText(agentAction.message_mr);
    else if (agentAction.type === 'prefill') void speakText(agentAction.confirm_mr);
  }, [agentAction]);

  const onVoiceTranscript = (transcript: string) => {
    if (!agent) return;
    setAgentAction(agent.next(transcript));
  };

  const applyAgentValues = (a: RegistrationAgent) => {
    const values = a.getValues();
    if (values.name !== undefined) setName(values.name);
    if (values.districtId !== undefined) setDistrictId(values.districtId);
    if (values.village !== undefined) setVillage(values.village);
  };

  const onVoiceConfirm = () => {
    if (!agent) return;
    const next = agent.confirm();
    applyAgentValues(agent);
    setAgentAction(next);
  };

  const onVoiceDeny = () => {
    if (!agent) return;
    setAgentAction(agent.deny());
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
        translate(err instanceof ApiError ? 'otp_invalid_expired' : 'server_contact_error', locale),
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
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.title}>{translate('profile_title', locale)}</Text>

      {agent && agentAction && agentAction.type !== 'done' ? (
        <View style={styles.voiceCard}>
          <Text style={styles.voicePrompt}>
            {agentAction.type === 'ask'
              ? agentAction.question_mr
              : agentAction.type === 'retry'
                ? agentAction.message_mr
                : agentAction.confirm_mr}
          </Text>

          {agentAction.type === 'prefill' ? (
            <View style={styles.confirmRow}>
              <TouchableOpacity style={styles.confirmYes} onPress={onVoiceConfirm}>
                <Text style={styles.confirmYesText}>{translate('voice_confirm_yes', locale)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmNo} onPress={onVoiceDeny}>
                <Text style={styles.confirmNoText}>{translate('voice_confirm_no', locale)}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <VoiceMic locale={locale} onTranscript={onVoiceTranscript} />
          )}
        </View>
      ) : null}

      <Text style={styles.label}>{translate('name', locale)}</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder={translate('name_placeholder', locale)}
        accessibilityLabel={translate('name', locale)}
      />

      <Text style={styles.label}>{translate('district', locale)}</Text>
      {districtsLoading ? (
        <Text style={styles.districtStatus}>{translate('district_loading', locale)}</Text>
      ) : districtsError ? (
        <View style={styles.districtStatusRow}>
          <Text style={styles.districtStatusError}>{translate('district_error', locale)}</Text>
          <TouchableOpacity onPress={loadDistricts}>
            <Text style={styles.restart}>{translate('retry_button', locale)}</Text>
          </TouchableOpacity>
        </View>
      ) : districts.length === 0 ? (
        <Text style={styles.districtStatus}>{translate('district_empty', locale)}</Text>
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

      <Text style={styles.label}>{translate('village_label_optional', locale)}</Text>
      <TextInput
        style={styles.input}
        value={village}
        onChangeText={setVillage}
        placeholder={translate('village_placeholder', locale)}
        accessibilityLabel={translate('village', locale)}
      />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity onPress={restart}>
            <Text style={styles.restart}>{translate('restart_otp_link', locale)}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <TouchableOpacity
        onPress={submit}
        disabled={!canSubmit}
        style={[styles.button, !canSubmit && styles.buttonDisabled]}>
        <Text style={styles.buttonLabel}>{loading ? '...' : translate('next', locale)}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const GREEN = '#1B5E20';

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#212121', marginBottom: 24 },
  label: { fontSize: 15, color: '#555', marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    // A TextInput with no `color` renders what the farmer types in the
    // platform default — invisible on a dark-mode device.
    color: '#212121',
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
  voiceCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  voicePrompt: { fontSize: 16, fontWeight: '700', color: '#1B5E20', marginBottom: 8, textAlign: 'center' },
  confirmRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  confirmYes: {
    flex: 1,
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmYesText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  confirmNo: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmNoText: { color: GREEN, fontSize: 16, fontWeight: '700' },
});
