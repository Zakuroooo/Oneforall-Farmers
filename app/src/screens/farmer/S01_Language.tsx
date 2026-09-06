import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAuth } from '../../lib/auth';
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
  const { signIn } = useAuth();
  const [selected, setSelected] = useState<Locale>('mr');
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    setSaving(true);
    await setLocale(selected);
    navigation.replace('S2_Phone');
  };

  const handleQuickFarmerDemo = async () => {
    await setLocale(selected);
    await signIn({
      token: 'demo-farmer-token',
      user: {
        id: 'f1',
        phone: '9876543210',
        name: 'रामभाऊ पाटील',
        role: 'FARMER',
        locale: selected,
        district_id: 'd_nashik',
      },
    });
  };

  const handleQuickBuyerDemo = async () => {
    await setLocale(selected);
    await signIn({
      token: 'demo-buyer-token',
      user: {
        id: 'b1',
        phone: '9876543210',
        name: 'पुणे ट्रेडिंग कंपनी',
        role: 'BUYER',
        locale: selected,
        district_id: 'd_pune',
      },
    });
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>भाषा निवडा (Select Language)</Text>

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
        <Text style={styles.confirmLabel}>{saving ? '...' : 'पुढे (Next)'}</Text>
      </TouchableOpacity>

      {/* Quick Demo Shortcuts */}
      <View style={styles.demoBox}>
        <Text style={styles.demoTitle}>डेमो सत्रासाठी थेट जा (Direct Demo Access):</Text>
        <TouchableOpacity onPress={handleQuickFarmerDemo} style={styles.demoFarmerBtn}>
          <Text style={styles.demoFarmerText}>🌾 शेतकरी ॲप & 🔊 आवाज (Farmer & Voice Demo)</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleQuickBuyerDemo} style={styles.demoBuyerBtn}>
          <Text style={styles.demoBuyerText}>💼 व्यापारी कंसोल (Buyer Console)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const GREEN = '#1B5E20';

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F8FAF9' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 28, color: '#1E293B' },
  options: { gap: 14 },
  option: {
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  optionSelected: { borderColor: GREEN, backgroundColor: '#E8F5E9' },
  optionLabel: { fontSize: 22, color: '#334155' },
  optionLabelSelected: { color: GREEN, fontWeight: '700' },
  confirm: {
    marginTop: 24,
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmDisabled: { opacity: 0.6 },
  confirmLabel: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  demoBox: { marginTop: 32, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'center' },
  demoTitle: { fontSize: 13, color: '#64748B', fontWeight: '600', marginBottom: 12 },
  demoFarmerBtn: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoFarmerText: { color: '#1B5E20', fontWeight: '700', fontSize: 14 },
  demoBuyerBtn: {
    backgroundColor: '#E3F2FD',
    borderColor: '#90CAF9',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  demoBuyerText: { color: '#1565C0', fontWeight: '700', fontSize: 14 },
});
