/**
 * S27_Bargaining — Screen 27: Live bargaining / sauda negotiation.
 * Matched to Stitch `27_bargaining_live_sauda_negotiation/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';

export default function S27_Bargaining({ navigation }: any) {
  const { t } = useT();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerNameRow}>
            <Text style={styles.buyerName}>Pune Trading Co</Text>
            <Icon name="check-circle" size={14} color={colors.tertiary} />
          </View>
          <View style={styles.headerMetaRow}>
            <Text style={styles.headerMeta}>{t('bargain_buyer_dist')}</Text>
            <View style={styles.headerDot} />
            <Icon name="check" size={10} color={colors.tertiary} />
            <Text style={styles.headerMeta}>{t('bargain_buyer_ontime')}</Text>
          </View>
        </View>
        <View style={styles.roundBadge}>
          <Text style={styles.roundBadgeText}>{t('bargain_round_badge')}</Text>
          <Text style={styles.expiryText}>{t('bargain_round_expiry')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Lot info band */}
        <View style={styles.lotBand}>
          <Icon name="box" size={14} color={colors.primary} />
          <Text style={styles.lotBandText}>{t('bargain_lot_text')}</Text>
          <Text style={styles.lotBandSub}>{t('bargain_lot_sub')}</Text>
        </View>

        {/* Price benchmarks */}
        <View style={styles.benchmarkRow}>
          <View style={styles.benchmarkCard}>
            <Text style={styles.benchmarkLabel}>{t('bargain_ask_label')}</Text>
            <Text style={styles.benchmarkVal}>{t('bargain_ask_val')}<Text style={styles.benchmarkUnit}>/q</Text></Text>
          </View>
          <View style={styles.benchmarkCard}>
            <Text style={styles.benchmarkLabel}>{t('bargain_mandi_label')}</Text>
            <Text style={[styles.benchmarkVal, { color: colors.tertiary }]}>{t('bargain_mandi_val')}<Text style={styles.benchmarkUnit}>/q</Text></Text>
          </View>
        </View>

        {/* Audit trail header */}
        <View style={styles.auditHeader}>
          <View style={styles.auditLeft}>
            <Icon name="clipboard" size={13} color={colors.onSurfaceVariant} />
            <Text style={styles.auditLabel}>{t('bargain_audit_label')}</Text>
          </View>
          <View style={styles.auditBadge}>
            <Text style={styles.auditBadgeText}>{t('bargain_audit_badge')}</Text>
          </View>
        </View>

        {/* ── Round 1: Buyer initial bid ── */}
        <View style={styles.offerCard}>
          <View style={styles.offerCardHeader}>
            <View style={styles.buyerAvatar}><Text style={styles.buyerAvatarText}>B1</Text></View>
            <View style={styles.offerMeta}>
              <Text style={styles.offerParty}>{t('bargain_r1_role')}</Text>
              <Text style={styles.offerRound}>{t('bargain_r1_time')}</Text>
            </View>
            <View style={styles.counteredBadge}><Text style={styles.counteredText}>{t('bargain_r1_badge')}</Text></View>
          </View>
          <View style={styles.offerAmounts}>
            <View>
              <Text style={styles.offerAmtLabel}>{t('bargain_r1_bid_label')}</Text>
              <Text style={styles.offerAmtBig}>{t('bargain_r1_bid_val')}<Text style={styles.offerAmtUnit}>/q</Text></Text>
            </View>
            <View>
              <Text style={styles.offerAmtLabel}>{t('bargain_r1_total_label')}</Text>
              <Text style={styles.offerAmtRight}>{t('bargain_r1_total_val')}</Text>
            </View>
          </View>
          <View style={styles.quoteBox}>
            <Icon name="message-circle" size={12} color={colors.outline} />
            <Text style={styles.quoteText}>{t('bargain_r1_quote')}</Text>
          </View>
        </View>

        {/* ── Round 2: Farmer counter ── */}
        <View style={[styles.offerCard, styles.farmerCard]}>
          <View style={styles.offerCardHeader}>
            <View style={[styles.buyerAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.buyerAvatarText}>RP</Text>
            </View>
            <View style={styles.offerMeta}>
              <Text style={styles.offerParty}>{t('bargain_r2_role')}</Text>
              <Text style={styles.offerRound}>{t('bargain_r2_time')}</Text>
            </View>
            <View style={styles.farmerCounterBadge}><Text style={styles.farmerCounterText}>{t('bargain_r2_badge')}</Text></View>
          </View>
          <View style={styles.offerAmounts}>
            <View>
              <Text style={styles.offerAmtLabel}>{t('bargain_r2_bid_label')}</Text>
              <Text style={[styles.offerAmtBig, { color: colors.primary }]}>{t('bargain_r2_bid_val')}<Text style={styles.offerAmtUnit}>/q</Text></Text>
            </View>
            <View>
              <Text style={styles.offerAmtLabel}>{t('bargain_r2_total_label')}</Text>
              <Text style={styles.offerAmtRight}>{t('bargain_r2_total_val')}</Text>
            </View>
          </View>
          <View style={styles.quoteBox}>
            <Icon name="info" size={12} color={colors.outline} />
            <Text style={styles.quoteText}>{t('bargain_r2_quote')}</Text>
          </View>
        </View>

        {/* ── Round 3: Final buyer bid — AWAITING ACTION ── */}
        <View style={[styles.offerCard, styles.finalCard]}>
          <View style={styles.awaitingBanner}>
            <Icon name="zap" size={11} color="#F59E0B" />
            <Text style={styles.awaitingText}>{t('bargain_r3_banner')}</Text>
          </View>
          <View style={styles.offerCardHeader}>
            <View style={[styles.buyerAvatar, { backgroundColor: '#B45309' }]}>
              <Text style={styles.buyerAvatarText}>B3</Text>
            </View>
            <View style={styles.offerMeta}>
              <Text style={styles.offerParty}>{t('bargain_r3_role')}</Text>
              <Text style={styles.offerRound}>{t('bargain_r3_time')}</Text>
            </View>
          </View>

          <View style={styles.finalBidSection}>
            <View>
              <Text style={[styles.offerAmtLabel, { color: colors.primaryContainer }]}>{t('bargain_r3_bid_label')}</Text>
              <Text style={[styles.offerAmtBig, { fontSize: 32 }]}>{t('bargain_r3_bid_val')}<Text style={styles.offerAmtUnit}>{t('bargain_r3_unit')}</Text></Text>
            </View>
            <View>
              <Text style={styles.offerAmtLabel}>{t('bargain_r3_total_label')}</Text>
              <Text style={[styles.offerAmtRight, { fontSize: 20 }]}>{t('bargain_r3_total_val')}</Text>
            </View>
          </View>
          <View style={[styles.quoteBox, styles.finalQuoteBox]}>
            <Icon name="message-circle" size={12} color={colors.primaryContainer} />
            <Text style={[styles.quoteText, { color: colors.primaryContainer, fontWeight: '600' }]}>
              {t('bargain_r3_quote')}
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.dock}>
        <View style={styles.dockWarning}>
          <Icon name="info" size={12} color={colors.critical} />
          <Text style={styles.dockWarningText}>{t('bargain_note')}</Text>
        </View>
        <View style={styles.dockBtns}>
          <TouchableOpacity style={styles.rejectBtn}>
            <Text style={styles.rejectBtnText}>{t('bargain_btn_reject')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn} onPress={() => navigation.navigate('S29_ConfirmAcceptance')}>
            <Icon name="check-circle" size={18} color={colors.onPrimary} />
            <Text style={styles.acceptBtnText}>{t('bargain_btn_accept')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.md, paddingTop: space.xl + 8, paddingBottom: space.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  buyerName: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.onSurface },
  headerMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  headerMeta: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  headerDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.outline },
  roundBadge: { alignItems: 'flex-end' },
  roundBadgeText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primaryContainer },
  expiryText: { fontFamily: fontFamily.extraBold, fontSize: 12, color: colors.critical, marginTop: 2 },
  scroll: { paddingBottom: 160 },
  lotBand: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingVertical: space.sm, backgroundColor: '#FFFBEB', borderBottomWidth: 1, borderBottomColor: '#FEF3C7' },
  lotBandText: { fontFamily: fontFamily.bold, fontSize: 13, color: '#92400E' },
  lotBandSub: { fontFamily: fontFamily.medium, fontSize: 11, color: '#B45309', marginLeft: 'auto' },
  benchmarkRow: { flexDirection: 'row', gap: space.md, padding: space.md },
  benchmarkCard: { flex: 1, padding: space.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  benchmarkLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant, marginBottom: 4 },
  benchmarkVal: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.onSurface },
  benchmarkUnit: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  auditHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.md, marginBottom: space.sm },
  auditLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  auditLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  auditBadge: { backgroundColor: colors.surfaceContainerHigh, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm },
  auditBadgeText: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.onSurfaceVariant },
  offerCard: { marginHorizontal: space.md, marginBottom: space.md, padding: space.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  farmerCard: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', alignSelf: 'flex-end', width: '90%' },
  finalCard: { borderColor: colors.primaryContainer, borderWidth: 2, backgroundColor: colors.onPrimaryContainer },
  offerCardHeader: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md },
  buyerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  buyerAvatarText: { fontFamily: fontFamily.extraBold, fontSize: 12, color: colors.onSurface },
  offerMeta: { flex: 1 },
  offerParty: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  offerRound: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  counteredBadge: { backgroundColor: colors.surfaceContainerHigh, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm },
  counteredText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.outline },
  farmerCounterBadge: { backgroundColor: 'rgba(2,132,199,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm },
  farmerCounterText: { fontFamily: fontFamily.bold, fontSize: 10, color: '#0284C7' },
  offerAmounts: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: space.sm },
  offerAmtLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant, marginBottom: 4 },
  offerAmtBig: { fontFamily: fontFamily.extraBold, fontSize: 24, color: colors.onSurface, letterSpacing: -0.5 },
  offerAmtUnit: { fontFamily: fontFamily.medium, fontSize: 14 },
  offerAmtRight: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.onSurface },
  quoteBox: { flexDirection: 'row', gap: 6, backgroundColor: colors.surfaceContainerLowest, padding: space.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.outlineVariant },
  finalQuoteBox: { backgroundColor: 'rgba(194, 65, 12, 0.05)', borderColor: 'rgba(194, 65, 12, 0.2)' },
  quoteText: { flex: 1, fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, fontStyle: 'italic', lineHeight: 16 },
  awaitingBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#FFFBEB', margin: -space.md, marginBottom: space.md, paddingVertical: 6, borderTopLeftRadius: radius.lg - 1, borderTopRightRadius: radius.lg - 1, borderBottomWidth: 1, borderBottomColor: '#FEF3C7' },
  awaitingText: { fontFamily: fontFamily.bold, fontSize: 11, color: '#B45309', textTransform: 'uppercase', letterSpacing: 0.5 },
  finalBidSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', backgroundColor: colors.surface, padding: space.md, borderRadius: radius.md, marginBottom: space.sm },
  dock: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  dockWarning: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: space.sm },
  dockWarningText: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.critical },
  dockBtns: { flexDirection: 'row', gap: space.sm },
  rejectBtn: { flex: 1, height: touch.targetHero, alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, backgroundColor: colors.surfaceContainerHigh },
  rejectBtnText: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.critical },
  acceptBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: touch.targetHero, backgroundColor: colors.primaryContainer, borderRadius: radius.lg, shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5 },
  acceptBtnText: { fontFamily: fontFamily.extraBold, fontSize: 15, color: colors.onPrimary },
});
