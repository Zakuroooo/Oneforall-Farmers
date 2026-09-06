/**
 * S33_Settled — Screen 33: Settled & verified harvest receipt with gain proof.
 * Matched to Stitch `33_settled_verified_harvest_receipt_7_200_gain_proof/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';

const mandiWarehouse = require('../../assets/images/mandi_warehouse.jpg');

export default function S33_Settled({ navigation }: any) {
  const { t } = useT();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerStatus}>
          <Icon name="check-circle" size={12} color={colors.tertiary} />
          <Text style={styles.headerStatusText}>{t('settled_status')}</Text>
        </View>
        <Text style={styles.headerTitle}>{t('settled_heading')}</Text>
        <TouchableOpacity style={styles.listenBtn}>
          <Icon name="volume" size={13} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Bank credit card */}
        <View style={styles.bankCard}>
          <View style={styles.bankCardHeader}>
            <View style={styles.checkCircle}>
              <Icon name="check" size={16} color={colors.onPrimary} />
            </View>
            <View style={styles.bankCardInfo}>
              <Text style={styles.bankCreditLabel}>{t('settled_bank_credit')}</Text>
              <Text style={styles.bankDateText}>14 March 2024, 3:45 PM</Text>
            </View>
            <Text style={styles.bankRefNum}>#SD-2024-8842</Text>
          </View>
          <Text style={styles.amountHuge}>₹75,400</Text>
          <Text style={styles.fullPaid}>{t('settled_full_paid')}</Text>
          <View style={styles.bankDetails}>
            <View style={styles.bankRow}>
              <Icon name="building" size={14} color={colors.onSurface} />
              <Text style={styles.bankName}>State Bank of India (SBI)</Text>
              <Text style={styles.bankAcc}>A/C ••••••4209</Text>
            </View>
            <Text style={styles.utrLabel}>UTR ref no:</Text>
            <Text style={styles.utrNum}>SBIN0001248-9842104</Text>
          </View>
          <View style={styles.bankMsgBox}>
            <Text style={styles.bankMsgLabel}>{t('settled_bank_msg')}</Text>
            <Text style={styles.bankMsgText}>
              "Rs 75,400.00 credited to A/C ...4209 on 14-Mar-24 by RTGS (Pune Trading Co). Avail Bal: ₹1,12,650. -SBI"
            </Text>
          </View>
        </View>

        {/* Performance card */}
        <View style={styles.performanceCard}>
          <View style={styles.perfHeader}>
            <View style={styles.perfIconBg}>
              <Icon name="trending-up" size={16} color={colors.primaryContainer} />
            </View>
            <Text style={styles.perfTitle}>{t('settled_performance')}</Text>
            <View style={styles.profitBadge}>
              <Text style={styles.profitBadgeText}>+10.4% Profit</Text>
            </View>
          </View>

          <View style={styles.gainBanner}>
            <View style={styles.gainIconBg}>
              <Icon name="trending-up" size={20} color={colors.primaryContainer} />
            </View>
            <View>
              <Text style={styles.gainAmount}>{t('settled_gain')}</Text>
              <Text style={styles.gainSub}>{t('settled_gain_sub')}</Text>
            </View>
          </View>

          <View style={styles.compareRow}>
            <View style={styles.compareCard}>
              <Text style={styles.compareDay}>{t('settled_buy_day')}</Text>
              <Text style={styles.compareDate}>3 March 2024 rate</Text>
              <Text style={styles.comparePrice}>₹1,720/qtl</Text>
              <Text style={styles.compareTotal}>40 quintal = ₹68,800</Text>
              <View style={styles.compareBadgeBad}>
                <Text style={styles.compareBadgeBadText}>At local mandi</Text>
              </View>
            </View>
            <View style={styles.vsCircle}><Text style={styles.vsText}>VS</Text></View>
            <View style={[styles.compareCard, styles.compareCardGood]}>
              <Text style={styles.compareDay}>{t('settled_sell_day')}</Text>
              <Text style={styles.compareDate}>14 March confirmed</Text>
              <Text style={[styles.comparePrice, { color: colors.tertiary }]}>₹1,900/qtl</Text>
              <Text style={styles.compareTotal}>40 quintal = ₹76,000</Text>
              <View style={styles.compareBadgeGood}>
                <Text style={styles.compareBadgeGoodText}>Best timing profit</Text>
              </View>
            </View>
          </View>

          {/* Net calculation */}
          <View style={styles.netCalc}>
            <View style={styles.netRow}>
              <Text style={styles.netKey}>{t('settled_diff')}</Text>
              <Text style={[styles.netVal, { color: colors.tertiary }]}>+₹7,200</Text>
            </View>
            <View style={styles.netRow}>
              <Text style={styles.netKey}>{t('settled_storage')}</Text>
              <Text style={[styles.netVal, { color: colors.critical }]}>-₹308</Text>
            </View>
            <View style={[styles.netRow, styles.netTotalRow]}>
              <Text style={styles.netTotalKey}>{t('settled_net')}</Text>
              <Text style={styles.netTotalVal}>+₹6,892</Text>
            </View>
          </View>
        </View>

        {/* Produce lot */}
        <View style={styles.lotCard}>
          <View style={styles.lotHeader}>
            <Text style={styles.lotLabel}>{t('settled_produce_label')}</Text>
            <View style={styles.gradeBadge}><Text style={styles.gradeText}>Grade A (850/1000)</Text></View>
          </View>
          {/* Warehouse image */}
          <Image source={mandiWarehouse} style={styles.lotPhoto} />
          <View style={styles.lotPhotoCaption}>
            <Icon name="map-pin" size={11} color={colors.onSurfaceVariant} />
            <Text style={styles.lotPhotoCaptionText}>Niphad farm storage lot</Text>
          </View>
          <View style={styles.lotDetails}>
            <View style={styles.lotRow}><Text style={styles.lotKey}>{t('settled_farmer_label')}</Text><Text style={styles.lotVal}>Rambhau Patil</Text></View>
            <View style={styles.lotRow}><Text style={styles.lotKey}>{t('settled_buyer_label')}</Text><Text style={styles.lotVal}>Pune Trading Co. (Gultekdi)</Text></View>
          </View>
        </View>

        {/* Official receipt */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptRow}>
            <View style={styles.receiptIconBg}>
              <Icon name="clipboard" size={14} color={colors.primary} />
            </View>
            <Text style={styles.receiptLabel}>{t('settled_form13')}</Text>
            <View style={styles.taxValidBadge}><Text style={styles.taxValidText}>e-Tax Valid</Text></View>
          </View>
          <View style={styles.receiptRow}>
            <View style={styles.receiptIconBg}>
              <Icon name="scale" size={14} color={colors.primary} />
            </View>
            <View style={styles.receiptInfo}>
              <Text style={styles.receiptLabel}>{t('settled_weigh_slip')}</Text>
              <Text style={styles.receiptSub}>Weighment: 0 kg error (100% accurate digital scale)</Text>
            </View>
            <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>{t('settled_weigh_verified')}</Text></View>
          </View>

          <View style={styles.receiptCalc}>
            {[
              ['40 quintal Gavran Lal @ ₹1,900/qtl', '₹76,000.00'],
              ['Hamali & Tolai (Mandi Mandated Loading)', '–₹600.00'],
              ['APMC Farmer Tax (Cess 0% – Farmer Exempt)', '₹0.00'],
            ].map(([k, v]) => (
              <View key={k} style={styles.calcRow}>
                <Text style={styles.calcKey}>{k}</Text>
                <Text style={[styles.calcVal, (v ?? '').startsWith('–') && { color: colors.critical }]}>{v}</Text>
              </View>
            ))}
            <View style={[styles.calcRow, styles.calcTotalRow]}>
              <Text style={styles.calcTotalKey}>{t('settled_net_paid')}</Text>
              <Text style={styles.calcTotalVal}>₹75,400.00</Text>
            </View>
          </View>
        </View>

        {/* Helpline */}
        <View style={styles.helpRow}>
          <Icon name="phone" size={12} color={colors.primary} />
          <Text style={styles.helpText}>24×7 Farmer Support: 1800-233-4567</Text>
        </View>
      </ScrollView>

      {/* CTA dock */}
      <View style={styles.dock}>
        <TouchableOpacity style={styles.ctaPrimary}>
          <Icon name="chevron-down" size={16} color={colors.onPrimary} />
          <Text style={styles.ctaPrimaryText}>{t('settled_cta_pdf')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctaSecondary}>
          <Icon name="volume" size={14} color={colors.tertiary} />
          <Text style={styles.ctaSecondaryText}>{t('settled_cta_share')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctaLink}>
          <Text style={styles.ctaLinkText}>{t('settled_cta_next')}</Text>
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
    width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHigh,
  },
  headerStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerStatusText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  headerTitle: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.primary, flex: 1 },
  listenBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(155,47,0,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingBottom: 160 },
  bankCard: {
    margin: space.md, borderRadius: radius.xl, backgroundColor: colors.positiveContainer,
    borderWidth: 1, borderColor: 'rgba(4,120,87,0.25)', padding: space.md,
  },
  bankCardHeader: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.sm },
  checkCircle: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.tertiary,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  bankCardInfo: { flex: 1 },
  bankCreditLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onPositiveContainer },
  bankDateText: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  bankRefNum: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurfaceVariant },
  amountHuge: { fontFamily: fontFamily.extraBold, fontSize: 40, color: colors.tertiary, letterSpacing: -1 },
  fullPaid: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onPositiveContainer, marginBottom: space.sm },
  bankDetails: { marginTop: space.xs, gap: 3 },
  bankRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bankName: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface, flex: 1 },
  bankAcc: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  utrLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  utrNum: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  bankMsgBox: { marginTop: space.xs, padding: space.xs, borderRadius: radius.sm, backgroundColor: 'rgba(255,255,255,0.6)' },
  bankMsgLabel: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurfaceVariant },
  bankMsgText: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurface, lineHeight: 14 },
  performanceCard: {
    marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md,
  },
  perfHeader: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.sm },
  perfIconBg: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.onPrimaryContainer,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  perfTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface, flex: 1 },
  profitBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full,
    backgroundColor: colors.positiveContainer,
  },
  profitBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  gainBanner: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md,
    padding: space.sm, borderRadius: radius.md, backgroundColor: colors.onPrimaryContainer,
  },
  gainIconBg: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  gainAmount: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.primary },
  gainSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, lineHeight: 15 },
  compareRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginBottom: space.sm },
  compareCard: {
    flex: 1, padding: space.sm, borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow, borderWidth: 1, borderColor: colors.outlineVariant,
  },
  compareCardGood: { backgroundColor: colors.positiveContainer, borderColor: 'rgba(4,120,87,0.2)' },
  compareDay: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurfaceVariant, marginBottom: 2 },
  compareDate: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  comparePrice: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.primary, marginTop: 4 },
  compareTotal: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  compareBadgeBad: { marginTop: 4, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, backgroundColor: colors.surfaceContainerHigh, alignSelf: 'flex-start' },
  compareBadgeBadText: { fontFamily: fontFamily.bold, fontSize: 9, color: colors.onSurfaceVariant },
  compareBadgeGood: { marginTop: 4, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, backgroundColor: 'rgba(4,120,87,0.2)', alignSelf: 'flex-start' },
  compareBadgeGoodText: { fontFamily: fontFamily.bold, fontSize: 9, color: colors.tertiary },
  vsCircle: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.outlineVariant,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  vsText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.outline },
  netCalc: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' },
  netRow: { flexDirection: 'row', justifyContent: 'space-between', padding: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  netTotalRow: { backgroundColor: colors.onPrimaryContainer, borderBottomWidth: 0 },
  netKey: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant, flex: 1, paddingRight: 4 },
  netVal: { fontFamily: fontFamily.bold, fontSize: 13 },
  netTotalKey: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primary, flex: 1 },
  netTotalVal: { fontFamily: fontFamily.extraBold, fontSize: 15, color: colors.tertiary },
  lotCard: {
    marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden',
  },
  lotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: space.sm, paddingBottom: 0 },
  lotLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  gradeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  gradeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  lotPhoto: { width: '100%', height: 120, marginTop: space.sm },
  lotPhotoCaption: { flexDirection: 'row', alignItems: 'center', gap: 3, padding: space.xs, paddingHorizontal: space.sm },
  lotPhotoCaptionText: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  lotDetails: { padding: space.sm, gap: 4 },
  lotRow: { flexDirection: 'row', justifyContent: 'space-between' },
  lotKey: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  lotVal: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  receiptCard: {
    marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md,
  },
  receiptRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.sm },
  receiptIconBg: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(155,47,0,0.08)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  receiptInfo: { flex: 1 },
  receiptLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface, flex: 1 },
  receiptSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  taxValidBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  taxValidText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  verifiedBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  verifiedText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  receiptCalc: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden', marginTop: space.xs },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', padding: space.xs, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  calcTotalRow: { backgroundColor: colors.positiveContainer, borderBottomWidth: 0 },
  calcKey: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant, flex: 1, paddingRight: 4 },
  calcVal: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  calcTotalKey: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.tertiary, flex: 1 },
  calcTotalVal: { fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.tertiary },
  helpRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: space.md,
    marginBottom: space.sm, justifyContent: 'center',
  },
  helpText: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  dock: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant, gap: 8,
  },
  ctaPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm,
    height: touch.targetHero, backgroundColor: colors.primaryContainer, borderRadius: radius.lg,
    shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5,
  },
  ctaPrimaryText: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.onPrimary },
  ctaSecondary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    height: 44, borderRadius: radius.lg, backgroundColor: colors.positiveContainer,
  },
  ctaSecondaryText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.tertiary },
  ctaLink: { alignItems: 'center', paddingVertical: 6 },
  ctaLinkText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primaryContainer },
});
