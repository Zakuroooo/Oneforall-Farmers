/**
 * S03_OTP — Screen 05: 6-digit OTP verification with countdown timer.
 * Matched to Stitch `05_otp_verification_6_pin_sms_auto_detect/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StatusBar,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';
import type { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'S3_OTP'>;

const RESEND_SECONDS = 30;

export default function S03_OTP({ navigation }: Props) {
  const { t } = useT();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [verifying, setVerifying] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const handleDigit = (val: string, idx: number) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) inputs.current[idx + 1]?.focus();
    if (!digit && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      navigation.navigate('S3_Profile');
    }, 1200);
  };

  const filled = otp.filter(Boolean).length;
  const isReady = filled === 6;
  const timerStr = `00:${String(countdown).padStart(2, '0')}`;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={20} color={colors.onSurface} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('otp_title')}</Text>
            <Text style={styles.headerStep}>{t('otp_step')}</Text>
          </View>
          <TouchableOpacity style={styles.listenBtn}>
            <Icon name="volume" size={14} color={colors.primary} />
            <Text style={styles.listenText}>{t('splash_listen')}</Text>
          </TouchableOpacity>
        </View>

        {/* Icon */}
        <View style={styles.iconWrap}>
          <View style={styles.iconOuter}>
            <Icon name="message-circle" size={36} color={colors.primaryContainer} />
          </View>
          <View style={styles.lockBadge}>
            <Icon name="lock" size={12} color={colors.onTertiary} />
          </View>
        </View>

        <Text style={styles.heading}>{t('otp_heading')}</Text>
        <Text style={styles.subheading}>{t('otp_subheading')}</Text>

        {/* Phone number row */}
        <View style={styles.phoneRow}>
          <Text style={styles.phoneNum}>+91 98220 41209 {t('otp_sent_to')}</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.goBack()}>
            <Icon name="edit" size={12} color={colors.primaryContainer} />
            <Text style={styles.editText}>{t('otp_edit')}</Text>
          </TouchableOpacity>
        </View>

        {/* OTP boxes */}
        <Text style={styles.boxHint}>{t('otp_box_hint')}</Text>
        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={el => { inputs.current[i] = el; }}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null, i === filled && filled < 6 ? styles.otpBoxActive : null]}
              value={digit}
              onChangeText={v => handleDigit(v, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Auto-detect banner */}
        <View style={styles.autoBanner}>
          <View style={styles.autoIconBg}>
            <Icon name="check-circle" size={18} color={colors.tertiary} />
          </View>
          <View style={styles.autoText}>
            <Text style={styles.autoTitle}>{t('otp_auto_title')}</Text>
            <Text style={styles.autoSub}>{t('otp_auto_sub')}</Text>
          </View>
          <Icon name="refresh" size={16} color={colors.outline} />
        </View>

        {/* Resend row */}
        <View style={styles.resendCard}>
          <View style={styles.resendLeft}>
            <Icon name="clock" size={16} color={countdown > 0 ? colors.primary : colors.tertiary} />
            <View>
              <Text style={styles.resendLabel}>{t('otp_resend_label')}</Text>
              <Text style={[styles.resendTimer, { color: countdown > 0 ? colors.primary : colors.tertiary }]}>
                {timerStr} <Text style={styles.resendTimerSec}>({countdown}s)</Text>
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.resendBtn, countdown > 0 && styles.resendBtnDisabled]}
            disabled={countdown > 0}
            onPress={() => setCountdown(RESEND_SECONDS)}>
            <Text style={[styles.resendBtnText, countdown > 0 && { color: colors.outline }]}>
              {t('otp_resend_btn')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Alternative methods */}
        <Text style={styles.altLabel}>{t('otp_alt_label')}</Text>
        <View style={styles.altList}>
          <TouchableOpacity style={styles.altCard}>
            <View style={[styles.altIconBg, { backgroundColor: 'rgba(4,120,87,0.08)' }]}>
              <Icon name="message-circle" size={18} color={colors.tertiary} />
            </View>
            <View style={styles.altInfo}>
              <View style={styles.altTitleRow}>
                <Text style={styles.altTitle}>{t('otp_whatsapp_title')}</Text>
                <View style={styles.instantBadge}><Text style={styles.instantText}>{t('otp_instant')}</Text></View>
              </View>
              <Text style={styles.altSub}>{t('otp_whatsapp_sub')}</Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.outline} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.altCard}>
            <View style={[styles.altIconBg, { backgroundColor: 'rgba(155,47,0,0.08)' }]}>
              <Icon name="phone" size={18} color={colors.primary} />
            </View>
            <View style={styles.altInfo}>
              <Text style={styles.altTitle}>{t('otp_call_title')}</Text>
              <Text style={styles.altSub}>{t('otp_call_sub')}</Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.outline} />
          </TouchableOpacity>
        </View>

        {/* Footer trust */}
        <View style={styles.footerRow}>
          <Icon name="shield-check" size={11} color={colors.tertiary} />
          <Text style={styles.footerText}>{t('otp_footer')}</Text>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.dock}>
        <TouchableOpacity
          style={[styles.ctaBtn, !isReady && styles.ctaDisabled]}
          disabled={!isReady || verifying}
          onPress={handleVerify}>
          <Text style={styles.ctaText}>
            {verifying ? t('otp_verifying') : t('otp_cta')}
          </Text>
          {!verifying && <Icon name="arrow-right" size={20} color={colors.onPrimary} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 100 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    paddingHorizontal: space.md, paddingTop: space.xl + 20, paddingBottom: space.sm,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.primary },
  headerStep: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant },
  listenBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full,
    backgroundColor: 'rgba(155,47,0,0.08)', borderWidth: 1, borderColor: 'rgba(155,47,0,0.15)',
  },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  iconWrap: { alignItems: 'center', marginTop: space.xl, position: 'relative', alignSelf: 'center' },
  iconOuter: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.onPrimaryContainer, borderWidth: 2, borderColor: colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute', bottom: 0, right: -4, width: 26, height: 26,
    borderRadius: 13, backgroundColor: colors.tertiary,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.surface,
  },
  heading: {
    fontFamily: fontFamily.extraBold, fontSize: 26, color: colors.onSurface,
    textAlign: 'center', marginTop: space.md, letterSpacing: -0.3, paddingHorizontal: space.md,
  },
  subheading: {
    fontFamily: fontFamily.regular, fontSize: 13, color: colors.onSurfaceVariant,
    textAlign: 'center', marginTop: 4, paddingHorizontal: space.xxl,
  },
  phoneRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: space.md, marginTop: space.md, padding: space.md,
    borderRadius: radius.lg, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.outlineVariant,
  },
  phoneNum: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.onSurface, flex: 1 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full,
    backgroundColor: colors.onPrimaryContainer,
  },
  editText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primaryContainer },
  boxHint: {
    fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant,
    textAlign: 'center', marginTop: space.lg, marginBottom: space.sm,
  },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, paddingHorizontal: space.md },
  otpBox: {
    width: 48, height: 60, borderRadius: radius.md, borderWidth: 1.5,
    borderColor: colors.outlineVariant, backgroundColor: colors.surface,
    textAlign: 'center', fontFamily: fontFamily.extraBold, fontSize: 28,
    color: colors.onSurface,
  },
  otpBoxFilled: { borderColor: colors.primaryContainer, backgroundColor: colors.onPrimaryContainer },
  otpBoxActive: { borderColor: colors.primaryContainer, borderWidth: 2 },
  autoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    marginHorizontal: space.md, marginTop: space.md, padding: space.sm,
    borderRadius: radius.lg, backgroundColor: colors.positiveContainer,
    borderWidth: 1, borderColor: 'rgba(4,120,87,0.2)',
  },
  autoIconBg: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(4,120,87,0.12)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  autoText: { flex: 1 },
  autoTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onPositiveContainer },
  autoSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  resendCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: space.md, marginTop: space.sm, padding: space.md,
    borderRadius: radius.lg, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.outlineVariant,
  },
  resendLeft: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  resendLabel: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  resendTimer: { fontFamily: fontFamily.extraBold, fontSize: 16, letterSpacing: 1 },
  resendTimerSec: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.outline },
  resendBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full,
    backgroundColor: colors.primaryContainer,
  },
  resendBtnDisabled: { backgroundColor: colors.surfaceContainerHigh },
  resendBtnText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onPrimary },
  altLabel: {
    fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurfaceVariant,
    letterSpacing: 0.8, textTransform: 'uppercase',
    marginHorizontal: space.md, marginTop: space.lg, marginBottom: space.xs,
  },
  altList: { paddingHorizontal: space.md, gap: 8 },
  altCard: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    padding: space.md, borderRadius: radius.lg, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.outlineVariant,
  },
  altIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  altInfo: { flex: 1 },
  altTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  altTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  instantBadge: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full,
    backgroundColor: colors.positiveContainer,
  },
  instantText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  altSub: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, marginTop: 1 },
  footerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center',
    marginTop: space.lg, paddingBottom: space.sm,
  },
  footerText: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  dock: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant,
  },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: touch.targetHero, backgroundColor: colors.primaryContainer,
    borderRadius: radius.lg, gap: space.sm,
    shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5,
  },
  ctaDisabled: { backgroundColor: colors.surfaceContainerHigh, shadowOpacity: 0, elevation: 0 },
  ctaText: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.onPrimary, letterSpacing: 0.3 },
});
