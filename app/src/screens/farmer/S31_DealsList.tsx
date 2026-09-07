/**
 * S31_DealsList — Screen 31: All deals — active escrow, in transit, completed.
 * Matched to Stitch `31_deals_list_active_escrow_in_transit_completed/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React, { useState } from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';
import { useAuth } from '../../lib/auth';
import { ListenButton } from '../../components/ui/ListenButton';

const redOnions = require('../../assets/images/red_onions.jpg');

type Tab = 'escrow' | 'transit' | 'settled';

export default function S31_DealsList({ navigation }: any) {
  const { t } = useT();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('escrow');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.farmerAvatar}>
          <Icon name="leaf" size={16} color={colors.onPrimary} />
        </View>
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerMandi}>{t('deals_header_mandi')}</Text>
            <View style={styles.apmcBadge}><Text style={styles.apmcBadgeText}>APMC</Text></View>
          </View>
          <Text style={styles.headerFarmer}>{user?.name ?? ''}</Text>
        </View>
        <ListenButton text={t('deals_page_title')} />
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>{t('deals_page_title')}</Text>
        <View style={styles.escrowGuaranteeRow}>
          <Icon name="shield-check" size={13} color={colors.tertiary} />
          <Text style={styles.escrowGuaranteeText}>{t('deals_escrow_guaranteed')}</Text>
        </View>
      </View>

      {/* Summary card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <View style={styles.summaryIconBg}><Icon name="building" size={18} color={colors.primary} /></View>
          <View>
            <Text style={styles.summaryLabel}>{t('deals_summary_label', { count: '3' })}</Text>
            <Text style={styles.summaryAmt}>{t('deals_summary_amount', { amount: '₹1,80,600' })}</Text>
          </View>
        </View>
        <View style={styles.activeBadge}>
          <Text style={styles.activeText}>{t('deals_active_badge', { count: '3' })}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {([
          { key: 'escrow', label: t('deals_tab_escrow_label'), sub: t('deals_tab_escrow_sub') },
          { key: 'transit', label: t('deals_tab_transit_label'), sub: t('deals_tab_transit_sub') },
          { key: 'settled', label: t('deals_tab_settled_label'), sub: t('deals_tab_settled_sub') },
        ] as { key: Tab; label: string; sub: string }[]).map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
            <Text style={styles.tabSub}>{tab.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Escrow guarantee banner */}
        <View style={styles.escrowBanner}>
          <View style={styles.escrowBannerIcon}><Icon name="shield-check" size={16} color={colors.tertiary} /></View>
          <Text style={styles.escrowBannerText}>{t('deals_escrow_banner_text')}</Text>
        </View>

        {/* Active deal card — SD-2024-8842 */}
        <View style={styles.dealCard}>
          <View style={styles.dealCardHeader}>
            <Text style={styles.dealRef}>{t('deals_ref_label', { id: 'SD-2024-8842' })}</Text>
            <View style={styles.escrowActiveBadge}>
              <View style={styles.liveGreen} />
              <Text style={styles.escrowActiveBadgeText}>{t('deals_status_escrow_planned')}</Text>
            </View>
          </View>

          <View style={styles.dealProductRow}>
            <View style={styles.dealProductInfo}>
              <View style={styles.dealTitleRow}>
                <Text style={styles.dealProductName}>{t('deals_demo_commodity_1')}</Text>
                <View style={styles.gradeABadge}><Text style={styles.gradeAText}>{t('lot_grade_a')}</Text></View>
              </View>
              <Text style={styles.dealProductSub}>{t('deals_quality_score', { score: '840' })}</Text>
            </View>
            <Image source={redOnions} style={styles.dealThumb} />
          </View>

          <View style={styles.dealMetaRow}>
            <View style={styles.dealMetaItem}>
              <Icon name="box" size={11} color={colors.onSurfaceVariant} />
              <Text style={styles.dealMetaLabel}>{t('deals_weight_bags_label')}</Text>
              <Text style={styles.dealMetaVal}>{t('deals_weight_bags_value', { qty: '40', bags: '80' })}</Text>
            </View>
            <View style={styles.dealMetaItem}>
              <Icon name="lock" size={11} color={colors.tertiary} />
              <Text style={styles.dealMetaLabel}>{t('deals_escrow_held_label')}</Text>
              <Text style={[styles.dealMetaVal, { color: colors.tertiary }]}>₹75,400</Text>
            </View>
          </View>
          <View style={styles.dealMetaRow2}>
            <Text style={styles.dealRateText}>{t('deals_rate_label', { rate: '₹1,900' })}</Text>
            <Text style={styles.dealNetLabel}>{t('deals_net_label')}</Text>
          </View>

          <View style={styles.dealBuyerRow}>
            <Icon name="building" size={13} color={colors.onSurfaceVariant} />
            <Text style={styles.dealBuyerName}>{t('demo_buyer_company_name')}</Text>
            <Text style={styles.dealBuyerSub}>{t('deals_buyer_location_1')}</Text>
            <View style={styles.dealBuyerRating}>
              <Icon name="star" size={10} color="#F59E0B" />
              <Text style={styles.dealBuyerRatingText}>{t('deals_buyer_rating', { rating: '4.9', count: '120' })}</Text>
            </View>
          </View>

          <View style={styles.nextStepRow}>
            <Icon name="truck" size={13} color={colors.primaryContainer} />
            <View>
              <Text style={styles.nextStepLabel}>{t('deals_next_step_label')}</Text>
              <Text style={styles.nextStepText}>{t('deals_next_step_text')}</Text>
            </View>
          </View>

          <View style={styles.dealCtaRow}>
            <TouchableOpacity style={styles.trackBtn} onPress={() => navigation.navigate('S32_DealTracking')}>
              <View style={styles.liveGreen} />
              <Text style={styles.trackBtnText}>{t('deals_track_btn')}</Text>
              <Icon name="arrow-right" size={13} color={colors.onPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.receiptBtn} onPress={() => navigation.navigate('S33_Settled')}>
              <Icon name="clipboard" size={14} color={colors.primary} />
              <Text style={styles.receiptBtnText}>{t('deals_receipt_btn')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* In-transit deal — SD-2024-8715 */}
        <View style={[styles.dealCard, styles.dealCardTransit]}>
          <View style={styles.dealCardHeader}>
            <Text style={styles.dealRef}>{t('deals_ref_label', { id: 'SD-2024-8715' })}</Text>
            <View style={styles.transitBadge}>
              <Icon name="truck" size={11} color={colors.primaryContainer} />
              <Text style={styles.transitBadgeText}>{t('deals_transit_status')}</Text>
            </View>
          </View>

          <View style={styles.transitProductRow}>
            <Text style={styles.transitProductName}>{t('deals_demo_commodity_2')}</Text>
            <Text style={styles.transitAmt}>₹1,12,500</Text>
          </View>
          <Text style={styles.transitSubText}>{t('deals_transit_subtext', { qty: '25', pct: '8.4' })}</Text>
          <View style={styles.transitBuyerRow}>
            <Icon name="map-pin" size={10} color={colors.onSurfaceVariant} />
            <Text style={styles.transitBuyerText}>
              {t('deals_transit_buyer', { fpo: 'Sahyadri Farmers FPO, Mohadi', time: '12:30' })}
            </Text>
          </View>
          <View style={styles.transitSbiRow}>
            <Text style={styles.transitSbiText}>{t('deals_transit_bank_status')}</Text>
          </View>

          <View style={styles.progressSteps}>
            {[
              t('deals_progress_escrow'),
              t('deals_progress_weight'),
              t('deals_progress_dispatch'),
              t('deals_progress_bank'),
            ].map((s, i) => (
              <View key={i} style={styles.progressStep}>
                <View style={[styles.progressStepDot, i < 3 && styles.progressStepDotDone]} />
                <Text style={[styles.progressStepText, i < 3 && styles.progressStepTextDone]}>{s}</Text>
              </View>
            ))}
          </View>

          <View style={styles.transitCtaRow}>
            <TouchableOpacity style={styles.trackingBtn} onPress={() => navigation.navigate('S32_DealTracking')}>
              <Icon name="map-pin" size={13} color={colors.primary} />
              <Text style={styles.trackingBtnText}>{t('deals_view_tracking_btn')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.scaleBtn}>
              <Icon name="scale" size={13} color={colors.primary} />
              <Text style={styles.scaleBtnText}>{t('deals_weigh_receipt_btn')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settled deal — SD-2024-8502 */}
        <View style={[styles.dealCard, styles.dealCardSettled]}>
          <View style={styles.dealCardHeader}>
            <Text style={styles.dealRef}>{t('deals_settled_ref', { id: 'SD-2024-8502', date: '12 Mar 2024' })}</Text>
            <View style={styles.settledBadge}>
              <Icon name="check-circle" size={11} color={colors.tertiary} />
              <Text style={styles.settledBadgeText}>{t('deals_settled_badge')}</Text>
            </View>
          </View>

          <View style={styles.settledProductRow}>
            <Text style={styles.settledProductName}>{t('deals_demo_commodity_3')}</Text>
            <Text style={styles.settledAmt}>₹51,000</Text>
          </View>
          <Text style={styles.settledSubText}>{t('deals_settled_subtext', { qty: '30', rate: '₹1,820' })}</Text>

          <View style={styles.settledFooterRow}>
            <View>
              <Text style={styles.settledUtLabel}>{t('deals_utr_label')}</Text>
              <Text style={styles.settledUtr}>APMC2024031298412</Text>
            </View>
            <TouchableOpacity style={styles.invoiceBtn} onPress={() => navigation.navigate('S33_Settled')}>
              <Icon name="clipboard" size={12} color={colors.primary} />
              <Text style={styles.invoiceBtnText}>{t('deals_invoice_btn')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.helpRow}>
          <Icon name="phone" size={11} color={colors.onSurfaceVariant} />
          <Text style={styles.helpText}>{t('deals_help_text')}</Text>
        </View>
      </ScrollView>
      {/* ★ A second, fake bottom tab bar (Home/Market/My Produce/Deals,
          none of it wired to navigation) was baked directly into this
          screen's own content — a literal copy of the Stitch mockup's tab
          bar artwork, sitting on top of the real one the navigator already
          renders below every screen. Removed; the real tab bar underneath
          is the only one that should ever show. */}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingTop: space.xl + 8, paddingBottom: space.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  farmerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  headerMandi: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  apmcBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: colors.positiveContainer },
  apmcBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  headerFarmer: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, backgroundColor: 'rgba(155,47,0,0.08)' },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  titleSection: { paddingHorizontal: space.md, paddingVertical: space.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  pageTitle: { fontFamily: fontFamily.extraBold, fontSize: 22, color: colors.onSurface },
  escrowGuaranteeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  escrowGuaranteeText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.tertiary },
  summaryCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: space.md, marginVertical: space.sm, padding: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  summaryIconBg: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(155,47,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  summaryLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  summaryAmt: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.primary },
  activeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  activeText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.tertiary },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  tab: { flex: 1, alignItems: 'center', paddingVertical: space.sm, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primaryContainer },
  tabLabel: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurfaceVariant },
  tabLabelActive: { color: colors.primaryContainer },
  tabSub: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.outline },
  scroll: { paddingBottom: 100 },
  escrowBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, marginHorizontal: space.md, marginTop: space.sm, marginBottom: space.xs, padding: space.sm, borderRadius: radius.xl, backgroundColor: colors.positiveContainer, borderWidth: 1, borderColor: 'rgba(4,120,87,0.2)' },
  escrowBannerIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(4,120,87,0.1)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  escrowBannerText: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onPositiveContainer, flex: 1, lineHeight: 17 },
  dealCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primaryContainer, overflow: 'hidden' },
  dealCardTransit: { borderColor: colors.outlineVariant },
  dealCardSettled: { borderColor: colors.outlineVariant },
  dealCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  dealRef: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurfaceVariant },
  escrowActiveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  liveGreen: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.tertiary },
  escrowActiveBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  dealProductRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: space.sm },
  dealProductInfo: { flex: 1 },
  dealTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dealProductName: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.onSurface },
  gradeABadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  gradeAText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  dealProductSub: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
  dealThumb: { width: 64, height: 64, borderRadius: radius.md },
  dealMetaRow: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.sm, marginBottom: 4 },
  dealMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1 },
  dealMetaLabel: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.onSurfaceVariant },
  dealMetaVal: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  dealMetaRow2: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.sm, marginBottom: space.xs },
  dealRateText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primary },
  dealNetLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  dealBuyerRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: space.sm, paddingVertical: space.xs, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  dealBuyerName: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  dealBuyerSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, flex: 1 },
  dealBuyerRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dealBuyerRatingText: { fontFamily: fontFamily.bold, fontSize: 11, color: '#F59E0B' },
  nextStepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingHorizontal: space.sm, paddingVertical: space.xs, backgroundColor: colors.onPrimaryContainer },
  nextStepLabel: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primaryContainer },
  nextStepText: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurface, lineHeight: 16 },
  dealCtaRow: { flexDirection: 'row', gap: space.sm, padding: space.sm },
  trackBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, height: touch.targetMin, borderRadius: radius.lg, backgroundColor: colors.primaryContainer },
  trackBtnText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onPrimary },
  receiptBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, height: touch.targetMin, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.outlineVariant },
  receiptBtnText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primary },
  transitBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.onPrimaryContainer },
  transitBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.primaryContainer },
  transitProductRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.sm, paddingTop: space.sm },
  transitProductName: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.onSurface },
  transitAmt: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.primary },
  transitSubText: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, paddingHorizontal: space.sm },
  transitBuyerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: space.sm, paddingVertical: 4 },
  transitBuyerText: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, flex: 1 },
  transitSbiRow: { paddingHorizontal: space.sm, marginBottom: 6 },
  transitSbiText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.tertiary },
  progressSteps: { flexDirection: 'row', paddingHorizontal: space.sm, paddingBottom: space.xs, gap: 0 },
  progressStep: { flex: 1, alignItems: 'center' },
  progressStepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.outlineVariant, marginBottom: 4 },
  progressStepDotDone: { backgroundColor: colors.tertiary },
  progressStepText: { fontFamily: fontFamily.regular, fontSize: 9, color: colors.outline, textAlign: 'center' },
  progressStepTextDone: { fontFamily: fontFamily.bold, color: colors.tertiary },
  transitCtaRow: { flexDirection: 'row', gap: space.sm, padding: space.sm, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  trackingBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, height: touch.targetMin, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.outlineVariant },
  trackingBtnText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primary },
  scaleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, height: touch.targetMin, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.outlineVariant },
  scaleBtnText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primary },
  settledBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  settledBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  settledProductRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.sm, paddingTop: space.sm },
  settledProductName: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.onSurface },
  settledAmt: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.primary },
  settledSubText: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, paddingHorizontal: space.sm, marginBottom: space.sm },
  settledFooterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.sm, paddingBottom: space.sm },
  settledUtLabel: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.onSurfaceVariant },
  settledUtr: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  invoiceBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.primaryContainer },
  invoiceBtnText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primary },
  helpRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, paddingHorizontal: space.md, paddingBottom: space.sm },
  helpText: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.outline, flex: 1 },
  tabBar: { flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingBottom: space.xl - 8, paddingTop: space.xs },
  tabBarItem: { flex: 1, alignItems: 'center', paddingVertical: space.xs },
  tabBarLabel: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.outline, marginTop: 2 },
  tabBarLabelActive: { color: colors.primary, fontFamily: fontFamily.bold },
});
