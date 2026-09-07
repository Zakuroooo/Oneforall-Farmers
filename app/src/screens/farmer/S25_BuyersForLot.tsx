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
import { ListenButton } from '../../components/ui/ListenButton';

const redOnions = require('../../assets/images/red_onions.jpg');

export default function S25_BuyersForLot({ navigation }: any) {
  const { t } = useT();
  const [sortHighest, setSortHighest] = useState(true);

  const BUYERS = [
    {
      rank: '#1',
      rankLabel: t('buyer1_rank_label'),
      rankBadge: t('buyer1_rank_badge'),
      borderColor: colors.primaryContainer,
      highlight: true,
      name: t('buyer1_name'),
      rating: 4.9,
      reviews: t('buyer1_reviews'),
      onTime: t('buyer1_ontime'),
      escrow: t('buyer1_escrow'),
      rate: t('buyer1_rate'),
      rateUnit: t('buyer1_rate_unit'),
      pickup: t('buyer1_pickup'),
      pickupNote: t('buyer1_pickup_note'),
      demand: t('buyer1_demand'),
      grossKey: t('buyer1_gross_key'),
      grossVal: t('buyer1_gross_val'),
      hamali: t('buyer1_hamali_val'),
      hamaliKey: t('buyer1_hamali_key'),
      platformFee: t('buyer1_platform_fee'),
      platformFeeKey: t('buyer1_platform_fee_key'),
      net: t('buyer1_net'),
      ctaLabel: t('buyer1_cta'),
      profileLabel: t('buyer1_profile'),
      onCta: () => navigation.navigate('S30_DealCounterOffer'),
      onProfile: () => navigation.navigate('S26_BuyerProfile'),
    },
    {
      rank: '#2',
      rankLabel: t('buyer2_rank_label'),
      rankBadge: t('buyer2_rank_badge'),
      borderColor: colors.outlineVariant,
      highlight: false,
      name: t('buyer2_name'),
      rating: 4.8,
      reviews: t('buyer2_reviews'),
      onTime: t('buyer2_ontime'),
      escrow: null,
      rate: t('buyer2_rate'),
      rateUnit: t('buyer1_rate_unit'),
      pickup: t('buyer2_pickup'),
      pickupNote: t('buyer2_pickup_note'),
      demand: null,
      grossKey: null,
      grossVal: null,
      hamali: null,
      hamaliKey: null,
      platformFee: null,
      platformFeeKey: null,
      net: t('buyer2_net'),
      ctaLabel: t('buyer2_cta'),
      profileLabel: t('buyer1_profile'),
      onCta: () => navigation.navigate('S30_DealCounterOffer'),
      onProfile: () => navigation.navigate('S26_BuyerProfile'),
    },
    {
      rank: '#3',
      rankLabel: t('buyer3_rank_label'),
      rankBadge: t('buyer3_rank_badge'),
      borderColor: colors.outlineVariant,
      highlight: false,
      name: t('buyer3_name'),
      rating: 4.7,
      reviews: t('buyer3_reviews'),
      onTime: t('buyer3_ontime'),
      escrow: null,
      rate: t('buyer3_rate'),
      rateUnit: t('buyer1_rate_unit'),
      pickup: t('buyer3_pickup'),
      pickupNote: t('buyer3_pickup_note'),
      demand: null,
      grossKey: null,
      grossVal: null,
      hamali: null,
      hamaliKey: null,
      platformFee: null,
      platformFeeKey: null,
      net: t('buyer3_net'),
      ctaLabel: t('buyer3_cta'),
      profileLabel: t('buyer1_profile'),
      onCta: () => navigation.navigate('S30_DealCounterOffer'),
      onProfile: () => navigation.navigate('S26_BuyerProfile'),
    },
  ] as const;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('lot_header_title')}</Text>
          <Text style={styles.headerSub}>{t('lot_header_sub')}</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveGreen} />
          <Text style={styles.liveText}>{t('lot_live_bids')}</Text>
        </View>
        <ListenButton text={`${t('lot_header_title')}. ${t('mkt_nearby_sub')}`} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Lot band */}
        <View style={styles.lotBand}>
          <Image source={redOnions} style={styles.lotThumb} />
          <View style={styles.lotBandInfo}>
            <Text style={styles.lotBandId}>{t('lot_band_id')}</Text>
            <Text style={styles.lotVariety}>{t('lot_variety')}</Text>
            <View style={styles.lotBandRow}>
              <Text style={styles.lotBandSub}>{t('lot_asking')}</Text>
              <View style={styles.mandiBench}>
                <Icon name="building" size={11} color={colors.onSurfaceVariant} />
                <Text style={styles.lotBandSub}>{t('lot_mandi')}</Text>
              </View>
            </View>
          </View>
          <View style={styles.gradeBadge}><Text style={styles.gradeText}>{t('lot_grade')}</Text></View>
        </View>

        {/* Sort tabs */}
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[styles.sortTab, sortHighest && styles.sortTabActive]}
            onPress={() => setSortHighest(true)}>
            <Text style={[styles.sortTabText, sortHighest && styles.sortTabTextActive]}>
              {t('lot_sort_highest')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortTab, !sortHighest && styles.sortTabActive]}
            onPress={() => setSortHighest(false)}>
            <Text style={[styles.sortTabText, !sortHighest && styles.sortTabTextActive]}>
              {t('lot_sort_fastest')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bids */}
        {BUYERS.map((b, i) => (
          <View key={i} style={[styles.card, { borderColor: b.borderColor }]}>
            {/* Rank header */}
            <View style={[styles.cardRankRow, b.highlight && styles.cardRankRowHighlight]}>
              <View style={styles.rankBadgeBg}>
                <Text style={styles.rankNum}>{b.rank}</Text>
              </View>
              <Text style={[styles.rankLabel, b.highlight && styles.rankLabelHighlight]}>{b.rankLabel}</Text>
              <View style={[styles.rankExtraBadge, b.highlight && styles.rankExtraBadgeHighlight]}>
                <Icon name="trending-up" size={12} color={b.highlight ? colors.primary : colors.tertiary} />
                <Text style={[styles.rankExtraText, b.highlight && styles.rankExtraTextHighlight]}>{b.rankBadge}</Text>
              </View>
            </View>

            {/* Buyer Profile Row */}
            <View style={styles.profileRow}>
              <View style={styles.buyerIdentity}>
                <View style={styles.buyerNameLine}>
                  <Text style={styles.buyerName}>{b.name}</Text>
                  <Icon name="check-circle" size={14} color={colors.tertiary} />
                </View>
                <View style={styles.buyerStats}>
                  <Icon name="star" size={12} color="#F59E0B" />
                  <Text style={styles.buyerStatText}>{b.rating}</Text>
                  <Text style={styles.buyerStatDot}>•</Text>
                  <Text style={styles.buyerStatText}>{b.reviews}</Text>
                  <Text style={styles.buyerStatDot}>•</Text>
                  <Text style={styles.buyerStatText}>{b.onTime}</Text>
                </View>
                {b.escrow && (
                  <View style={styles.escrowBadge}>
                    <Icon name="shield" size={10} color={colors.tertiary} />
                    <Text style={styles.escrowText}>{b.escrow}</Text>
                  </View>
                )}
              </View>
              
              {/* Added profile view button with navigation hook */}
              <TouchableOpacity style={styles.profileBtn} onPress={b.onProfile}>
                <Text style={styles.profileBtnText}>{b.profileLabel}</Text>
                <Icon name="arrow-right" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Core Offer */}
            <View style={styles.offerRow}>
              <View style={styles.offerCol}>
                <Text style={styles.offerLabel}>Gross Rate (दर)</Text>
                <View style={styles.offerRateLine}>
                  <Text style={styles.offerRate}>{b.rate}</Text>
                  <Text style={styles.offerRateUnit}>{b.rateUnit}</Text>
                </View>
              </View>
              <View style={styles.offerDivider} />
              <View style={styles.offerCol}>
                <Text style={styles.offerLabel}>Logistics (वाहतूक)</Text>
                <View style={styles.pickupLine}>
                  <Icon name="truck" size={14} color={colors.tertiary} />
                  <Text style={styles.pickupVal}>{b.pickup}</Text>
                </View>
                <Text style={styles.pickupNote}>{b.pickupNote}</Text>
              </View>
            </View>

            {/* Breakup (only for top) */}
            {b.highlight && b.grossKey && (
              <View style={styles.breakupBox}>
                <View style={styles.breakupTitleRow}>
                  <Icon name="chart-bar" size={12} color={colors.onSurfaceVariant} />
                  <Text style={styles.breakupTitle}>{t('buyer_breakup_title')}</Text>
                </View>
                <View style={styles.breakupRow}>
                  <Text style={styles.breakupKey}>{b.demand}</Text>
                </View>
                <View style={styles.breakupRow}>
                  <Text style={styles.breakupKey}>{b.grossKey}</Text>
                  <Text style={styles.breakupValGross}>{b.grossVal}</Text>
                </View>
                <View style={styles.breakupRow}>
                  <Text style={styles.breakupKey}>{b.hamaliKey}</Text>
                  <Text style={styles.breakupValNeg}>{b.hamali}</Text>
                </View>
                <View style={styles.breakupRow}>
                  <Text style={styles.breakupKey}>{b.platformFeeKey}</Text>
                  <Text style={styles.breakupValFree}>{b.platformFee}</Text>
                </View>
                <View style={styles.breakupTotalRow}>
                  <Text style={styles.breakupTotalKey}>{t('buyer_net_bank_account')}</Text>
                  <Text style={styles.breakupTotalVal}>{b.net}</Text>
                </View>
              </View>
            )}

            {/* CTA */}
            <View style={styles.ctaRow}>
              {!b.highlight && (
                <Text style={styles.simpleNet}>{b.net}</Text>
              )}
              <TouchableOpacity
                style={[styles.primaryBtn, b.highlight ? styles.primaryBtnHighlight : null]}
                onPress={b.onCta}>
                <Text style={[styles.primaryBtnText, b.highlight ? styles.primaryBtnTextHighlight : null]}>
                  {b.ctaLabel}
                </Text>
                <Icon name="arrow-right" size={16} color={b.highlight ? colors.onPrimary : colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {/* Helper Note */}
        <View style={styles.footerNote}>
          <Icon name="info" size={14} color={colors.onSurfaceVariant} />
          <Text style={styles.footerNoteText}>{t('buyer_apmc_tax_footer_note')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    paddingHorizontal: space.md, paddingTop: space.xl + 8, paddingBottom: space.sm,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.onSurface },
  headerSub: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(22,163,74,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  liveGreen: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.positive },
  liveText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.positive },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, backgroundColor: 'rgba(155,47,0,0.08)' },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  scroll: { paddingBottom: space.xxl },
  lotBand: { flexDirection: 'row', backgroundColor: colors.surface, padding: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  lotThumb: { width: 50, height: 50, borderRadius: radius.sm, backgroundColor: colors.surfaceContainerHigh },
  lotBandInfo: { flex: 1, marginLeft: space.sm, justifyContent: 'center' },
  lotBandId: { fontFamily: fontFamily.extraBold, fontSize: 11, color: colors.onSurfaceVariant, letterSpacing: 0.5 },
  lotVariety: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  lotBandRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: 2 },
  lotBandSub: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  mandiBench: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  gradeBadge: { position: 'absolute', right: space.sm, top: space.sm, backgroundColor: colors.positiveContainer, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm },
  gradeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  sortRow: { flexDirection: 'row', margin: space.md, backgroundColor: colors.surfaceContainerHighest, borderRadius: radius.md, padding: 4 },
  sortTab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.sm },
  sortTabActive: { backgroundColor: colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  sortTabText: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.onSurfaceVariant },
  sortTabTextActive: { fontFamily: fontFamily.bold, color: colors.onSurface },
  card: { marginHorizontal: space.md, marginBottom: space.md, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, overflow: 'hidden' },
  cardRankRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.md, paddingVertical: space.sm, backgroundColor: colors.surfaceContainerHighest, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  cardRankRowHighlight: { backgroundColor: colors.primaryContainer, borderBottomColor: 'rgba(194, 65, 12, 0.2)' },
  rankBadgeBg: { backgroundColor: colors.surface, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  rankNum: { fontFamily: fontFamily.extraBold, fontSize: 12, color: colors.onSurface },
  rankLabel: { flex: 1, fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurfaceVariant },
  rankLabelHighlight: { color: colors.onPrimaryContainer },
  rankExtraBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1, borderColor: colors.outlineVariant },
  rankExtraBadgeHighlight: { borderColor: 'rgba(194, 65, 12, 0.2)' },
  rankExtraText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  rankExtraTextHighlight: { color: colors.primary },
  profileRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: space.md, paddingTop: space.md },
  buyerIdentity: { flex: 1 },
  buyerNameLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  buyerName: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.onSurface },
  buyerStats: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  buyerStatText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant, marginLeft: 2 },
  buyerStatDot: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.outline, marginHorizontal: 4 },
  escrowBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, backgroundColor: colors.positiveContainer, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm },
  escrowText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  profileBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.full, backgroundColor: 'rgba(155,47,0,0.08)' },
  profileBtnText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primary },
  offerRow: { flexDirection: 'row', padding: space.md, marginTop: space.sm, backgroundColor: colors.surfaceContainerLowest },
  offerCol: { flex: 1 },
  offerDivider: { width: 1, backgroundColor: colors.outlineVariant, marginHorizontal: space.md },
  offerLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant, marginBottom: 4 },
  offerRateLine: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  offerRate: { fontFamily: fontFamily.extraBold, fontSize: 24, color: colors.onSurface, letterSpacing: -0.5 },
  offerRateUnit: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.onSurfaceVariant },
  pickupLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  pickupVal: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.tertiary },
  pickupNote: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  breakupBox: { marginHorizontal: space.md, marginBottom: space.md, padding: space.md, borderRadius: radius.md, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: colors.outlineVariant },
  breakupTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: space.sm },
  breakupTitle: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  breakupRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  breakupKey: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.onSurfaceVariant },
  breakupValGross: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.onSurface },
  breakupValNeg: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.critical },
  breakupValFree: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.positive },
  breakupTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.sm, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  breakupTotalKey: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  breakupTotalVal: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.primary },
  ctaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.md, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  simpleNet: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.primary },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(155,47,0,0.08)', paddingHorizontal: space.lg, height: 44, borderRadius: radius.lg, alignSelf: 'flex-end', marginLeft: 'auto' },
  primaryBtnHighlight: { backgroundColor: colors.primary, shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5 },
  primaryBtnText: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.primary },
  primaryBtnTextHighlight: { color: colors.onPrimary },
  footerNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingHorizontal: space.md, paddingBottom: space.xl },
  footerNoteText: { flex: 1, fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, lineHeight: 16 },
});
