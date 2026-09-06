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
            <Text style={styles.headerMeta}>45km away</Text>
            <View style={styles.headerDot} />
            <Icon name="check" size={10} color={colors.tertiary} />
            <Text style={styles.headerMeta}>98.4% On-Time</Text>
          </View>
        </View>
        <View style={styles.roundBadge}>
          <Text style={styles.roundBadgeText}>Round 3 of 3 (Final Round)</Text>
          <Text style={styles.expiryText}>Expires in 18:42</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Lot info band */}
        <View style={styles.lotBand}>
          <Icon name="box" size={14} color={colors.primary} />
          <Text style={styles.lotBandText}>40 Quintals · Grade A Onion</Text>
          <Text style={styles.lotBandSub}>Lasalgaon Mandi Yard · Lot #LS-8842</Text>
        </View>

        {/* Price benchmarks */}
        <View style={styles.benchmarkRow}>
          <View style={styles.benchmarkCard}>
            <Text style={styles.benchmarkLabel}>Asking Price</Text>
            <Text style={styles.benchmarkVal}>₹1,950<Text style={styles.benchmarkUnit}>/q</Text></Text>
          </View>
          <View style={styles.benchmarkCard}>
            <Text style={styles.benchmarkLabel}>Current Mandi Avg</Text>
            <Text style={[styles.benchmarkVal, { color: colors.tertiary }]}>₹2,050<Text style={styles.benchmarkUnit}>/q</Text></Text>
          </View>
        </View>

        {/* Audit trail header */}
        <View style={styles.auditHeader}>
          <View style={styles.auditLeft}>
            <Icon name="clipboard" size={13} color={colors.onSurfaceVariant} />
            <Text style={styles.auditLabel}>Audit Trail & Offer History</Text>
          </View>
          <View style={styles.auditBadge}>
            <Text style={styles.auditBadgeText}>Rambhau Patil vs. Pune Trading Co</Text>
          </View>
        </View>

        {/* ── Round 1: Buyer initial bid ── */}
        <View style={styles.offerCard}>
          <View style={styles.offerCardHeader}>
            <View style={styles.buyerAvatar}><Text style={styles.buyerAvatarText}>B1</Text></View>
            <View style={styles.offerMeta}>
              <Text style={styles.offerParty}>Pune Trading Co</Text>
              <Text style={styles.offerRound}>Round 1 • 10:14 AM</Text>
            </View>
            <View style={styles.counteredBadge}><Text style={styles.counteredText}>Countered</Text></View>
          </View>
          <View style={styles.offerAmounts}>
            <View>
              <Text style={styles.offerAmtLabel}>Initial Buyer Bid</Text>
              <Text style={styles.offerAmtBig}>₹1,850<Text style={styles.offerAmtUnit}>/q</Text></Text>
            </View>
            <View>
              <Text style={styles.offerAmtLabel}>Total Lot Value</Text>
              <Text style={styles.offerAmtRight}>₹74,000</Text>
            </View>
          </View>
          <View style={styles.quoteBox}>
            <Icon name="message-circle" size={12} color={colors.outline} />
            <Text style={styles.quoteText}>"Prompt payment via escrow upon Lasalgaon weighment."</Text>
          </View>
        </View>

        {/* ── Round 2: Farmer counter ── */}
        <View style={[styles.offerCard, styles.farmerCard]}>
          <View style={styles.offerCardHeader}>
            <View style={[styles.buyerAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.buyerAvatarText}>RP</Text>
            </View>
            <View style={styles.offerMeta}>
              <Text style={styles.offerParty}>Rambhau Patil (You)</Text>
              <Text style={styles.offerRound}>Round 2 • 10:22 AM</Text>
            </View>
            <View style={styles.farmerCounterBadge}><Text style={styles.farmerCounterText}>Farmer Counter</Text></View>
          </View>
          <View style={styles.offerAmounts}>
            <View>
              <Text style={styles.offerAmtLabel}>Your Counter-Offer</Text>
              <Text style={[styles.offerAmtBig, { color: colors.primary }]}>₹1,950<Text style={styles.offerAmtUnit}>/q</Text></Text>
            </View>
            <View>
              <Text style={styles.offerAmtLabel}>Total Lot Value</Text>
              <Text style={styles.offerAmtRight}>₹78,000</Text>
            </View>
          </View>
          <View style={styles.quoteBox}>
            <Icon name="info" size={12} color={colors.outline} />
            <Text style={styles.quoteText}>"Grade A sorted, well-cured onions, low moisture."</Text>
          </View>
        </View>

        {/* ── Round 3: Final buyer bid — AWAITING ACTION ── */}
        <View style={[styles.offerCard, styles.finalCard]}>
          <View style={styles.awaitingBanner}>
            <Icon name="zap" size={11} color="#F59E0B" />
            <Text style={styles.awaitingText}>Awaiting Your Action</Text>
          </View>
          <View style={styles.offerCardHeader}>
            <View style={[styles.buyerAvatar, { backgroundColor: '#B45309' }]}>
              <Text style={styles.buyerAvatarText}>B3</Text>
            </View>
            <View style={styles.offerMeta}>
              <Text style={styles.offerParty}>Pune Trading Co</Text>
              <Text style={styles.offerRound}>Round 3 of 3 • Received 3 minutes ago</Text>
            </View>
          </View>

          <View style={styles.finalBidSection}>
            <View>
              <Text style={[styles.offerAmtLabel, { color: colors.primaryContainer }]}>FINAL BUYER BID</Text>
              <Text style={[styles.offerAmtBig, { fontSize: 32 }]}>₹1,900<Text style={styles.offerAmtUnit}>/quintal</Text></Text>
            </View>
            <View>
              <Text style={styles.offerAmtLabel}>Payout Total</Text>
              <Text style={[styles.offerAmtRight, { fontSize: 22, color: colors.tertiary }]}>₹76,000</Text>
            </View>
          </View>

          <View style={styles.commitmentCard}>
            <Icon name="handshake" size={13} color={colors.primaryContainer} />
            <View>
              <Text style={styles.commitmentTitle}>Buyer Logistics Commitment</Text>
              <Text style={styles.commitmentText}>"Will arrange own pickup from Niphad warehouse today. Final offer."</Text>
            </View>
          </View>
        </View>

        {/* Decision matrix */}
        <View style={styles.matrixCard}>
          <View style={styles.matrixHeader}>
            <Icon name="chart-bar" size={14} color={colors.primary} />
            <Text style={styles.matrixTitle}>Decision Matrix</Text>
            <View style={styles.guaranteedBadge}><Text style={styles.guaranteedText}>Guaranteed Payout</Text></View>
          </View>
          <View style={styles.matrixRow}>
            <View style={styles.matrixItem}>
              <Text style={styles.matrixItemLabel}>Instant Escrow Lock</Text>
              <Text style={styles.matrixItemVal}>₹76,000</Text>
              <Text style={styles.matrixItemSub}>40 Qtl @ ₹1,900</Text>
            </View>
            <View style={[styles.matrixItem, { backgroundColor: colors.positiveContainer, borderColor: 'rgba(4,120,87,0.2)' }]}>
              <Text style={[styles.matrixItemLabel, { color: colors.tertiary }]}>Net Farmer Gain</Text>
              <Text style={[styles.matrixItemVal, { color: colors.tertiary }]}>+₹7,200</Text>
              <Text style={styles.matrixItemSub}>vs. Farmgate baseline</Text>
            </View>
          </View>
          <Text style={styles.matrixNote}>
            You gain ₹7,200 more than today's harvest-day farmgate trader rate of ₹1,720/q, with zero cartage expense.
          </Text>
          <View style={styles.matrixFooter}>
            <View style={styles.matrixFooterItem}>
              <Icon name="scale" size={12} color={colors.tertiary} />
              <Text style={styles.matrixFooterText}>Weighbridge: Electronic Slip Verified</Text>
            </View>
            <View style={styles.matrixFooterItem}>
              <Icon name="check-circle" size={12} color={colors.tertiary} />
              <Text style={styles.matrixFooterText}>Moisture 9.2% (Pass)</Text>
            </View>
          </View>
        </View>

        {/* Escrow note */}
        <View style={styles.escrowNote}>
          <Icon name="lock" size={12} color={colors.onSurfaceVariant} />
          <Text style={styles.escrowNoteText}>Protected by Mandi-Setu Verified Escrow · Payment locked before dispatch</Text>
        </View>
      </ScrollView>

      {/* CTA dock */}
      <View style={styles.dock}>
        <TouchableOpacity style={styles.acceptBtn}>
          <Icon name="check-circle" size={18} color={colors.onPrimary} />
          <Text style={styles.acceptBtnText}>Accept ₹1,900/q (₹76,000)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.counterBtn}>
          <Icon name="edit" size={16} color={colors.primaryContainer} />
          <Text style={styles.counterBtnText}>Make Final Counter-Offer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.declineLink}>
          <Text style={styles.declineLinkText}>Decline Offer & Return Lot to Open Auction</Text>
        </TouchableOpacity>
      </View>
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
  backBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1 },
  headerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  buyerName: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.onSurface },
  headerMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  headerMeta: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  headerDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.outline },
  roundBadge: { alignItems: 'flex-end' },
  roundBadgeText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primaryContainer },
  expiryText: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant, marginTop: 1 },
  scroll: { paddingBottom: 170 },
  lotBand: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: space.md, paddingVertical: space.sm,
    borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.surface,
  },
  lotBandText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface, flex: 1 },
  lotBandSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  benchmarkRow: { flexDirection: 'row', gap: space.sm, padding: space.md },
  benchmarkCard: {
    flex: 1, padding: space.sm, borderRadius: radius.lg,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant,
  },
  benchmarkLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  benchmarkVal: { fontFamily: fontFamily.extraBold, fontSize: 22, color: colors.onSurface, marginTop: 2 },
  benchmarkUnit: { fontSize: 13, fontFamily: fontFamily.regular, color: colors.onSurfaceVariant },
  auditHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: space.md, marginBottom: space.xs,
  },
  auditLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  auditLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurfaceVariant },
  auditBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  auditBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  offerCard: {
    marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md,
  },
  farmerCard: { backgroundColor: colors.onPrimaryContainer, borderColor: colors.primaryContainer },
  finalCard: { borderColor: colors.primaryContainer, borderWidth: 2, backgroundColor: colors.surface },
  offerCardHeader: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.sm },
  buyerAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#B45309',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  buyerAvatarText: { fontFamily: fontFamily.extraBold, fontSize: 12, color: '#fff' },
  offerMeta: { flex: 1 },
  offerParty: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  offerRound: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  counteredBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.surfaceContainerHigh },
  counteredText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurfaceVariant },
  farmerCounterBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.onPrimaryContainer },
  farmerCounterText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.primary },
  offerAmounts: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: space.sm },
  offerAmtLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  offerAmtBig: { fontFamily: fontFamily.extraBold, fontSize: 26, color: colors.onSurface, letterSpacing: -0.3 },
  offerAmtUnit: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.onSurfaceVariant },
  offerAmtRight: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.onSurface },
  quoteBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6, padding: space.xs,
    borderRadius: radius.sm, backgroundColor: colors.surfaceContainerLow,
  },
  quoteText: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, flex: 1, fontStyle: 'italic' },
  awaitingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: space.sm, paddingVertical: 4, borderRadius: radius.full,
    backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#F59E0B',
    alignSelf: 'flex-end', marginBottom: space.sm,
  },
  awaitingText: { fontFamily: fontFamily.bold, fontSize: 11, color: '#92400E' },
  finalBidSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: space.sm },
  commitmentCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6, padding: space.xs,
    borderRadius: radius.md, backgroundColor: colors.onPrimaryContainer,
  },
  commitmentTitle: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primaryContainer },
  commitmentText: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurface, fontStyle: 'italic' },
  matrixCard: {
    marginHorizontal: space.md, marginBottom: space.sm, padding: space.md,
    borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant,
  },
  matrixHeader: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.sm },
  matrixTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface, flex: 1 },
  guaranteedBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  guaranteedText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  matrixRow: { flexDirection: 'row', gap: space.sm, marginBottom: space.sm },
  matrixItem: {
    flex: 1, padding: space.sm, borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow, borderWidth: 1, borderColor: colors.outlineVariant,
  },
  matrixItemLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  matrixItemVal: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.onSurface },
  matrixItemSub: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  matrixNote: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurface, lineHeight: 18, marginBottom: space.sm },
  matrixFooter: { flexDirection: 'row', gap: space.md },
  matrixFooterItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  matrixFooterText: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  escrowNote: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginHorizontal: space.md, marginBottom: space.sm, justifyContent: 'center',
  },
  escrowNoteText: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant, textAlign: 'center', flex: 1 },
  dock: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant, gap: 8,
  },
  acceptBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm,
    height: touch.targetHero, backgroundColor: colors.primaryContainer, borderRadius: radius.lg,
    shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5,
  },
  acceptBtnText: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.onPrimary },
  counterBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    height: 44, borderWidth: 1.5, borderColor: colors.primaryContainer, borderRadius: radius.lg,
  },
  counterBtnText: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.primaryContainer },
  declineLink: { alignItems: 'center', paddingVertical: 4 },
  declineLinkText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.primaryContainer },
});
