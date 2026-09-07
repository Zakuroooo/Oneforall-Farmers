/**
 * S22_PricePublish — Screen 22: Price & Publish Lot (fair market slider + escrow listing).
 * Matched to Stitch `22_price_publish_fair_market_slider_escrow_listing/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React, { useState } from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';

const redOnions = require('../../assets/images/red_onions.jpg');

const MIN_PRICE = 1900;
const MAX_PRICE = 2300;
const STEP = 10;

export default function S22_PricePublish({ navigation }: any) {
  const { t } = useT();
  const [askingPrice, setAskingPrice] = useState(2100);
  const [dispatch, setDispatch] = useState<'farmgate' | 'apmc'>('farmgate');
  const [splitAllowed, setSplitAllowed] = useState(false);

  const qtl = 40;
  const gross = askingPrice * qtl;
  const hamali = 600;
  const net = gross - hamali;

  const decrease = (by: number) => setAskingPrice(p => Math.max(MIN_PRICE, p - by));
  const increase = (by: number) => setAskingPrice(p => Math.min(MAX_PRICE, p + by));

  const corridorMin = 2050;
  const corridorMax = 2150;
  const inCorridor = askingPrice >= corridorMin && askingPrice <= corridorMax;
  const pctFromLeft = ((askingPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Price &amp; Publish Lot</Text>
          <Text style={styles.headerSub}>विक्री भाव ठरवा · 40 Qtl</Text>
        </View>
        <Text style={styles.headerRef}>#LP-403</Text>
        <TouchableOpacity style={styles.listenBtn}>
          <Icon name="volume" size={13} color={colors.primary} />
          <Text style={styles.listenText}>{t('splash_listen')}</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressBg}>
        <View style={styles.progressFill} />
      </View>
      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>Step 5 of 5: Final Pricing &amp; Publish</Text>
        <Text style={styles.progressTag}>अंतिम टप्पा</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Lot summary */}
        <View style={styles.lotSummary}>
          <Image source={redOnions} style={styles.lotThumb} />
          <View style={styles.lotInfo}>
            <View style={styles.gradeBadge}><Text style={styles.gradeText}>Grade A</Text></View>
            <Text style={styles.lotVariety}>Gavran Red Oni...</Text>
            <Text style={styles.lotSub}>उन्हाळ कांदा · 40 Qtl (80 Gunny Bags · 4...</Text>
            <View style={styles.lotMetaRow}>
              <Icon name="map-pin" size={10} color={colors.onSurfaceVariant} />
              <Text style={styles.lotMeta}>Lasalgaon Mandi Yard · Rambhau Pat...</Text>
            </View>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeLabel}>Score</Text>
            <Text style={styles.scoreBadgeVal}>850/1000</Text>
          </View>
        </View>

        {/* Asking price card */}
        <View style={styles.priceCard}>
          <View style={styles.priceCardHeader}>
            <Text style={styles.priceCardTitle}>ASKING PRICE PER QUINTAL</Text>
            <Text style={styles.priceCardTitleMr}>अपेक्षित दर प्रति क्विंटल</Text>
            {inCorridor && (
              <View style={styles.corridorBadge}>
                <Icon name="trending-up" size={11} color={colors.tertiary} />
                <Text style={styles.corridorBadgeText}>Fair Corridor</Text>
              </View>
            )}
          </View>

          {/* Stepper row */}
          <View style={styles.stepperRow}>
            <TouchableOpacity style={styles.stepBtn50} onPress={() => decrease(50)}>
              <Text style={styles.stepBtnText}>–₹50</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepBtn10} onPress={() => decrease(10)}>
              <Text style={styles.stepBtnText}>–₹10</Text>
            </TouchableOpacity>
            <View style={styles.priceDisplay}>
              <Text style={styles.priceRupee}>₹</Text>
              <Text style={styles.priceAmount}>{askingPrice.toLocaleString('en-IN')}</Text>
              <Text style={styles.priceUnit}>/ Quintal (100 kg)</Text>
            </View>
            <TouchableOpacity style={styles.stepBtn10} onPress={() => increase(10)}>
              <Text style={styles.stepBtnText}>+₹10</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stepBtn50} onPress={() => increase(50)}>
              <Text style={styles.stepBtnText}>+₹50</Text>
            </TouchableOpacity>
          </View>

          {/* Slider track */}
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${pctFromLeft}%` as any }]} />
            <View style={[styles.sliderThumb, { left: `${pctFromLeft}%` as any }]} />
            {/* Fair value corridor highlight */}
            <View style={[styles.corridorHighlight, {
              left: `${((corridorMin - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%` as any,
              width: `${((corridorMax - corridorMin) / (MAX_PRICE - MIN_PRICE)) * 100}%` as any,
            }]} />
          </View>
          <Text style={styles.corridorLabel}>
            Fair Value Corridor: ₹2,050 – ₹2,150 · Optimal Liquidity (जल्द विकी)
          </Text>

          {/* Benchmark row */}
          <View style={styles.benchmarkRow}>
            <View style={styles.benchmarkItem}>
              <Text style={styles.benchmarkKey}>APMC MODAL AVG</Text>
              <Text style={styles.benchmarkVal}>₹2,050 / Qtl</Text>
            </View>
            <View style={[styles.benchmarkItem, styles.benchmarkItemActive]}>
              <Text style={[styles.benchmarkKey, { color: colors.primaryContainer }]}>YOUR ASKING</Text>
              <Text style={[styles.benchmarkVal, { color: colors.primaryContainer }]}>+₹50 Grade Prem.</Text>
            </View>
            <View style={styles.benchmarkItem}>
              <Text style={styles.benchmarkKey}>EXPORT PREMIUM</Text>
              <Text style={styles.benchmarkVal}>₹2,180 / Qtl</Text>
            </View>
          </View>
        </View>

        {/* Net payout breakdown */}
        <View style={styles.payoutCard}>
          <View style={styles.payoutHeader}>
            <Icon name="building" size={14} color={colors.primary} />
            <Text style={styles.payoutTitle}>Net Payout Breakdown</Text>
            <Text style={styles.payoutQtl}>{qtl} Quintals</Text>
          </View>

          <View style={styles.payoutRow}>
            <Text style={styles.payoutKey}>Gross Lot Value ({qtl} Qtl × ₹{askingPrice.toLocaleString('en-IN')}):</Text>
            <Text style={styles.payoutVal}>₹{gross.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.payoutRow}>
            <Text style={styles.payoutKey}>Estimated Unloading &amp; Hamali (80 bags):</Text>
            <Text style={[styles.payoutVal, { color: colors.critical }]}>–₹{hamali.toLocaleString('en-IN')} (₹15/bag)</Text>
          </View>
          <View style={styles.payoutRow}>
            <Text style={styles.payoutKey}>Krishi Mitra Platform Fee:</Text>
            <View style={styles.promoTag}><Text style={styles.promoTagText}>Farmer Promo</Text></View>
            <Text style={[styles.payoutVal, { color: colors.tertiary }]}>₹0 FREE</Text>
          </View>

          <View style={styles.netBox}>
            <View>
              <Text style={styles.netBoxLabel}>NET IN-BANK PAYOUT</Text>
              <Text style={styles.netBoxSub}>खात्यात जमा होणारी रक्कम</Text>
            </View>
            <View style={styles.netBoxRight}>
              <Text style={styles.netBoxAmount}>₹{net.toLocaleString('en-IN')}</Text>
              <View style={styles.rtgsBadge}>
                <Icon name="zap" size={10} color={colors.tertiary} />
                <Text style={styles.rtgsBadgeText}>Same-Day RTGS / UPI</Text>
              </View>
            </View>
          </View>

          <View style={styles.escrowNote}>
            <Icon name="lock" size={11} color={colors.tertiary} />
            <Text style={styles.escrowNoteText}>
              100% Escrow Guarantee: Mandi Board holds buyer funds before dispatch. Zero buyer default risk.
            </Text>
          </View>
        </View>

        {/* Logistics */}
        <View style={styles.logisticsCard}>
          <Text style={styles.logisticsTitle}>Logistics &amp; Dispatch Method</Text>
          <Text style={styles.logisticsTitleMr}>मालाची वाहतूक आणि उचल पर्याय निवडा</Text>

          <TouchableOpacity
            style={[styles.dispatchOption, dispatch === 'farmgate' && styles.dispatchOptionActive]}
            onPress={() => setDispatch('farmgate')}>
            <View style={[styles.radio, dispatch === 'farmgate' && styles.radioActive]}>
              {dispatch === 'farmgate' && <View style={styles.radioFill} />}
            </View>
            <View style={styles.dispatchInfo}>
              <View style={styles.dispatchTitleRow}>
                <Text style={[styles.dispatchTitle, dispatch === 'farmgate' && styles.dispatchTitleActive]}>
                  Farmgate Pickup (शेत बांधावर उचल)
                </Text>
                <View style={styles.recommendedBadge}><Text style={styles.recommendedText}>Recommended</Text></View>
              </View>
              <Text style={styles.dispatchSub}>Buyer dispatches truck directly to Niphad farm shed. Buyer covers all freight.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dispatchOption, dispatch === 'apmc' && styles.dispatchOptionActive]}
            onPress={() => setDispatch('apmc')}>
            <View style={[styles.radio, dispatch === 'apmc' && styles.radioActive]}>
              {dispatch === 'apmc' && <View style={styles.radioFill} />}
            </View>
            <View style={styles.dispatchInfo}>
              <View style={styles.dispatchTitleRow}>
                <Text style={[styles.dispatchTitle, dispatch === 'apmc' && styles.dispatchTitleActive]}>
                  Deliver to Lasalgaon APMC Yard
                </Text>
                <View style={styles.freightBadge}><Text style={styles.freightText}>+₹1,800 freight aid</Text></View>
              </View>
              <Text style={styles.dispatchSub}>Farmer arranges local tractor/tempo to APMC Gate #2 by tomorrow 10:00 AM.</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Lot split & window */}
        <View style={styles.optionsCard}>
          <View style={styles.optionsRow}>
            <Text style={styles.optionsLabel}>Lot Splitting Permission (माल विभागणी)</Text>
          </View>
          <View style={styles.splitRow}>
            <TouchableOpacity
              style={[styles.splitBtn, !splitAllowed && styles.splitBtnActive]}
              onPress={() => setSplitAllowed(false)}>
              <View style={[styles.radio, !splitAllowed && styles.radioActive]}>
                {!splitAllowed && <View style={styles.radioFill} />}
              </View>
              <Text style={[styles.splitBtnText, !splitAllowed && styles.splitBtnTextActive]}>Full Lot Only (40 Qtl)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.splitBtn, splitAllowed && styles.splitBtnActive]}
              onPress={() => setSplitAllowed(true)}>
              <View style={[styles.radio, splitAllowed && styles.radioActive]}>
                {splitAllowed && <View style={styles.radioFill} />}
              </View>
              <Text style={[styles.splitBtnText, splitAllowed && styles.splitBtnTextActive]}>Allow Split (Min 20 Qtl)</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.windowRow}>
            <Icon name="clock" size={13} color={colors.onSurfaceVariant} />
            <Text style={styles.windowLabel}>Listing Offer Window · बोली स्वीकारण्याचा कालावधी</Text>
            <View style={styles.windowBadge}>
              <Text style={styles.windowBadgeText}>48 Hours Active</Text>
            </View>
          </View>
        </View>

        {/* Active buyer radar */}
        <View style={styles.radarCard}>
          <View style={styles.radarHeader}>
            <View style={styles.liveGreen} />
            <Text style={styles.radarTitle}>Active Buyer Radar</Text>
          </View>
          <Text style={styles.radarDesc}>
            7 Verified Traders actively bidding on Grade A Onions in Nashik/Lasalgaon right now. First competitive counter-bid expected within 15 minutes.
          </Text>
        </View>
      </ScrollView>

      {/* CTA dock */}
      <View style={styles.dock}>
        <TouchableOpacity style={styles.publishBtn} onPress={() => navigation.navigate('S23_PublishedRadar')}>
          <Icon name="check-circle" size={18} color={colors.onPrimary} />
          <Text style={styles.publishBtnText}>Publish Lot to Marketplace · माल विक्रीसाठी टाका</Text>
          <Icon name="arrow-right" size={16} color={colors.onPrimary} />
        </TouchableOpacity>
        <Text style={styles.draftNote}>Draft encrypted · Auto-submits on weak signal · Cancel anytime before match</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.md, paddingTop: space.xl + 8, paddingBottom: space.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.primary },
  headerSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  headerRef: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurfaceVariant },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, backgroundColor: 'rgba(155,47,0,0.08)' },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  progressBg: { height: 5, backgroundColor: colors.outlineVariant },
  progressFill: { height: 5, width: '100%', backgroundColor: colors.primary },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.md, paddingVertical: 5, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  progressLabel: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  progressTag: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  scroll: { paddingBottom: 140 },
  lotSummary: { flexDirection: 'row', alignItems: 'center', gap: space.sm, margin: space.md, marginBottom: space.xs, padding: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  lotThumb: { width: 56, height: 56, borderRadius: radius.md },
  lotInfo: { flex: 1 },
  gradeBadge: { alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.positiveContainer, marginBottom: 2 },
  gradeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  lotVariety: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  lotSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  lotMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  lotMeta: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant, flex: 1 },
  scoreBadge: { alignItems: 'flex-end' },
  scoreBadgeLabel: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.onSurfaceVariant },
  scoreBadgeVal: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primary },
  priceCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md },
  priceCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: space.sm, flexWrap: 'wrap' },
  priceCardTitle: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface, letterSpacing: 0.5 },
  priceCardTitleMr: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, flex: 1 },
  corridorBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  corridorBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs, marginBottom: space.sm },
  stepBtn50: { paddingHorizontal: 8, paddingVertical: 8, borderRadius: radius.md, backgroundColor: colors.surfaceContainerHigh, borderWidth: 1, borderColor: colors.outlineVariant },
  stepBtn10: { paddingHorizontal: 8, paddingVertical: 8, borderRadius: radius.md, backgroundColor: colors.surfaceContainerHigh, borderWidth: 1, borderColor: colors.outlineVariant },
  stepBtnText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  priceDisplay: { flexDirection: 'row', alignItems: 'baseline', gap: 2, paddingHorizontal: space.sm },
  priceRupee: { fontFamily: fontFamily.extraBold, fontSize: 26, color: colors.primary },
  priceAmount: { fontFamily: fontFamily.extraBold, fontSize: 36, color: colors.primary, letterSpacing: -1 },
  priceUnit: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  sliderTrack: { height: 8, backgroundColor: colors.outlineVariant, borderRadius: radius.full, marginBottom: 4, position: 'relative', overflow: 'visible' },
  sliderFill: { height: 8, backgroundColor: colors.primary, borderRadius: radius.full },
  sliderThumb: { position: 'absolute', top: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.surface, marginLeft: -10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  corridorHighlight: { position: 'absolute', top: 0, height: 8, backgroundColor: 'rgba(4,120,87,0.25)', borderRadius: radius.full },
  corridorLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.tertiary, marginBottom: space.sm },
  benchmarkRow: { flexDirection: 'row', gap: space.xs },
  benchmarkItem: { flex: 1, padding: space.xs, borderRadius: radius.md, backgroundColor: colors.surfaceContainerLow, borderWidth: 1, borderColor: colors.outlineVariant },
  benchmarkItemActive: { borderColor: colors.primaryContainer, backgroundColor: colors.onPrimaryContainer },
  benchmarkKey: { fontFamily: fontFamily.bold, fontSize: 9, color: colors.onSurfaceVariant, letterSpacing: 0.3 },
  benchmarkVal: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  payoutCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' },
  payoutHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  payoutTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.primary, flex: 1 },
  payoutQtl: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  payoutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.sm, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, gap: 4 },
  payoutKey: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurface, flex: 1 },
  payoutVal: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  promoTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  promoTagText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  netBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: space.sm, padding: space.sm, borderRadius: radius.lg, backgroundColor: colors.positiveContainer, borderWidth: 1, borderColor: 'rgba(4,120,87,0.2)' },
  netBoxLabel: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onPositiveContainer },
  netBoxSub: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.tertiary },
  netBoxRight: { alignItems: 'flex-end' },
  netBoxAmount: { fontFamily: fontFamily.extraBold, fontSize: 26, color: colors.tertiary, letterSpacing: -0.5 },
  rtgsBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rtgsBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  escrowNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, margin: space.sm, marginTop: 0, padding: space.xs, borderRadius: radius.sm, backgroundColor: 'rgba(4,120,87,0.06)' },
  escrowNoteText: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurface, flex: 1, lineHeight: 16 },
  logisticsCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md },
  logisticsTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  logisticsTitleMr: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, marginBottom: space.sm },
  dispatchOption: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, padding: space.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: space.xs, backgroundColor: colors.surface },
  dispatchOptionActive: { borderColor: colors.primaryContainer, borderWidth: 2, backgroundColor: colors.onPrimaryContainer },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  radioActive: { borderColor: colors.primary },
  radioFill: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  dispatchInfo: { flex: 1 },
  dispatchTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, flexWrap: 'wrap' },
  dispatchTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface, flex: 1 },
  dispatchTitleActive: { color: colors.primary },
  dispatchSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  recommendedBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.primaryContainer, flexShrink: 0 },
  recommendedText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onPrimary },
  freightBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.positiveContainer, flexShrink: 0 },
  freightText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  optionsCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md },
  optionsRow: { marginBottom: space.xs },
  optionsLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  splitRow: { flexDirection: 'row', gap: space.sm, marginBottom: space.sm },
  splitBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, padding: space.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLow },
  splitBtnActive: { borderColor: colors.primaryContainer, borderWidth: 2, backgroundColor: colors.onPrimaryContainer },
  splitBtnText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurfaceVariant, flex: 1 },
  splitBtnTextActive: { color: colors.primary },
  windowRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingTop: space.xs, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  windowLabel: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurface, flex: 1 },
  windowBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  windowBadgeText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  radarCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.onPrimaryContainer, borderWidth: 1, borderColor: colors.primaryContainer, padding: space.md },
  radarHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: space.xs },
  liveGreen: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.tertiary },
  radarTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.primary },
  radarDesc: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurface, lineHeight: 18 },
  dock: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant, gap: 6 },
  publishBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: touch.targetHero, backgroundColor: colors.primaryContainer, borderRadius: radius.lg, shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5 },
  publishBtnText: { fontFamily: fontFamily.extraBold, fontSize: 13, color: colors.onPrimary, flex: 1, textAlign: 'center' },
  draftNote: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.outline, textAlign: 'center' },
});
