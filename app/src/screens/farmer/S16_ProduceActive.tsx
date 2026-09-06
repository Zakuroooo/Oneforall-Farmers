/**
 * S16_ProduceActive — Screen 16: My Produce active listed lots with live bids.
 * Matched to Stitch `16_my_produce_active_listed_lots_bids/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React from 'react';
import {
  Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';

const farmerPortrait = require('../../assets/images/farmer_rambhau.jpg');
const redOnions = require('../../assets/images/red_onions.jpg');

export default function S16_ProduceActive({ navigation }: any) {
  const { t } = useT();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Image source={farmerPortrait} style={styles.avatar} />
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.farmerName}>Rambhau Patil</Text>
              <View style={styles.nipphadBadge}><Text style={styles.nipphadText}>Niphad</Text></View>
            </View>
            <View style={styles.locRow}>
              <Icon name="map-pin" size={11} color={colors.outline} />
              <Text style={styles.farmerLoc}>Lasalgaon Mandi Yard</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.listenBtn}>
          <Icon name="volume" size={13} color={colors.primary} />
          <Text style={styles.listenText}>{t('splash_listen')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Summary band */}
        <View style={styles.summaryBand}>
          <View style={styles.summaryLeft}>
            <View style={styles.inboxIcon}><Icon name="box" size={14} color={colors.primary} /></View>
            <Text style={styles.summaryTitle}>माझा एकूण शेतमाल</Text>
          </View>
          <View style={styles.offersTag}>
            <View style={styles.offersGreen} />
            <Text style={styles.offersText}>2 Lots · 5 Live Offers</Text>
          </View>
        </View>
        <Text style={styles.heading}>My Active Harvest</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Estimated Realization</Text>
            <Text style={styles.statAmount}>₹1,34,500</Text>
            <View style={styles.statHl}>
              <Icon name="trending-up" size={11} color={colors.tertiary} />
              <Text style={styles.statHlText}>Highest market quote</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total In Stock</Text>
            <Text style={styles.statAmount}>65 Qtl</Text>
            <Text style={styles.statSub}>130 Gunny Bags</Text>
          </View>
        </View>

        {/* Escrow strip */}
        <View style={styles.escrowStrip}>
          <Icon name="shield-check" size={14} color={colors.tertiary} />
          <Text style={styles.escrowStripText}>Mandi-Setu 100% Escrow Guarantee Active</Text>
          <Text style={styles.escrowStripTag}>सुरक्षित</Text>
        </View>

        {/* ─── Lot #LP-401 ─── */}
        <View style={styles.lotCard}>
          <View style={styles.lotCardHeader}>
            <View style={styles.lotIdTag}><Text style={styles.lotIdText}>Lot #LP-401</Text></View>
            <View style={styles.warehouseRow}>
              <Icon name="building" size={12} color={colors.onSurfaceVariant} />
              <Text style={styles.warehouseText}>Shriram Warehouse, N...</Text>
            </View>
            <View style={styles.gradeBadge}>
              <Icon name="check-circle" size={11} color={colors.tertiary} />
              <Text style={styles.gradeText}>Grade A · 850/1000</Text>
            </View>
          </View>

          <View style={styles.lotBody}>
            <Image source={redOnions} style={styles.lotPhoto} />
            <View style={styles.lotInfo}>
              <Text style={styles.lotVariety}>Nashik Red Onion</Text>
              <Text style={styles.lotVarietySub}>Gavran Special · 55mm+ Size</Text>
              <View style={styles.lotDetailRow}>
                <Text style={styles.lotDetailKey}>Quantity / वजन:</Text>
                <Text style={styles.lotDetailVal}>40 Qtl (80 Bags)</Text>
              </View>
              <View style={styles.lotDetailRow}>
                <Text style={styles.lotDetailKey}>Your Asking Price:</Text>
                <Text style={styles.lotDetailVal}>₹2,100 /Qtl</Text>
              </View>
              <View style={styles.topOfferRow}>
                <Text style={styles.topOfferLabel}>Top Offer (पुणे ट्रेडिंग):</Text>
                <Text style={styles.topOfferVal}>₹1,900 /Qtl</Text>
              </View>
              <Text style={styles.modalRef}>Lasalgaon APMC Modal: ₹2,050 /Qtl</Text>
            </View>
          </View>

          {/* Bidding live strip */}
          <View style={styles.biddingStrip}>
            <Icon name="zap" size={12} color="#F59E0B" />
            <Text style={styles.biddingText}>3 Verified Buyers Bidding Now</Text>
            <Text style={styles.biddingRound}>Round 2 of 3</Text>
          </View>
          <Text style={styles.biddingDesc}>
            Pune Trading Co (45km away) countered at ₹1,900/Qtl (Total ₹76,000 for full lot). Ready to lift tomorrow.
          </Text>

          <TouchableOpacity style={styles.viewOffersBtn}>
            <Text style={styles.viewOffersText}>View 3 Buyer Offers & Bargain (भाव करा)</Text>
            <Icon name="arrow-right" size={18} color={colors.onPrimary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.inspectRow}>
            <Icon name="clipboard" size={13} color={colors.primary} />
            <Text style={styles.inspectText}>Inspect Lot Quality Certificate & QR</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Lot #LP-402 ─── */}
        <View style={[styles.lotCard, { borderColor: colors.outlineVariant }]}>
          <View style={styles.lotCardHeader}>
            <View style={[styles.lotIdTag, { backgroundColor: colors.surfaceContainerHigh }]}>
              <Text style={[styles.lotIdText, { color: colors.onSurface }]}>Lot #LP-402</Text>
            </View>
            <View style={styles.warehouseRow}>
              <Icon name="map-pin" size={12} color={colors.onSurfaceVariant} />
              <Text style={styles.warehouseText}>Farm Gate, Niphad</Text>
            </View>
            <View style={[styles.gradeBadge, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
              <Text style={[styles.gradeText, { color: '#92400E' }]}>Grade B+ · 720/1000</Text>
            </View>
          </View>

          <View style={styles.lot2Row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.lotVariety}>Nashik Red Onion</Text>
              <Text style={styles.lotVarietySub}>Medium Bulb (45-50mm) · 25 Quintals (50 Bags)</Text>
            </View>
            <View style={styles.askingCol}>
              <Text style={styles.askingLabel}>Asking:</Text>
              <Text style={styles.askingPrice}>₹1,850</Text>
              <Text style={[styles.askingPrice, { fontSize: 20, color: colors.primary }]}>₹1,810</Text>
              <Text style={styles.askingUnit}>/Qtl</Text>
            </View>
          </View>

          <View style={styles.lot2Footer}>
            <View style={styles.buyerStrip}>
              <Icon name="handshake" size={12} color={colors.primary} />
              <Text style={styles.buyerStripText}>Nashik Agro Exports · ₹45,250 Total</Text>
            </View>
            <View style={styles.escrowReadyBadge}><Text style={styles.escrowReadyText}>ESCROW READY</Text></View>
          </View>
          <TouchableOpacity style={styles.reviewOffersRow}>
            <Text style={styles.reviewOffersText}>Review Offers (₹1,810/q)</Text>
            <Icon name="arrow-right" size={14} color={colors.primaryContainer} />
          </TouchableOpacity>
        </View>

        {/* Add another lot */}
        <TouchableOpacity style={styles.addLotCard}>
          <View style={styles.addLotIconBg}>
            <Icon name="camera" size={20} color={colors.primary} />
          </View>
          <Text style={styles.addLotTitle}>+ List Another Harvest Lot</Text>
          <Text style={styles.addLotSub}>नवीन शेतमालाची नोंद करा (AI Quality Scan)</Text>
          <Text style={styles.addLotDesc}>
            Snap 3 photos of your produce to instantly assay onion bulb sizing, skin retention, and get verified quotes.
          </Text>
        </TouchableOpacity>

        {/* WDRA card */}
        <View style={styles.wdraCard}>
          <View style={styles.wdraIconBg}><Icon name="shield-check" size={18} color={colors.tertiary} /></View>
          <Text style={styles.wdraText}>
            <Text style={styles.wdraBold}>WDRA Certified Warehouse Backing</Text>
            {'\n'}Both lots are insured against spillage, rot, and transit hazards. Guaranteed payment within 2 hours of weighment gate pass.
          </Text>
        </View>

        {/* Help row */}
        <View style={styles.helpCard}>
          <View style={styles.helpAvatar}><Text style={styles.helpAvatarText}>KB</Text></View>
          <View style={styles.helpInfo}>
            <Text style={styles.helpName}>Niphad Sahayak: Kishor Bhau</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineGreen} />
              <Text style={styles.onlineText}>Online at APMC Yard</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.callBtn}>
            <Icon name="phone" size={13} color={colors.primaryContainer} />
            <Text style={styles.callBtnText}>Call Sahayak</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: space.md, paddingTop: space.lg + 8, paddingBottom: space.sm,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: colors.outlineVariant },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  farmerName: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  nipphadBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  nipphadText: { fontFamily: fontFamily.bold, fontSize: 9, color: colors.tertiary },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  farmerLoc: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  listenBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full,
    backgroundColor: 'rgba(155,47,0,0.08)', borderWidth: 1, borderColor: 'rgba(155,47,0,0.15)',
  },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  scroll: { paddingBottom: 20 },
  summaryBand: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: space.md, paddingTop: space.md,
  },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  inboxIcon: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(155,47,0,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  summaryTitle: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primary },
  offersTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  offersGreen: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.tertiary },
  offersText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  heading: { fontFamily: fontFamily.extraBold, fontSize: 24, color: colors.onSurface, paddingHorizontal: space.md, marginTop: 4, marginBottom: space.sm, letterSpacing: -0.3 },
  statsRow: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.md, marginBottom: space.sm },
  statCard: {
    flex: 1, padding: space.sm, borderRadius: radius.lg,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant,
  },
  statLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  statAmount: { fontFamily: fontFamily.extraBold, fontSize: 20, color: colors.onSurface, marginTop: 2, letterSpacing: -0.3 },
  statHl: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  statHlText: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.tertiary },
  statSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  escrowStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: space.md, marginBottom: space.sm, padding: space.xs,
    paddingHorizontal: space.sm, borderRadius: radius.md,
    backgroundColor: colors.positiveContainer, borderWidth: 1, borderColor: 'rgba(4,120,87,0.2)',
  },
  escrowStripText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.tertiary, flex: 1 },
  escrowStripTag: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  lotCard: {
    marginHorizontal: space.md, marginBottom: space.md, borderRadius: radius.xl,
    backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary, overflow: 'hidden',
  },
  lotCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: space.xs,
    padding: space.sm, flexWrap: 'wrap',
  },
  lotIdTag: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  lotIdText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onPrimary },
  warehouseRow: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1 },
  warehouseText: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  gradeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer,
  },
  gradeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  lotBody: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.sm, paddingBottom: space.sm },
  lotPhoto: { width: 90, height: 100, borderRadius: radius.md },
  lotInfo: { flex: 1 },
  lotVariety: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  lotVarietySub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, marginBottom: 4 },
  lotDetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  lotDetailKey: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  lotDetailVal: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  topOfferRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 },
  topOfferLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  topOfferVal: { fontFamily: fontFamily.extraBold, fontSize: 15, color: colors.primaryContainer },
  modalRef: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.outline, marginTop: 2 },
  biddingStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: space.sm, paddingBottom: 4,
  },
  biddingText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface, flex: 1 },
  biddingRound: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  biddingDesc: {
    fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant,
    paddingHorizontal: space.sm, paddingBottom: space.sm, lineHeight: 17,
  },
  viewOffersBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm,
    margin: space.sm, marginTop: 0, height: touch.targetMin,
    backgroundColor: colors.primaryContainer, borderRadius: radius.lg,
  },
  viewOffersText: { fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.onPrimary },
  inspectRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center',
    paddingBottom: space.sm,
  },
  inspectText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primary },
  lot2Row: {
    flexDirection: 'row', alignItems: 'flex-start', gap: space.sm,
    paddingHorizontal: space.sm, paddingBottom: space.xs,
  },
  askingCol: { alignItems: 'flex-end' },
  askingLabel: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.onSurfaceVariant },
  askingPrice: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.outline, textDecorationLine: 'line-through' },
  askingUnit: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  lot2Footer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.sm, gap: space.sm, paddingBottom: space.xs },
  buyerStrip: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  buyerStripText: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurface },
  escrowReadyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  escrowReadyText: { fontFamily: fontFamily.bold, fontSize: 9, color: colors.tertiary, letterSpacing: 0.5 },
  reviewOffersRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingBottom: space.sm,
  },
  reviewOffersText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primaryContainer },
  addLotCard: {
    marginHorizontal: space.md, marginBottom: space.sm, padding: space.md,
    borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.outlineVariant,
    borderStyle: 'dashed', alignItems: 'center', backgroundColor: colors.surface,
  },
  addLotIconBg: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(155,47,0,0.08)',
    alignItems: 'center', justifyContent: 'center', marginBottom: space.xs,
  },
  addLotTitle: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.primary, textAlign: 'center' },
  addLotSub: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 2 },
  addLotDesc: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 6, lineHeight: 16 },
  wdraCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: space.sm,
    marginHorizontal: space.md, marginBottom: space.sm, padding: space.sm,
    borderRadius: radius.lg, backgroundColor: colors.positiveContainer,
    borderWidth: 1, borderColor: 'rgba(4,120,87,0.2)',
  },
  wdraIconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(4,120,87,0.12)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  wdraText: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onPositiveContainer, flex: 1, lineHeight: 17 },
  wdraBold: { fontFamily: fontFamily.bold },
  helpCard: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    marginHorizontal: space.md, marginBottom: space.md, padding: space.sm,
    borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant,
  },
  helpAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  helpAvatarText: { fontFamily: fontFamily.extraBold, fontSize: 13, color: colors.onPrimary },
  helpInfo: { flex: 1 },
  helpName: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  onlineGreen: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.tertiary },
  onlineText: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  callBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.primaryContainer,
  },
  callBtnText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primaryContainer },
});
