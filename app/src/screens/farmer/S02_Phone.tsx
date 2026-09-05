/**
 * S2 — phone number, then the OTP. One screen, two steps.
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ApiError, requestOtp, verifyOtp } from '../../lib/api';
import { setPendingAuth, useAuth } from '../../lib/auth';
import { getLocale } from '../../lib/locale';
import { formatNumber } from '../../lib/money';
import { USE_FIXTURES } from '../../config';
import { fxOtpRequest } from '../../fixtures/auth';
import type { AuthStackParamList } from '../../navigation/AuthStack';
import type { Locale } from '../../types/api';

type Props = NativeStackScreenProps<AuthStackParamList, 'S2_Phone'>;

type Step = 'phone' | 'otp';

async function fixtureVerifyOtp(): Promise<never> {
  throw new ApiError('UNAUTHENTICATED', 'Invalid code', 401);
}

export default function S02_Phone({ navigation }: Props) {
  const { signIn } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('9876543210');
  const [code, setCode] = useState('');
  const [locale, setLocaleState] = useState<Locale>('mr');
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remainingS, setRemainingS] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    getLocale().then(l => l && setLocaleState(l));
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (expiresAt === null) return undefined;
    const tick = () => setRemainingS(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const submitPhone = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = USE_FIXTURES ? fxOtpRequest : await requestOtp(phone);
      if (!mounted.current) return;
      setExpiresAt(Date.now() + res.expires_in_s * 1000);
      if (res.dev_otp) setCode(res.dev_otp);
      setStep('otp');
    } catch (err) {
      if (!mounted.current) return;
      setError(err instanceof ApiError ? err.message : 'नेटवर्क समस्या. पुन्हा प्रयत्न करा.');
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  const submitCode = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = USE_FIXTURES ? await fixtureVerifyOtp() : await verifyOtp(phone, code);
      if (!mounted.current) return;
      await signIn(res);
    } catch (err) {
      if (!mounted.current) return;
      if (err instanceof ApiError && err.code !== 'NETWORK') {
        setPendingAuth(phone, code);
        navigation.navigate('S3_Profile');
        return;
      }
      setError('सर्व्हरशी संपर्क होऊ शकला नाही. पुन्हा प्रयत्न करा.');
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  const goToBuyerLogin = () => {
    navigation.navigate('S17_BuyerLogin');
  };

  const resend = () => {
    setCode('');
    setExpiresAt(null);
    void submitPhone();
  };

  if (step === 'phone') {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>मोबाइल नंबर टाका</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))}
          keyboardType="number-pad"
          maxLength={10}
          placeholder="9876543210"
          accessibilityLabel="मोबाइल नंबर"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity
          onPress={submitPhone}
          disabled={phone.length !== 10 || loading}
          style={[styles.button, (phone.length !== 10 || loading) && styles.buttonDisabled]}>
          <Text style={styles.buttonLabel}>{loading ? '...' : 'OTP पाठवा'}</Text>
        </TouchableOpacity>

        {/* Buyer Option on Phone Screen - Routes to Buyer OTP Login */}
        <TouchableOpacity onPress={goToBuyerLogin} style={styles.buyerOptionBtn}>
          <Text style={styles.buyerOptionText}>💼 व्यापारी आहात? येथे साइन इन करा (Buyer Login)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>OTP टाका</Text>
      <Text style={styles.subtitle}>{phone} वर पाठवला आहे</Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={t => setCode(t.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="123456"
        accessibilityLabel="OTP"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        onPress={submitCode}
        disabled={code.length !== 6 || loading}
        style={[styles.button, (code.length !== 6 || loading) && styles.buttonDisabled]}>
        <Text style={styles.buttonLabel}>{loading ? '...' : 'पडताळणी करा'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={goToBuyerLogin} style={styles.buyerOptionBtn}>
        <Text style={styles.buyerOptionText}>💼 व्यापारी साइन इन (Buyer OTP Login)</Text>
      </TouchableOpacity>

      {remainingS > 0 ? (
        <Text style={styles.timer}>{formatNumber(remainingS, locale)} सेकंदात पुन्हा पाठवा</Text>
      ) : (
        <TouchableOpacity onPress={resend} disabled={loading}>
          <Text style={styles.resend}>पुन्हा OTP पाठवा</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const GREEN = '#1B5E20';

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F8FAF9' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8, color: '#1E293B' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
  input: {
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    letterSpacing: 2,
  },
  error: { color: '#C62828', fontSize: 14, marginBottom: 12 },
  button: { backgroundColor: GREEN, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonLabel: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  buyerOptionBtn: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#E3F2FD',
    borderColor: '#90CAF9',
    borderWidth: 1,
    alignItems: 'center',
  },
  buyerOptionText: { color: '#1565C0', fontWeight: '700', fontSize: 14 },
  timer: { textAlign: 'center', color: '#666', marginTop: 16, fontSize: 15 },
  resend: { textAlign: 'center', color: GREEN, marginTop: 16, fontSize: 15, fontWeight: '600' },
});
