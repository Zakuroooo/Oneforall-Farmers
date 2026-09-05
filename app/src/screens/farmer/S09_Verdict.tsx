import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { fxHold } from '../../fixtures/window';
import { devNum, useT } from '../../lib/i18n';
import { formatPaise } from '../../lib/money';
import { speakVerdict } from '../../lib/voice';
import type { WindowRes } from '../../types/api';

export interface S09_VerdictProps {
  data?: WindowRes;
  onViewCosts?: () => void;
}

export function S09_Verdict({ data = fxHold, onViewCosts }: S09_VerdictProps) {
  const { t, locale } = useT();
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = async () => {
    setSpeaking(true);
    try {
      await speakVerdict(data, t);
    } catch (err) {
      console.error('[VOICE ERROR]:', err);
    } finally {
      setSpeaking(false);
    }
  };

  const isNoAdvice = data.action === 'NO_ADVICE';

  if (isNoAdvice) {
    return (
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>कांदा · लासलगाव · ४० क्विंटल</Text>
          <TouchableOpacity onPress={handleSpeak} style={styles.speakerBtn} activeOpacity={0.7}>
            <Text style={styles.speakerIcon}>{speaking ? '🔊...' : '🔊'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.noAdviceContainer}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.noAdviceTitle}>आम्ही सल्ला देत नाही</Text>
          <Text style={styles.noAdviceSub}>
            {data.explain_mr || 'पुढील १४ दिवसांचा अंदाज खूप अनिश्चित आहे.'}
          </Text>
        </View>
      </Card>
    );
  }

  const holdDays = data.hold_days ? devNum(data.hold_days, locale) : '११';
  const expectedGain = data.expected_gain_paise
    ? formatPaise(data.expected_gain_paise, locale)
    : '₹६,२९०';
  const worstCase = data.worst_case_paise
    ? formatPaise(data.worst_case_paise, locale)
    : '−₹४,८००';

  return (
    <Card style={styles.card}>
      {/* Top Header with 🔊 Voice Button */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>कांदा · लासलगाव · ४० क्विंटल</Text>
        <TouchableOpacity
          onPress={handleSpeak}
          style={[styles.speakerBtn, speaking && styles.speakerBtnActive]}
          activeOpacity={0.7}
          accessibilityLabel="ऐका (Speak)">
          <Text style={styles.speakerIcon}>{speaking ? '🔊...' : '🔊 ऐका'}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Verdict Headline */}
      <View style={styles.verdictBox}>
        <Text style={styles.verdictHeadline}>{holdDays} दिवस थांबा</Text>
        <Badge label="शिफारस: HOLD" type="SUCCESS" />
      </View>

      {/* I16 Constraint: Expected Gain & Worst Case at EQUAL 20px Font Size */}
      <View style={styles.outcomesRow}>
        <View style={[styles.outcomeBox, styles.expectedBox]}>
          <Text style={styles.outcomeLabel}>अपेक्षित फायदा</Text>
          <Text style={styles.equalFontSizeValue}>{expectedGain}</Text>
        </View>

        <View style={[styles.outcomeBox, styles.worstBox]}>
          <Text style={styles.outcomeLabel}>सर्वात वाईट स्थिती</Text>
          <Text style={[styles.equalFontSizeValue, styles.worstValue]}>{worstCase}</Text>
        </View>
      </View>

      {/* Confidence */}
      <View style={styles.confidenceRow}>
        <Text style={styles.confidenceLabel}>विश्वास:</Text>
        <Text style={styles.dots}>●●●○</Text>
        <Text style={styles.confidenceValue}>मध्यम (Medium)</Text>
      </View>

      {/* Costs Teaser */}
      {onViewCosts ? (
        <TouchableOpacity onPress={onViewCosts} style={styles.costsRow}>
          <Text style={styles.costsText}>▸ खर्च वजा केल्यावर (₹४,२५०)</Text>
        </TouchableOpacity>
      ) : null}

      {/* Pledge Card (Shown only when worthwhile - I13) */}
      {data.pledge_quote ? (
        <View style={styles.pledgeCard}>
          <Text style={styles.pledgeTitle}>💰 थांबण्यासाठी पैसे हवेत?</Text>
          <Text style={styles.pledgeDetails}>
            रक्कम: ₹८४,००० · व्याज: ₹२,७६० (११ दिवस)
          </Text>
          <Text style={styles.pledgeNote}>"सूचक अंदाज — थेट बँक कर्ज उपलब्धता"</Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, backgroundColor: '#FFFFFF', borderRadius: 16 },
  headerRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  speakerBtn: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  speakerBtnActive: { backgroundColor: '#C8E6C9' },
  speakerIcon: { fontSize: 15, fontWeight: '700', color: '#1B5E20' },
  verdictBox: { alignItems: 'center', marginVertical: 12 },
  verdictHeadline: { fontSize: 32, fontWeight: '900', color: '#1B5E20', marginBottom: 8 },
  outcomesRow: { flexDirection: 'row', gap: 12, marginVertical: 16 },
  outcomeBox: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  expectedBox: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0' },
  worstBox: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  outcomeLabel: { fontSize: 13, color: '#64748B', fontWeight: '600', marginBottom: 4 },

  // ★ INVARIANT I16: BOTH expected gain AND worst case MUST be at EQUAL 20px font size
  equalFontSizeValue: { fontSize: 20, fontWeight: '800', color: '#166534' },
  worstValue: { color: '#991B1B' },

  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'center',
    gap: 8,
    marginVertical: 8,
  },
  confidenceLabel: { fontSize: 14, color: '#64748B' },
  dots: { fontSize: 16, color: '#1B5E20', letterSpacing: 2 },
  confidenceValue: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  costsRow: { marginTop: 12, paddingVertical: 8 },
  costsText: { fontSize: 14, color: '#1565C0', fontWeight: '600' },
  pledgeCard: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pledgeTitle: { fontSize: 15, fontWeight: '700', color: '#92400E' },
  pledgeDetails: { fontSize: 14, color: '#B45309', fontWeight: '600', marginTop: 4 },
  pledgeNote: { fontSize: 12, color: '#D97706', fontStyle: 'italic', marginTop: 4 },
  noAdviceContainer: { alignItems: 'center', paddingVertical: 24 },
  warningIcon: { fontSize: 40, marginBottom: 12 },
  noAdviceTitle: { fontSize: 24, fontWeight: '800', color: '#991B1B', marginBottom: 8 },
  noAdviceSub: { fontSize: 15, color: '#475569', textAlign: 'center', lineHeight: 22 },
});
