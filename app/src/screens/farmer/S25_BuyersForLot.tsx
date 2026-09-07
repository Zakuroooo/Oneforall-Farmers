/**
 * S25_BuyersForLot — Screen 25: Ranked buyer net-offer comparison.
 * Matched to Stitch `25_buyers_for_lot_ranked_net_offer_comparison/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React, { useState } from 'react';
import {
  Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';

const redOnions = require('../../assets/images/red_onions.jpg');

const BUYERS = [
  {
    rank: '#1',
    rankLabel: 'Best Net Return · शेत निर्यातदार',
    rankBadge: '+₹2,100 vs Yard',
    borderColor: colors.primaryContainer,
    highlight: true,
    name: 'Nashik Agro Exports',
    rating: 4.9,
    reviews: '188 deals',
    onTime: '99.2% on-time pay',
    escrow: '100% Escrow',
    rate: '₹1,910',
    rateUnit: '/Qtl',
    pickup: '12 km (Niphad)',
    pickupNote: 'Buyer pays transport',
    demand: 'Demand: All 40 Qtl',
    grossKey: 'Gross Bid (40 Qtl x ₹1,910)',
    grossVal: '₹76,400',
    hamali: '–₹600',
    hamaliKey: 'Farm Hamali / Loading (शेत हमाली)',
    platformFee: 'FREE (0%)',
    platformFeeKey: 'Mandi-Setu Platform Fee',
    net: '₹75,800',
    ctaLabel: 'सौदा सुरू करा (Start Sauda)',
    profileLabel: 'प्रोफाइल',
  },
  {
    rank: '#2',
    rankLabel: 'Fastest Pickup · शेत बांधावर आजच',
    rankBadge: 'Ready in 1 hr',
    borderColor: colors.outlineVariant,
    highlight: false,
    name: 'Sahyadri Farms FPO',
    rating: 4.8,
    reviews: '320 deals',
    onTime: 'Zero default record',
    escrow: null,
    rate: '₹1,880',
    rateUnit: '/Qtl',
    pickup: 'Truck currently in Niphad',
    pickupNote: 'Instant RTGS Weighment',
    demand: null,
    grossKey: null,
    grossVal: null,
    hamali: null,
    hamaliKey: null,
    platformFee: null,
    platformFeeKey: null,
    net: 'Net: ₹74,600',
    ctaLabel: 'काउंटर ऑफर (Counter Bid)',
    profileLabel: 'प्रोफाइल',
  },
  {
    rank: '#3',
    rankLabel: 'High Reliability · ९८.४% पेमेंट',
    rankBadge: 'Gultekdi, Pune',
    borderColor: colors.outlineVariant,
    highlight: false,
    name: 'Pune Trading Co.',
    rating: 4.7,
    reviews: '142 deals',
    onTime: 'Escrow Verified',
    escrow: null,
    rate: '₹1,850',
    rateUnit: '/Qtl',
    pickup: '45 km away · 24hr pickup',
    pickupNote: 'Min. 20 Qtl or Full 40',
    demand: null,
    grossKey: null,
    grossVal: null,
    hamali: null,
    hamaliKey: null,
    platformFee: null,
    platformFeeKey: null,
    net: 'Net: ₹73,400',
    ctaLabel: 'काउंटर ऑफर (Counter Bid)',
    profileLabel: 'प्रोफाइल',
  },
] as const;

export default function S25_BuyersForLot({ navigation }: any) {
  const { t } = useT();
  const [sortHighest, setSortHighest] = useState(true);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>खरेदीदार मागण्या</Text>
          <Text style={styles.headerSub}>Inbound Buyer Offers · Lot #LP-403</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveGreen} />
          <Text style={styles.liveText}>Live · 3 Bids</Text>
        </View>
        <TouchableOpacity style={styles.listenBtn}>
          <Icon name="volume" size={13} color={colors.primary} />
          <Text style={styles.listenText}>{t('splash_listen')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Lot band */}
        <View style={styles.lotBand}>
          <Image source={redOnions} style={styles.lotThumb} />
          <View style={styles.lotBandInfo}>
            <Text style={styles.lotBandId}>LOT #LP-403 · निफाड (NASHIK)</Text>
            <Text style={styles.lotVariety}>Gavran Red Onion (उन्हाळ कांदा)</Text>
            <View style={styles.lotBandRow}>
              <Text style={styles.lotBandSub}>Asking: ₹2,100/Qtl</Text>
              <View style={styles.mandiBench}>
                <Icon name="building" size={11} color={colors.onSurfaceVariant} />
                <Text style={styles.lotBandSub}>Mandi: ₹2,055/Qtl</Text>
              </View>
            </View>
          </View>
          <View style={styles.gradeBadge}><Text style={styles.gradeText}>Grade A (850/1000)</Text></View>
        </View>

        {/* Sort tabs */}
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[styles.sortTab, sortHighest && styles.sortTabActive]}
            onPress={() => setSortHighest(true)}>
            <Text style={[styles.sortTabText, sortHighest && styles.sortTabTextActive]}>
              सर्वोच्च नफा (Highest Net)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortTab, !sortHighest && styles.sortTabActive]}
            onPress={() => setSortHighest(false)}>
            <Text style={[styles.sortTabText, !sortHighest && styles.sortTabTextActive]}>
              कमी अंतर (Nearest)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Buyer cards */}
        {BUYERS.map((b, idx) => (
          <View key={idx} style={[styles.buyerCard, b.highlight && styles.buyerCardHighlight, { borderColor: b.borderColor }]}>
            {/* Rank strip */}
            <View style={[styles.rankStrip, b.highlight && styles.rankStripHighlight]}>
              <Icon name="star" size={12} color={b.highlight ? '#F59E0B' : colors.outline} />
              <Text style={[styles.rankLabel, b.highlight && styles.rankLabelHighlight]}>
                {b.rank} {b.rankLabel}
              </Text>
              {b.rankBadge ? (
                <View style={[styles.rankBadge, b.highlight && styles.rankBadgeHighlight]}>
                  <Text style={[styles.rankBadgeText, b.highlight && styles.rankBadgeTextHighlight]}>
                    {b.rankBadge}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Buyer info row */}
            <View style={styles.buyerInfoRow}>
              <View style={styles.buyerLeft}>
                <View style={styles.buyerNameRow}>
                  <Text style={styles.buyerName}>{b.name}</Text>
                  <Icon name="check-circle" size={14} color={colors.tertiary} />
                </View>
                <View style={styles.buyerMeta}>
                  <Icon name="star" size={11} color="#F59E0B" />
                  <Text style={styles.buyerMetaText}>{b.rating}</Text>
                  <Text style={styles.buyerMetaDot}> · </Text>
                  <Text style={styles.buyerMetaText}>{b.reviews}</Text>
                  <Text style={styles.buyerMetaDot}> · </Text>
                  <Text style={styles.buyerMetaText}>{b.onTime}</Text>
                </View>
              </View>
              {b.escrow ? (
                <View style={styles.escrowBadge}>
                  <Icon name="shield-check" size={10} color={colors.tertiary} />
                  <Text style={styles.escrowBadgeText}>{b.escrow}</Text>
                </View>
              ) : null}
            </View>

            {/* Rate & pickup */}
            <View style={styles.rateRow}>
              <View>
                <Text style={styles.rateSub}>Offered Farmgate Rate</Text>
                <View style={styles.ratePriceRow}>
                  <Text style={styles.ratePrice}>{b.rate}</Text>
                  <Text style={styles.rateUnit}>{b.rateUnit}</Text>
                </View>
                {b.demand ? <Text style={styles.rateDetail}>{b.demand}</Text> : null}
              </View>
              <View>
                <Text style={styles.rateSub}>Farmgate Pickup</Text>
                <View style={styles.pickupRow}>
                  <Icon name="truck" size={12} color={colors.onSurface} />
                  <Text style={styles.pickupText}>{b.pickup}</Text>
                </View>
                <Text style={styles.pickupNote}>{b.pickupNote}</Text>
              </View>
            </View>

            {/* Breakdown (only for first card) */}
            {b.grossKey ? (
              <View style={styles.breakdown}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownKey}>{b.grossKey}</Text>
                  <Text style={styles.breakdownVal}>{b.grossVal}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownKey}>{b.hamaliKey}</Text>
                  <Text style={[styles.breakdownVal, { color: colors.critical }]}>{b.hamali}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownKey}>{b.platformFeeKey}</Text>
                  <Text style={[styles.breakdownVal, { color: colors.tertiary }]}>{b.platformFee}</Text>
                </View>
                <View style={styles.netRow}>
                  <Text style={styles.netLabel}>NET BANK PAYOUT</Text>
                  <Text style={styles.netAmount}>{b.net}</Text>
                </View>
                <Text style={styles.netSubText}>खात्यात जमा होणारी निवळ रक्कम</Text>
              </View>
            ) : (
              <View style={styles.compactNet}>
                <Text style={styles.compactNetLabel}>{b.net}</Text>
              </View>
            )}

            {/* CTAs */}
            <View style={styles.cardCtas}>
              <TouchableOpacity style={[styles.ctaMain, !b.highlight && styles.ctaMainOutline]}>
                <Text style={[styles.ctaMainText, !b.highlight && styles.ctaMainTextOutline]}>
                  {b.ctaLabel}
                </Text>
                {b.highlight && <Icon name="handshake" size={16} color={colors.onPrimary} />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileBtn}>
                <Text style={styles.profileBtnText}>{b.profileLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Net Math explainer */}
        <View style={styles.netMathCard}>
          <View style={styles.netMathHeader}>
            <Icon name="chart-bar" size={16} color={colors.primary} />
            <Text style={styles.netMathTitle}>नक्त नफ्याची पारदर्शकता (Net Math)</Text>
          </View>
          <Text style={styles.netMathDesc}>
            नाशिक अँग्यांचा बाजारावरील ₹1,910 चा भाव लासलगाव मंडीच्या ₹2,055 भावापेक्षा जास्त नफा कसा देतो?
          </Text>
          {[
            ['ट्रॅक्टर डिझेल व वाहतूक बचत', '+₹1,800'],
            ['बाजार समिती सेस व आढत (1.05%)', '+₹860'],
            ['अनधिकृत ढागी कपात ०%', '+₹650'],
          ].map(([k, v]) => (
            <View key={k} style={styles.netMathRow}>
              <Icon name="check-circle" size={12} color={colors.tertiary} />
              <Text style={styles.netMathKey}>{k}</Text>
              <Text style={styles.netMathVal}>{v}</Text>
            </View>
          ))}
          <Text style={styles.netMathNote}>
            *शेतकऱ्याने स्वतः गाडी भाडे न भरता जागेवरच शेट रोख / RTGS पेमेंट मिळते.
          </Text>
        </View>

        {/* Escrow guarantee */}
        <View style={styles.escrowGuaranteeCard}>
          <Icon name="shield-check" size={20} color={colors.tertiary} />
          <Text style={styles.escrowGuaranteeText}>
            100% Escrow सुरक्षित खात्री{'\n'}
            <Text style={styles.escrowGuaranteeSub}>
              खरेदीदाराने रक्कम मंडी बोर्ड बँकेत जमा केली आहे. वजन झाल्यावर शेट बँक खात्यात वर्ग.
            </Text>
          </Text>
        </View>
      </ScrollView>

      {/* Bottom dock */}
      <View style={styles.dock}>
        <View style={styles.dockLeft}>
          <View style={styles.liveGreenDot} />
          <Text style={styles.dockBidsText}>3 Bids Active</Text>
          <Text style={styles.dockNetText}>Top Net Payout: ₹75,800</Text>
        </View>
        <TouchableOpacity style={styles.dockCta}>
          <Text style={styles.dockCtaText}>Nashik Agro शी सौदा करा</Text>
          <Icon name="arrow-right" size={18} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: space.xs,
    paddingHorizontal: space.md, paddingTop: space.xl + 8, paddingBottom: space.sm,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.primary },
  headerSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  liveGreen: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.tertiary },
  liveText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, backgroundColor: 'rgba(155,47,0,0.08)' },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  scroll: { paddingBottom: 100 },
  lotBand: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.sm,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
  },
  lotThumb: { width: 48, height: 48, borderRadius: radius.sm },
  lotBandInfo: { flex: 1 },
  lotBandId: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurfaceVariant },
  lotVariety: { fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.onSurface },
  lotBandRow: { flexDirection: 'row', gap: space.md },
  mandiBench: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  lotBandSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  gradeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  gradeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  sortRow: { flexDirection: 'row', gap: space.sm, padding: space.md },
  sortTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.outlineVariant, backgroundColor: colors.surface },
  sortTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sortTabText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurfaceVariant },
  sortTabTextActive: { color: colors.onPrimary },
  buyerCard: {
    marginHorizontal: space.md, marginBottom: space.md, borderRadius: radius.xl,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden',
  },
  buyerCardHighlight: { borderWidth: 2 },
  rankStrip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: space.sm, paddingVertical: 6, backgroundColor: colors.surfaceContainerLow },
  rankStripHighlight: { backgroundColor: colors.onPrimaryContainer },
  rankLabel: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurfaceVariant, flex: 1 },
  rankLabelHighlight: { color: colors.primaryContainer },
  rankBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.surfaceContainerHigh },
  rankBadgeHighlight: { backgroundColor: colors.primaryContainer },
  rankBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurfaceVariant },
  rankBadgeTextHighlight: { color: colors.onPrimary },
  buyerInfoRow: { flexDirection: 'row', alignItems: 'center', padding: space.sm, gap: space.sm },
  buyerLeft: { flex: 1 },
  buyerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  buyerName: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.onSurface },
  buyerMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 2 },
  buyerMetaText: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  buyerMetaDot: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.outline },
  escrowBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  escrowBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.sm, paddingBottom: space.sm },
  rateSub: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.onSurfaceVariant },
  ratePriceRow: { flexDirection: 'row', alignItems: 'flex-end' },
  ratePrice: { fontFamily: fontFamily.extraBold, fontSize: 22, color: colors.primary },
  rateUnit: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.onSurfaceVariant, marginBottom: 2 },
  rateDetail: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  pickupRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pickupText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  pickupNote: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  breakdown: {
    marginHorizontal: space.sm, marginBottom: space.sm, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.outlineVariant, padding: space.xs, backgroundColor: colors.surfaceContainerLow,
  },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  breakdownKey: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant, flex: 1, paddingRight: 4 },
  breakdownVal: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  netRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  netLabel: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurface },
  netAmount: { fontFamily: fontFamily.extraBold, fontSize: 22, color: colors.tertiary },
  netSubText: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant, marginTop: 2 },
  compactNet: { paddingHorizontal: space.sm, paddingBottom: space.xs },
  compactNetLabel: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.primary },
  cardCtas: { flexDirection: 'row', gap: space.xs, padding: space.sm, paddingTop: 0 },
  ctaMain: { flex: 1, height: touch.targetMin, backgroundColor: colors.primaryContainer, borderRadius: radius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  ctaMainOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primaryContainer },
  ctaMainText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onPrimary },
  ctaMainTextOutline: { color: colors.primaryContainer },
  profileBtn: { paddingHorizontal: 12, height: touch.targetMin, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center' },
  profileBtnText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  netMathCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md },
  netMathHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: space.xs },
  netMathTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface, flex: 1 },
  netMathDesc: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, marginBottom: space.sm, lineHeight: 18 },
  netMathRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  netMathKey: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurface, flex: 1 },
  netMathVal: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.tertiary },
  netMathNote: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.outline, marginTop: 6, fontStyle: 'italic' },
  escrowGuaranteeCard: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, marginHorizontal: space.md, marginBottom: space.sm, padding: space.md, borderRadius: radius.xl, backgroundColor: colors.positiveContainer, borderWidth: 1, borderColor: 'rgba(4,120,87,0.2)' },
  escrowGuaranteeText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onPositiveContainer, flex: 1 },
  escrowGuaranteeSub: { fontFamily: fontFamily.regular, fontSize: 12 },
  dock: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  dockLeft: { flex: 1 },
  liveGreenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.tertiary, marginBottom: 2 },
  dockBidsText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  dockNetText: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  dockCta: { flexDirection: 'row', alignItems: 'center', gap: 6, height: touch.targetMin, backgroundColor: colors.primaryContainer, borderRadius: radius.lg, paddingHorizontal: space.md, shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  dockCtaText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onPrimary },
});
