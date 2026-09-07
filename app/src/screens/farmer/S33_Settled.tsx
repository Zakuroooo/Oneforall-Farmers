/**
 * S33_Settled — Screen 33: Settled deal receipt + ₹7,200 gain proof.
 * Matched to Stitch `33_settled_verified_harvest_receipt_7_200_gain_proof/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';
import { ListenButton } from '../../components/ui/ListenButton';

const mandiWarehouse = require('../../assets/images/mandi_warehouse.jpg');

export default function S33_Settled({ navigation }: any) {
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
          <View style={styles.settledBadge}>
            <Icon name="check-circle" size={12} color={colors.tertiary} />
            <Text style={styles.settledBadgeText}>{t('settled_badge')}</Text>
          </View>
          <Text style={styles.headerTitle}>{t('settled_header')}</Text>
        </View>
        <ListenButton text={t('settled_net_key')} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* RTGS success card */}
        <View style={styles.rtgsCard}>
          <View style={styles.rtgsIconRow}>
            <View style={styles.rtgsCheckCircle}><Icon name="check-circle" size={28} color={colors.onPrimary} /></View>
            <View style={styles.rtgsInfo}>
              <Text style={styles.rtgsLabel}>{t('settled_rtgs_label')}</Text>
              <Text style={styles.rtgsMeta}>{t('settled_rtgs_meta')}</Text>
              <Text style={styles.rtgsDate}>{t('settled_rtgs_date')}</Text>
            </View>
          </View>
          <Text style={styles.rtgsAmt}>{t('settled_rtgs_amt')} <Text style={styles.rtgsAmtSub}>{t('settled_rtgs_amt_sub')}</Text></Text>
          <View style={styles.bankRow}>
            <Icon name="building" size={13} color={colors.onSurfaceVariant} />
            <Text style={styles.bankName}>{t('settled_bank_name')}</Text>
            <Text style={styles.bankAcNo}>{t('settled_bank_ac')}</Text>
          </View>
        </View>

        {/* Gain proof card */}
        <View style={styles.gainCard}>
          <View style={styles.gainHeader}>
            <Icon name="trending-up" size={16} color={colors.primary} />
            <Text style={styles.gainTitle}>{t('settled_gain_title')}</Text>
            <View style={styles.gainPctBadge}><Text style={styles.gainPctText}>{t('settled_gain_pct')}</Text></View>
          </View>
          <Text style={styles.gainBannerSub}>{t('settled_gain_sub')}</Text>

          <View style={styles.gainAmtRow}>
            <Icon name="trending-up" size={18} color={colors.tertiary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.gainAmtLabel}>{t('settled_gain_amt')}</Text>
              <Text style={styles.gainAmtDesc}>{t('settled_gain_desc')}</Text>
            </View>
          </View>

          <View style={styles.gainCompareRow}>
            <View style={styles.gainCompareItem}>
              <Text style={styles.gainCompareDayLabel}>{t('settled_day0_label')}</Text>
              <Text style={styles.gainCompareDate}>{t('settled_day0_date')}</Text>
              <Text style={styles.gainCompareRate}>{t('settled_day0_rate')}</Text>
              <Text style={styles.gainCompareTotal}>{t('settled_day0_total')}</Text>
              <View style={styles.mandiModeTag}><Text style={styles.mandiModeTagText}>{t('settled_day0_tag')}</Text></View>
            </View>
            <View style={styles.gainCompareDivider} />
            <View style={styles.gainCompareItem}>
              <Text style={styles.gainCompareDayLabel}>{t('settled_day11_label')}</Text>
              <Text style={styles.gainCompareDate}>{t('settled_day11_date')}</Text>
              <Text style={[styles.gainCompareRate, { color: colors.tertiary }]}>{t('settled_day11_rate')}</Text>
              <Text style={styles.gainCompareTotal}>{t('settled_day11_total')}</Text>
              <View style={styles.teziBadge}><Text style={styles.teziBadgeText}>{t('settled_day11_tag')}</Text></View>
            </View>
          </View>

          <View style={styles.gainBreakdown}>
            <View style={styles.gainBreakdownRow}>
              <Text style={styles.gainBreakdownKey}>{t('settled_brk_diff_key')}</Text>
              <Text style={[styles.gainBreakdownVal, { color: colors.tertiary }]}>{t('settled_brk_diff_val')}</Text>
            </View>
            <View style={styles.gainBreakdownRow}>
              <Text style={styles.gainBreakdownKey}>{t('settled_brk_cost_key')}</Text>
              <Text style={[styles.gainBreakdownVal, { color: colors.critical }]}>{t('settled_brk_cost_val')}</Text>
            </View>
            <View style={[styles.gainBreakdownRow, styles.gainNetRow]}>
              <Text style={styles.gainNetKey}>{t('settled_net_key')}</Text>
              <Text style={styles.gainNetVal}>{t('settled_net_val')}</Text>
            </View>
          </View>
        </View>

        {/* Lot photo + details */}
        <View style={styles.lotCard}>
          <View style={styles.lotCardHeader}>
            <Text style={styles.lotCardTitle}>{t('settled_lot_title')}</Text>
            <View style={styles.gradeABadge}><Text style={styles.gradeAText}>{t('settled_lot_grade')}</Text></View>
          </View>
          <Text style={styles.lotProductName}>{t('settled_lot_name')}</Text>
          <View style={styles.lotPhotoContainer}>
            <Image source={mandiWarehouse} style={styles.lotPhoto} />
            <View style={styles.lotPhotoCaption}>
              <Icon name="check-circle" size={11} color={colors.tertiary} />
              <Text style={styles.lotPhotoCaptionText}>{t('settled_lot_caption')}</Text>
            </View>
          </View>
          <View style={styles.lotMetaRow}>
            <View style={styles.lotMetaItem}>
              <Text style={styles.lotMetaKey}>{t('settled_meta_farmer_key')}</Text>
              <Text style={styles.lotMetaVal}>{t('settled_meta_farmer_val')}</Text>
            </View>
            <View style={styles.lotMetaItem}>
              <Text style={styles.lotMetaKey}>{t('settled_meta_buyer_key')}</Text>
              <Text style={styles.lotMetaVal}>{t('settled_meta_buyer_val')}</Text>
            </View>
          </View>
        </View>

        {/* APMC receipt table */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Icon name="clipboard" size={14} color={colors.primary} />
            <Text style={styles.receiptTitle}>{t('settled_rcpt_title')}</Text>
            <View style={styles.eTaxBadge}><Text style={styles.eTaxText}>{t('settled_rcpt_etax')}</Text></View>
          </View>
          <View style={styles.receiptDharmaRow}>
            <Icon name="scale" size={13} color={colors.onSurfaceVariant} />
            <Text style={styles.receiptDharmaText}>{t('settled_rcpt_dharma')}</Text>
            <View style={styles.certBadge}><Text style={styles.certText}>{t('settled_rcpt_cert')}</Text></View>
          </View>
          <Text style={styles.receiptDharmaSub}>{t('settled_rcpt_sub')}</Text>
          <View style={styles.receiptTable}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptRowLabel}>{t('settled_row_gross_label')}</Text>
              <Text style={styles.receiptRowVal}>{t('settled_row_gross_val')}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptRowLabel}>{t('settled_row_deduct_label')}</Text>
              <Text style={[styles.receiptRowVal, { color: colors.critical }]}>{t('settled_row_deduct_val')}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptRowLabel}>{t('settled_row_tax_label')}</Text>
              <Text style={styles.receiptRowVal}>{t('settled_row_tax_val')}</Text>
            </View>
            <View style={[styles.receiptRow, styles.receiptNetRow]}>
              <Text style={styles.receiptNetLabel}>{t('settled_net_payout_label')}</Text>
              <Text style={styles.receiptNetVal}>{t('settled_net_payout_val')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CTA dock */}
      <View style={styles.dock}>
        <TouchableOpacity style={styles.downloadBtn}>
          <Icon name="clipboard" size={16} color={colors.onPrimary} />
          <Text style={styles.downloadBtnText}>{t('settled_btn_download')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn}>
          <Icon name="share" size={14} color={colors.tertiary} />
          <Text style={styles.shareBtnText}>{t('settled_btn_share')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextLotBtn}>
          <Text style={styles.nextLotBtnText}>{t('settled_btn_next')}</Text>
          <Icon name="arrow-right" size={14} color={colors.primaryContainer} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingTop: space.xl + 8, paddingBottom: space.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  settledBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settledBadgeText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  headerTitle: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.onSurface },
  listenBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(155,47,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 200 },
  rtgsCard: { margin: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md },
  rtgsIconRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, marginBottom: space.sm },
  rtgsCheckCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.tertiary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rtgsInfo: { flex: 1 },
  rtgsLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.tertiary },
  rtgsMeta: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  rtgsDate: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant },
  rtgsAmt: { fontFamily: fontFamily.extraBold, fontSize: 32, color: colors.tertiary, letterSpacing: -0.5, marginBottom: space.xs },
  rtgsAmtSub: { fontFamily: fontFamily.medium, fontSize: 14, color: colors.onSurfaceVariant },
  bankRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  bankName: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface, flex: 1 },
  bankAcNo: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurface },
  gainCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.onPrimaryContainer, borderWidth: 2, borderColor: colors.primaryContainer, overflow: 'hidden', padding: space.md },
  gainHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  gainTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.primary, flex: 1 },
  gainPctBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  gainPctText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  gainBannerSub: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, marginBottom: space.sm },
  gainAmtRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: space.sm, borderRadius: radius.lg, backgroundColor: colors.positiveContainer, marginBottom: space.sm },
  gainAmtLabel: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.tertiary },
  gainAmtDesc: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onPositiveContainer, lineHeight: 17 },
  gainCompareRow: { flexDirection: 'row', marginBottom: space.sm, borderRadius: radius.lg, backgroundColor: colors.surface, overflow: 'hidden' },
  gainCompareItem: { flex: 1, padding: space.sm },
  gainCompareDivider: { width: 1, backgroundColor: colors.outlineVariant },
  gainCompareDayLabel: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurfaceVariant, marginBottom: 2 },
  gainCompareDate: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  gainCompareRate: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.onSurface },
  gainCompareTotal: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurface, marginBottom: 4 },
  mandiModeTag: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: 'rgba(220,38,38,0.1)' },
  mandiModeTagText: { fontFamily: fontFamily.bold, fontSize: 9, color: colors.critical },
  teziBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: colors.positiveContainer },
  teziBadgeText: { fontFamily: fontFamily.bold, fontSize: 9, color: colors.tertiary },
  gainBreakdown: { borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingTop: space.sm },
  gainBreakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  gainBreakdownKey: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurface, flex: 1, paddingRight: space.sm },
  gainBreakdownVal: { fontFamily: fontFamily.bold, fontSize: 13 },
  gainNetRow: { borderTopWidth: 1, borderTopColor: colors.primaryContainer, paddingTop: 6, marginTop: 4 },
  gainNetKey: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primary, flex: 1 },
  gainNetVal: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.tertiary },
  lotCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' },
  lotCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  lotCardTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurfaceVariant },
  gradeABadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  gradeAText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  lotProductName: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.onSurface, padding: space.sm, paddingBottom: space.xs },
  lotPhotoContainer: { position: 'relative' },
  lotPhoto: { width: '100%', height: 130 },
  lotPhotoCaption: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full, backgroundColor: 'rgba(0,0,0,0.5)' },
  lotPhotoCaptionText: { fontFamily: fontFamily.bold, fontSize: 11, color: '#fff' },
  lotMetaRow: { flexDirection: 'row', padding: space.sm, gap: space.md },
  lotMetaItem: { flex: 1 },
  lotMetaKey: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.onSurfaceVariant },
  lotMetaVal: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  receiptCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' },
  receiptHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  receiptTitle: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primary, flex: 1 },
  eTaxBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: colors.positiveContainer },
  eTaxText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  receiptDharmaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: space.sm, paddingTop: space.xs },
  receiptDharmaText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface, flex: 1 },
  certBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: colors.onPrimaryContainer },
  certText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.primaryContainer },
  receiptDharmaSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, paddingHorizontal: space.sm, paddingBottom: space.xs },
  receiptTable: { borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.sm, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  receiptRowLabel: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurface, flex: 1 },
  receiptRowVal: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  receiptNetRow: { backgroundColor: colors.surfaceContainerLow },
  receiptNetLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.tertiary, flex: 1 },
  receiptNetVal: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.tertiary },
  dock: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant, gap: 8 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: touch.targetHero, backgroundColor: colors.primaryContainer, borderRadius: radius.lg, shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  downloadBtnText: { fontFamily: fontFamily.extraBold, fontSize: 13, color: colors.onPrimary },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: touch.targetMin, borderRadius: radius.lg, backgroundColor: colors.positiveContainer },
  shareBtnText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.tertiary },
  nextLotBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  nextLotBtnText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primaryContainer },
});
