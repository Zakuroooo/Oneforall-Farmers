/**
 * S28_CounterOffer — Screen 28: Tactile negotiation bottom sheet / counter offer.
 * Matched to Stitch `28_make_counter_offer_tactile_negotiation_bottom_sheet/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';

const BUYER_BID = 1850;
const ASKING_PRICE = 2100;
const QTL = 40;
const HAMALI = 600;

export default function S28_CounterOffer({ navigation }: any) {
  const { t } = useT();
  const [counter, setCounter] = useState(1920);

  const dec = (by: number) => setCounter(p => Math.max(BUYER_BID, p - by));
  const inc = (by: number) => setCounter(p => Math.min(ASKING_PRICE, p + by));

  const gross = counter * QTL;
  const net = gross - HAMALI;

  // position on track between buyer bid and asking price
  const pct = ((counter - BUYER_BID) / (ASKING_PRICE - BUYER_BID)) * 100;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="rgba(0,0,0,0.4)" />

      {/* Dimmed overlay area (visual) */}
      <View style={styles.overlay} />

      {/* Bottom sheet */}
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Sheet header */}
        <View style={styles.sheetHeader}>
          <View style={styles.sheetHeaderLeft}>
            <View style={styles.handshakeIcon}>
              <Icon name="handshake" size={18} color={colors.primary} />
            </View>
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.sheetTitle}>काउन्टर ऑफर पाठवा</Text>
                <View style={styles.roundBadge}><Text style={styles.roundText}>Round 2/3</Text></View>
              </View>
              <Text style={styles.sheetMeta}>लॉट #LP-403 · 40 क्विंटल गावराण कांदा · Pune Trading Co</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.canGoBack() && navigation.goBack()} style={styles.listenBtn}>
            <Icon name="volume" size={13} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.canGoBack() && navigation.goBack()} style={styles.closeBtn}>
            <Icon name="x-circle" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Round progress */}
          <View style={styles.roundCard}>
            <View style={styles.roundProgressRow}>
              <View style={styles.liveGreen} />
              <Text style={styles.roundProgressText}>फेरी २ सुरु (१ काउन्टर शिल्लक)</Text>
              <Text style={styles.roundProgressSub}>अंतिम फेरी ३ नंतर सौदा निश्चित</Text>
            </View>
            <View style={styles.roundDots}>
              <View style={[styles.roundDot, styles.roundDotDone]} />
              <View style={[styles.roundDot, styles.roundDotActive]} />
              <View style={styles.roundDot} />
            </View>
          </View>

          {/* Bid comparison */}
          <View style={styles.bidCompareCard}>
            <View style={styles.bidCompareItem}>
              <View style={styles.bidCompareHeader}>
                <Text style={styles.bidCompareLabel}>व्यापाऱ्याची बोली (Pune)</Text>
                <Icon name="trending-down" size={14} color={colors.critical} />
              </View>
              <Text style={styles.bidComparePrice}>₹1,850<Text style={styles.bidCompareUnit}>/Qtl</Text></Text>
              <Text style={styles.bidCompareTotal}>एकूण: ₹74,000</Text>
            </View>
            <View style={styles.bidCompareDivider} />
            <View style={styles.bidCompareItem}>
              <View style={styles.bidCompareHeader}>
                <Text style={styles.bidCompareLabel}>तुमची पहिली मागणी</Text>
                <Icon name="check" size={14} color={colors.tertiary} />
              </View>
              <Text style={[styles.bidComparePrice, { color: colors.tertiary }]}>₹2,100<Text style={styles.bidCompareUnit}>/Qtl</Text></Text>
              <Text style={styles.bidCompareTotal}>एकूण: ₹84,000</Text>
            </View>
          </View>

          {/* AI suggestion */}
          <View style={styles.aiSuggestionCard}>
            <Icon name="zap" size={14} color={colors.primary} />
            <View style={styles.aiSuggestionContent}>
              <View style={styles.aiSuggestionRow}>
                <Text style={styles.aiSuggestionTitle}>शिफारस: ₹1,920 /क्विंटल</Text>
                <View style={styles.aiPctBadge}><Text style={styles.aiPctText}>82% खात्री</Text></View>
              </View>
              <Text style={styles.aiSuggestionDesc}>
                लासलगाव व पिंपळगाव आजचा सरासरी भाव पाहता या दरावर व्यापारी सौदा मान्य करण्याची शक्यता 82% आहे.
              </Text>
            </View>
          </View>

          {/* Counter price selector */}
          <View style={styles.counterCard}>
            <View style={styles.counterCardHeader}>
              <Text style={styles.counterCardLabel}>तुमचा नवीन काउन्टर दर (NEW ASK)</Text>
              <View style={styles.maxChangeBadge}><Text style={styles.maxChangeText}>कमाल बदल: ±₹100</Text></View>
            </View>

            <Text style={styles.counterPriceDisplay}>
              <Text style={styles.counterRupee}>₹ </Text>
              {counter.toLocaleString('en-IN')}
              <Text style={styles.counterUnit}> / क्विंटल</Text>
            </Text>

            {/* Track */}
            <View style={styles.trackBg}>
              <View style={[styles.trackFill, { width: `${pct}%` as any }]} />
              <View style={[styles.trackThumb, { left: `${pct}%` as any }]} />
            </View>
            <View style={styles.trackLabels}>
              <Text style={styles.trackLabelLeft}>खरेदीदार: ₹1,850</Text>
              <Text style={styles.trackLabelMid}>काउन्टर: ₹{counter.toLocaleString('en-IN')}</Text>
              <Text style={styles.trackLabelRight}>मागणी: ₹2,100</Text>
            </View>

            {/* Stepper buttons */}
            <View style={styles.stepperRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => dec(50)}>
                <Text style={styles.stepBtnTop}>– ५०</Text>
                <Text style={styles.stepBtnSub}>–₹50</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.stepBtn} onPress={() => dec(10)}>
                <Text style={styles.stepBtnTop}>– १०</Text>
                <Text style={styles.stepBtnSub}>–₹10</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.stepBtn, styles.stepBtnPos]} onPress={() => inc(10)}>
                <Text style={[styles.stepBtnTop, { color: colors.tertiary }]}>+ १०</Text>
                <Text style={styles.stepBtnSub}>+₹10</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.stepBtn, styles.stepBtnPos]} onPress={() => inc(50)}>
                <Text style={[styles.stepBtnTop, { color: colors.tertiary }]}>+ ५०</Text>
                <Text style={styles.stepBtnSub}>+₹50</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Net payout preview */}
          <View style={styles.payoutCard}>
            <View style={styles.payoutHeader}>
              <Icon name="building" size={14} color={colors.primary} />
              <Text style={styles.payoutTitle}>थेट बँक जमा हिशोब (Net Payout)</Text>
              <View style={styles.rtgsBadge}>
                <Icon name="zap" size={10} color={colors.tertiary} />
                <Text style={styles.rtgsBadgeText}>झटपट RTGS</Text>
              </View>
            </View>

            <View style={styles.payoutRow}>
              <Text style={styles.payoutKey}>एकूण माल किंमत ({QTL} क्विंटल × ₹{counter.toLocaleString('en-IN')})</Text>
              <Text style={styles.payoutVal}>₹{gross.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.payoutRow}>
              <View style={styles.payoutKeyRow}>
                <Text style={styles.payoutKey}>हमाली व तोलाई (Hamali / Loading)</Text>
                <Icon name="info" size={12} color={colors.outline} />
              </View>
              <Text style={[styles.payoutVal, { color: colors.critical }]}>–₹{HAMALI.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.netBox}>
              <Text style={styles.netBoxLabel}>निवळ जमा रक्कम (Net):</Text>
              <Text style={styles.netBoxAmt}>₹{net.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </ScrollView>

        {/* CTA dock */}
        <View style={styles.dock}>
          <TouchableOpacity
            style={styles.sendCounterBtn}
            onPress={() => navigation.canGoBack() && navigation.goBack()}>
            <Icon name="arrow-right" size={16} color={colors.onPrimary} />
            <Text style={styles.sendCounterBtnText}>काउन्टर ऑफर पाठवा · Send ₹{counter.toLocaleString('en-IN')} Counter</Text>
            <Icon name="arrow-right" size={16} color={colors.onPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelLink}
            onPress={() => navigation.canGoBack() && navigation.goBack()}>
            <Icon name="arrow-left" size={14} color={colors.onSurfaceVariant} />
            <Text style={styles.cancelLinkText}>रद्द करा व परत जा</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  overlay: { flex: 1 },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant, alignSelf: 'center', marginBottom: 12 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.md, paddingBottom: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  sheetHeaderLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  handshakeIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(155,47,0,0.08)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sheetTitle: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.onSurface },
  roundBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.surfaceContainerHigh },
  roundText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurface },
  sheetMeta: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  listenBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(155,47,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 16 },
  roundCard: { marginHorizontal: space.md, marginTop: space.sm, marginBottom: space.xs, padding: space.sm, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  roundProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: space.xs },
  liveGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.critical },
  roundProgressText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.critical, flex: 1 },
  roundProgressSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  roundDots: { flexDirection: 'row', gap: 6 },
  roundDot: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.outlineVariant },
  roundDotDone: { backgroundColor: colors.critical },
  roundDotActive: { backgroundColor: colors.critical },
  bidCompareCard: { flexDirection: 'row', marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' },
  bidCompareItem: { flex: 1, padding: space.sm },
  bidCompareHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  bidCompareLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  bidComparePrice: { fontFamily: fontFamily.extraBold, fontSize: 22, color: colors.onSurface, letterSpacing: -0.5 },
  bidCompareUnit: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.onSurfaceVariant },
  bidCompareTotal: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  bidCompareDivider: { width: 1, backgroundColor: colors.outlineVariant },
  aiSuggestionCard: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, marginHorizontal: space.md, marginBottom: space.sm, padding: space.sm, borderRadius: radius.xl, backgroundColor: colors.positiveContainer, borderWidth: 1, borderColor: 'rgba(4,120,87,0.2)' },
  aiSuggestionContent: { flex: 1 },
  aiSuggestionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  aiSuggestionTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.tertiary, flex: 1 },
  aiPctBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.tertiary },
  aiPctText: { fontFamily: fontFamily.bold, fontSize: 10, color: '#fff' },
  aiSuggestionDesc: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onPositiveContainer, lineHeight: 17 },
  counterCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primaryContainer, padding: space.md },
  counterCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.sm },
  counterCardLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurfaceVariant },
  maxChangeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.onPrimaryContainer },
  maxChangeText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primaryContainer },
  counterPriceDisplay: { fontFamily: fontFamily.extraBold, fontSize: 36, color: colors.primary, letterSpacing: -1, textAlign: 'center', marginBottom: space.sm },
  counterRupee: { fontSize: 24 },
  counterUnit: { fontFamily: fontFamily.medium, fontSize: 16, color: colors.onSurfaceVariant },
  trackBg: { height: 8, backgroundColor: colors.outlineVariant, borderRadius: radius.full, marginBottom: 4, position: 'relative', overflow: 'visible' },
  trackFill: { height: 8, backgroundColor: colors.primary, borderRadius: radius.full },
  trackThumb: { position: 'absolute', top: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.surface, marginLeft: -10, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  trackLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.md },
  trackLabelLeft: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  trackLabelMid: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.primary },
  trackLabelRight: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  stepperRow: { flexDirection: 'row', gap: space.sm },
  stepBtn: { flex: 1, alignItems: 'center', paddingVertical: space.sm, borderRadius: radius.lg, backgroundColor: colors.surfaceContainerHigh, borderWidth: 1, borderColor: colors.outlineVariant },
  stepBtnPos: { backgroundColor: colors.positiveContainer, borderColor: 'rgba(4,120,87,0.2)' },
  stepBtnTop: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.critical },
  stepBtnSub: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  payoutCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md },
  payoutHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: space.sm },
  payoutTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.primary, flex: 1 },
  rtgsBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  rtgsBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  payoutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  payoutKeyRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  payoutKey: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurface, flex: 1 },
  payoutVal: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  netBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.sm, padding: space.sm, borderRadius: radius.lg, backgroundColor: colors.positiveContainer },
  netBoxLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.tertiary },
  netBoxAmt: { fontFamily: fontFamily.extraBold, fontSize: 22, color: colors.tertiary },
  dock: { paddingHorizontal: space.md, paddingBottom: space.xl + 8, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: colors.outlineVariant, gap: 8 },
  sendCounterBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: touch.targetHero, backgroundColor: colors.primaryContainer, borderRadius: radius.lg, shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5 },
  sendCounterBtnText: { fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.onPrimary, flex: 1, textAlign: 'center' },
  cancelLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  cancelLinkText: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.onSurfaceVariant },
});
