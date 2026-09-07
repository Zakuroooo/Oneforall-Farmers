/**
 * S3_Profile — Screen 06: name, district, village. The `register` call.
 *
 * Restyled to match the Stitch "Mandi Tactile Modern" system already used on
 * S2_Phone/S3_OTP — this screen had been left on its pre-redesign green/white
 * bank-form look, which is exactly the "your details section is completely
 * different" mismatch flagged against the rest of the onboarding flow.
 *
 * ★ I9. There is no Aadhaar field on this screen, there is no Aadhaar field
 *   anywhere, and there is no "optional" version of one. Phone is the identifier.
 *
 * ★ Reads `{phone, code}` from `getPendingAuth()` (`lib/auth.tsx`) — set by S2/S3_OTP,
 *   never carried as a navigation param (I14). If it is missing — a Metro reload
 *   wiped the module-level holder, or someone reached this screen without going
 *   through S2 — there is nothing to register, so this screen sends the farmer
 *   back to S2 instead of crashing on a null phone at submit time.
 *
 * ★ `role: 'FARMER'` is fixed, not a picker. This is the farmer app's own
 *   registration screen; a buyer registers through the buyer login screen, which
 *   sends `role: 'BUYER'`. One binary, but each onboarding path only ever writes
 *   its own role.
 *
 * ★ No default name. A placeholder value in a "your name" field is exactly the
 *   kind of fabricated identity this app has been burned by before — the field
 *   starts empty and stays empty until the farmer types or speaks into it.
 *
 * District comes from `GET /ref/districts` (Kartik's K5), which does not exist
 * yet — this reads `fixtures/auth.ts`'s `fxDistricts` until it does.
 */

import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ApiError, getDistricts, register } from '../../lib/api';
import { clearPendingAuth, getPendingAuth, useAuth } from '../../lib/auth';
import { getLocale } from '../../lib/locale';
import { translate } from '../../lib/i18n';
import { speakText } from '../../lib/voice';
import { RegistrationAgent } from '../../lib/registrationAgent';
import type { AgentAction } from '../../lib/registrationAgent';
import { VoiceMic } from '../../components/ui/VoiceMic';
import { Icon } from '../../components/ui/Icon';
import { colors, fontFamily, radius, space, touch } from '../../theme/tokens';
import { USE_FIXTURES } from '../../config';
import { fxAuthRegistered, fxDistricts } from '../../fixtures/auth';
import type { AuthStackParamList } from '../../navigation/AuthStack';
import type { District, Locale } from '../../types/api';

type Props = NativeStackScreenProps<AuthStackParamList, 'S3_Profile'>;

export default function S03_Profile({ navigation }: Props) {
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtId, setDistrictId] = useState<string | null>(null);
  const [locale, setLocaleState] = useState<Locale>('mr');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [districtsLoading, setDistrictsLoading] = useState(true);
  const [districtsError, setDistrictsError] = useState(false);

  const canGoBack = navigation.canGoBack();

  // ★ Registration by voice — `RegistrationAgent` owns the name/district/
  // village slot logic; this screen only renders whatever action it hands
  // back and applies a confirmed value into the same state the manual form
  // above already uses, so voice and typing stay two paths into one form,
  // never two sources of truth.
  const [agent, setAgent] = useState<RegistrationAgent | null>(null);
  const [agentAction, setAgentAction] = useState<AgentAction | null>(null);

  // ★ The agent speaks in the farmer's language, and both the district list
  //   and the stored locale load asynchronously — whichever lands second must
  //   not leave the agent asking in the wrong one. A ref carries the freshest
  //   locale into construction, and the effect below rebuilds the agent if the
  //   locale resolves after the districts did. Rebuilding is safe here and
  //   only ever happens before the farmer has answered anything: the agent
  //   holds no state worth preserving until its first reply.
  const localeRef = React.useRef<Locale>(locale);
  React.useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  React.useEffect(() => {
    if (districts.length === 0) return;
    const a = new RegistrationAgent(districts, locale);
    setAgent(a);
    setAgentAction(a.start());
    // Districts are loaded once; this re-runs only when the locale changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const loadDistricts = () => {
    setDistrictsLoading(true);
    setDistrictsError(false);
    (USE_FIXTURES ? Promise.resolve(fxDistricts) : getDistricts())
      .then(list => {
        setDistricts(list);
        setDistrictId(prev => prev ?? list[0]?.id ?? null);
        const a = new RegistrationAgent(list, localeRef.current);
        setAgent(a);
        setAgentAction(a.start());
      })
      .catch(() => setDistrictsError(true))
      .finally(() => setDistrictsLoading(false));
  };

  // Speaks whatever the agent is currently asking or confirming — every
  // `ask`/`retry`/`prefill` transition gets its own utterance; `done` is
  // silent (the CTA lighting up is feedback enough).
  useEffect(() => {
    if (!agentAction) return;
    if (agentAction.type === 'ask') void speakText(agentAction.question);
    else if (agentAction.type === 'retry') void speakText(agentAction.message);
    else if (agentAction.type === 'prefill') void speakText(agentAction.confirm);
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
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* ── Header ─────────────────────────────────── */}
        <View style={styles.header}>
          {canGoBack && (
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={20} color={colors.onSurface} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{translate('profile_title', locale)}</Text>
        </View>

        {/* ── Voice registration agent ────────────────── */}
        {agent && agentAction && agentAction.type !== 'done' ? (
          <View style={styles.voiceCard}>
            <View style={styles.voiceIconRow}>
              <Icon name="mic" size={16} color={colors.primary} />
              <Text style={styles.voicePrompt}>
                {agentAction.type === 'ask'
                  ? agentAction.question
                  : agentAction.type === 'retry'
                    ? agentAction.message
                    : agentAction.confirm}
              </Text>
            </View>

            {agentAction.type === 'prefill' ? (
              <View style={styles.confirmRow}>
                <TouchableOpacity style={styles.confirmYes} onPress={onVoiceConfirm}>
                  <Icon name="check" size={16} color={colors.onPrimary} />
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

        {/* ── Name ─────────────────────────────────────── */}
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>{translate('name', locale)}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={translate('name_placeholder', locale)}
            placeholderTextColor={colors.outline}
            accessibilityLabel={translate('name', locale)}
          />
        </View>

        {/* ── District ─────────────────────────────────── */}
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>{translate('district', locale)}</Text>
          {districtsLoading ? (
            <Text style={styles.statusText}>{translate('district_loading', locale)}</Text>
          ) : districtsError ? (
            <View style={styles.statusRow}>
              <Text style={styles.statusErrorText}>{translate('district_error', locale)}</Text>
              <TouchableOpacity onPress={loadDistricts}>
                <Text style={styles.retryLink}>{translate('retry_button', locale)}</Text>
              </TouchableOpacity>
            </View>
          ) : districts.length === 0 ? (
            <Text style={styles.statusText}>{translate('district_empty', locale)}</Text>
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
        </View>

        {/* ── Village (optional) ──────────────────────── */}
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>{translate('village_label_optional', locale)}</Text>
          <TextInput
            style={styles.input}
            value={village}
            onChangeText={setVillage}
            placeholder={translate('village_placeholder', locale)}
            placeholderTextColor={colors.outline}
            accessibilityLabel={translate('village', locale)}
          />
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={restart}>
              <Text style={styles.retryLink}>{translate('restart_otp_link', locale)}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      {/* ── Fixed CTA ────────────────────────────────── */}
      <View style={styles.dock}>
        <TouchableOpacity
          style={[styles.ctaBtn, !canSubmit && styles.ctaBtnDisabled]}
          disabled={!canSubmit}
          onPress={submit}>
          {loading ? (
            <Text style={styles.ctaText}>{translate('lot_creating', locale)}</Text>
          ) : (
            <>
              <Text style={styles.ctaText}>{translate('next', locale)}</Text>
              <Icon name="arrow-right" size={20} color={colors.onPrimary} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 100 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingTop: space.xl + 20,
    paddingBottom: space.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontFamily: fontFamily.bold, fontSize: 20, color: colors.onSurface },

  voiceCard: {
    marginHorizontal: space.md,
    marginTop: space.sm,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.positiveContainer,
    borderWidth: 1,
    borderColor: 'rgba(4,120,87,0.2)',
  },
  voiceIconRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.xs, marginBottom: space.sm },
  voicePrompt: { flex: 1, fontFamily: fontFamily.bold, fontSize: 15, color: colors.onPositiveContainer },
  confirmRow: { flexDirection: 'row', gap: space.sm },
  confirmYes: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
  },
  confirmYesText: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onPrimary },
  confirmNo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
  },
  confirmNoText: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.primary },

  fieldCard: {
    marginHorizontal: space.md,
    marginTop: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
  },
  fieldLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.4,
    marginBottom: space.xs,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.borderField,
    paddingHorizontal: space.sm,
    paddingVertical: 12,
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.onSurface,
  },
  statusText: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.onSurfaceVariant },
  statusRow: { gap: 6 },
  statusErrorText: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.critical },
  retryLink: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.primaryContainer },

  districtRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  districtChip: {
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: radius.full,
    paddingVertical: 8,
    paddingHorizontal: space.sm,
    backgroundColor: colors.surface,
  },
  districtChipSelected: {
    borderColor: colors.primaryContainer,
    backgroundColor: colors.onPrimaryContainer,
  },
  districtLabel: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.onSurface },
  districtLabelSelected: { fontFamily: fontFamily.bold, color: colors.primaryContainer },

  errorCard: {
    marginHorizontal: space.md,
    marginTop: space.md,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.criticalContainer,
    gap: 6,
  },
  errorText: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.critical },

  dock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: space.md,
    paddingBottom: space.xl,
    paddingTop: space.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: touch.targetHero,
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.lg,
    gap: space.sm,
  },
  ctaBtnDisabled: { backgroundColor: colors.surfaceContainerHigh },
  ctaText: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.onPrimary, letterSpacing: 0.3 },
});
