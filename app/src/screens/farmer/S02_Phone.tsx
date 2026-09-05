/**
 * S2 — phone number, then the OTP. One screen, two steps.
 *
 * ★ The ambiguous-failure resolution (file a blocker, don't guess silently):
 *
 *   CANON §7.1 says `/auth/otp/verify` returns the *identical* error for a wrong
 *   code and for an unknown phone — deliberately, so the endpoint cannot be used
 *   to enumerate which phones are registered. That means this screen can never
 *   know in advance which case a failure is. The resolution: always try `verify`
 *   first; on any real failure *from the server* (not a network failure — see
 *   below), fall through to S3 and let `/auth/register` — which independently
 *   re-validates `{phone, code}` — be the final judge. A genuinely wrong code
 *   fails there too, with a real, unambiguous error that sends the farmer back
 *   here. This is what CANON's own "Post-OTP for new users" phrasing describes;
 *   filed as a blocker to Akash to confirm when A1 lands.
 *
 *   A server-returned failure and a network failure are handled differently on
 *   purpose. `ApiError.code === 'NETWORK'` means the server never answered at all
 *   (down, unreachable, no connectivity) — that is a real error with a retry, not
 *   a signal to guess "maybe this is a new user." Only a real response from the
 *   server routes to S3.
 *
 * ★ I14 everywhere in this file. Nothing here logs the phone, the code, or the
 *   response body. The `dev_otp` CANON allows in non-production is read and used
 *   to prefill the code field — never printed anywhere a build could ship with.
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

/**
 * ★ CANON §7.1's own words: "wrong code and unknown phone return the identical
 *   error." There is no fixture endpoint to call, so this simulates that fact
 *   directly — verify always fails in fixture mode, sending every fixture run
 *   through S3 -> register, the path CANON calls the primary one. See
 *   `fixtures/auth.ts`'s file-level comment for the full reasoning.
 */
async function fixtureVerifyOtp(): Promise<never> {
  throw new ApiError('UNAUTHENTICATED', 'Invalid code', 401);
}

export default function S02_Phone({ navigation }: Props) {
  const { signIn } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
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
      // Dev convenience only — never rendered in a release build's own logic path,
      // just prefilled so the person testing doesn't have to read a server log.
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
      // RootNavigator swaps to FarmerTabs on its own once `signIn` resolves.
    } catch (err) {
      if (!mounted.current) return;
      if (err instanceof ApiError && err.code !== 'NETWORK') {
        // Server answered and rejected it. Per the file-level note: could be a
        // wrong code, could be an unknown phone — CANON does not let us tell.
        // S3 (register) is the tiebreaker.
        setPendingAuth(phone, code);
        navigation.navigate('S3_Profile');
        return;
      }
      // The server never answered at all — a real error, not an ambiguous one.
      setError('सर्व्हरशी संपर्क होऊ शकला नाही. पुन्हा प्रयत्न करा.');
    } finally {
      if (mounted.current) setLoading(false);
    }
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
  root: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
  input: {
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    marginBottom: 16,
    letterSpacing: 2,
  },
  error: { color: '#C62828', fontSize: 14, marginBottom: 12 },
  button: { backgroundColor: GREEN, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonLabel: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  timer: { textAlign: 'center', color: '#666', marginTop: 16, fontSize: 15 },
  resend: { textAlign: 'center', color: GREEN, marginTop: 16, fontSize: 15, fontWeight: '600' },
});
