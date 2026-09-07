/**
 * S32_DealTracking — Screen 32: Live escrow milestone timeline + GPS truck tracking.
 * Matched to Stitch `32_deal_tracking_escrow_milestone_timeline/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';
import { ListenButton } from '../../components/ui/ListenButton';

export default function S32_DealTracking({ navigation }: any) {
  const { t } = useT();

  const MILESTONES = [
    {
      done: true,
      active: false,
      icon: 'lock',
      title: t('tracking_milestone1_title', { amount: '₹76,000' }),
      time: t('tracking_milestone1_time'),
      sub: '',
      subGreen: true,
    },
    {
      done: true,
      active: false,
      icon: 'check-circle',
      title: t('tracking_milestone2_title'),
      time: t('tracking_milestone2_time'),
      sub: t('tracking_milestone2_sub'),
      subGreen: false,
    },
    {
      done: false,
      active: true,
      icon: 'truck',
      title: t('tracking_milestone3_title'),
      time: t('tracking_milestone3_time'),
      sub: '',
      subGreen: false,
    },
    {
      done: false,
      active: false,
      icon: 'scale',
      title: t('tracking_milestone4_title'),
      time: t('tracking_milestone4_time'),
      sub: '',
      subGreen: false,
    },
    {
      done: false,
      active: false,
      icon: 'clipboard',
      title: t('tracking_milestone5_title'),
      time: t('tracking_milestone5_time'),
      sub: '',
      subGreen: false,
    },
    {
      done: false,
      active: false,
      icon: 'zap',
      title: t('tracking_milestone6_title'),
      time: t('tracking_milestone6_time'),
      sub: '',
      subGreen: true,
    },
  ] as const;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryContainer} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={colors.onPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.liveRow}>
            <View style={styles.liveGreen} />
            <Text style={styles.headerRef}>{t('tracking_header_ref', { id: 'MS-8492' })}</Text>
          </View>
          <Text style={styles.headerSub}>
            {t('tracking_header_sub', { farmer: 'Rambhau Patil', market: 'Lasalgaon' })}
          </Text>
        </View>
        <ListenButton text={t('tracking_money_location')} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Escrow hero */}
        <View style={styles.escrowHero}>
          <View style={styles.escrowHeroTop}>
            <Icon name="lock" size={13} color={colors.onPrimary} />
            <Text style={styles.escrowHeroTopText}>{t('tracking_money_location')}</Text>
            <View style={styles.securedBadge}><Text style={styles.securedText}>{t('tracking_secured_badge')}</Text></View>
          </View>
          <Text style={styles.escrowHeroAmt}>{t('tracking_amt_safe_in', { amount: '₹76,000' })}</Text>
          <Text style={styles.escrowHeroAmtLine2}>{t('tracking_escrow_line')}</Text>
          <Text style={styles.escrowHeroDesc}>{t('tracking_escrow_desc')}</Text>
          {/* ★ "APMC Regulated Escrow Trust" and a fabricated trust ID were
              removed — there is no regulated third-party escrow trust
              behind this feature, only this app's own transaction FSM. */}
        </View>

        {/* Deal snapshot */}
        <View style={styles.snapshotCard}>
          <View style={styles.snapshotHeader}>
            <Icon name="clipboard" size={13} color={colors.primary} />
            <Text style={styles.snapshotTitle}>{t('tracking_snapshot_title')}</Text>
            <Text style={styles.snapshotLot}>{t('tracking_lot_label', { id: 'ON-841' })}</Text>
          </View>

          <View style={styles.snapshotBuyerRow}>
            <Text style={styles.snapshotKey}>{t('tracking_buyer_label')}</Text>
            <Text style={styles.snapshotBuyerName}>{t('demo_buyer_company_name')}</Text>
            <View style={styles.verifiedRow}>
              <Icon name="check-circle" size={11} color={colors.tertiary} />
              <Text style={styles.verifiedText}>{t('tracking_verified_trader')}</Text>
            </View>
          </View>

          <View style={styles.snapshotSettlementRow}>
            <View>
              <Text style={styles.snapshotKey}>{t('tracking_total_settlement')}</Text>
              <Text style={styles.snapshotSettlementAmt}>₹76,000</Text>
              <View style={styles.zeroDeductRow}>
                <Icon name="check" size={11} color={colors.tertiary} />
                <Text style={styles.zeroDeductText}>{t('tracking_zero_deduction')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.snapshotProduceRow}>
            <Icon name="truck" size={13} color={colors.onSurfaceVariant} />
            <Text style={styles.snapshotProduceText}>
              {t('tracking_produce_line', { qty: '40', grade: t('lot_grade_a'), commodity: t('commodity_onion'), rate: '₹1,900' })}
            </Text>
            <View style={styles.gavranBadge}><Text style={styles.gavranText}>{t('tracking_variety_badge')}</Text></View>
          </View>
        </View>

        {/* Milestone timeline */}
        <View style={styles.timelineCard}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineTitle}>{t('tracking_lifecycle_title')}</Text>
            <View style={styles.stageBadge}><Text style={styles.stageText}>{t('tracking_stage_badge', { n: '3', total: '6' })}</Text></View>
          </View>

          {MILESTONES.map((m, i) => (
            <View key={i} style={styles.milestoneRow}>
              {/* Connector line */}
              {i < MILESTONES.length - 1 && (
                <View style={[styles.connectorLine, m.done && styles.connectorLineDone]} />
              )}

              {/* Step circle */}
              <View style={[
                styles.stepCircle,
                m.done && styles.stepCircleDone,
                m.active && styles.stepCircleActive,
              ]}>
                <Icon
                  name={m.icon as any}
                  size={16}
                  color={m.done || m.active ? colors.onPrimary : colors.outline}
                />
              </View>

              <View style={[styles.stepContent, m.active && styles.stepContentActive]}>
                {m.active && (
                  <View style={styles.liveGpsBadge}>
                    <View style={styles.liveGpsDot} />
                    <Text style={styles.liveGpsText}>{t('tracking_live_gps_badge')}</Text>
                  </View>
                )}
                <Text style={[styles.stepTitle, m.done && styles.stepTitleDone, m.active && styles.stepTitleActive]}>
                  {m.title}
                </Text>
                <Text style={styles.stepTime}>{m.time}</Text>
                {m.sub ? (
                  <View style={[styles.stepSubBox, m.subGreen && styles.stepSubBoxGreen]}>
                    <Icon name="check" size={10} color={m.subGreen ? colors.tertiary : colors.onSurfaceVariant} />
                    <Text style={[styles.stepSubText, m.subGreen && styles.stepSubTextGreen]}>{m.sub}</Text>
                  </View>
                ) : null}

                {/* Active step driver card */}
                {m.active && (
                  <View style={styles.driverCard}>
                    <View style={styles.driverAvatar}>
                      <Text style={styles.driverAvatarText}>RS</Text>
                    </View>
                    <View style={styles.driverInfo}>
                      <Text style={styles.driverName}>Ramesh Shinde</Text>
                      <Text style={styles.driverTruck}>{t('tracking_driver_truck', { model: 'Tata 407', tyres: '14' })}</Text>
                    </View>
                    <TouchableOpacity style={styles.callDriverBtn}>
                      <Icon name="phone" size={13} color={colors.onPrimary} />
                      <Text style={styles.callDriverText}>{t('tracking_call_driver')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {m.active && (
                  <View style={styles.etaRow}>
                    <Icon name="clock" size={11} color={colors.onSurface} />
                    <Text style={styles.etaText}>{t('tracking_eta', { duration: '2h', time: '02:45 PM' })}</Text>
                    <Text style={styles.routeText}>{t('tracking_route', { route: 'Niphad-Lasalgaon Rd' })}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* ★ "Download Escrow Legal Guarantee Agreement · Digitally signed
            by APMC Lasalgaon" and "100% insured by Mandi-Setu Board
            Protection" were both removed — there is no legal agreement
            generation, no APMC digital signature, and no insurance product
            behind this screen. Claiming government/board-level backing
            this app does not have is exactly the mistake CLAUDE.md warns
            is unrecoverable in front of a government panel. */}
        <TouchableOpacity style={styles.docRow} onPress={() => navigation.navigate('S33_Settled')}>
          <View style={styles.docIcon}><Icon name="check-circle" size={16} color={colors.tertiary} /></View>
          <Text style={styles.docText}>{t('tracking_view_receipt')}</Text>
          <Icon name="arrow-right" size={16} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </ScrollView>
      {/* ★ A second, fake bottom tab bar was baked into this screen's own
          content, duplicating the real one the navigator renders below
          every screen — see the identical fix on S31_DealsList. Removed. */}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingTop: space.xl + 8, paddingBottom: space.sm, backgroundColor: colors.primaryContainer },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#86EFAC' },
  headerRef: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onPrimary },
  headerSub: { fontFamily: fontFamily.regular, fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  listenBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 100 },
  escrowHero: { backgroundColor: colors.primaryContainer, padding: space.md, paddingBottom: space.xl },
  escrowHeroTop: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: space.sm },
  escrowHeroTopText: { fontFamily: fontFamily.bold, fontSize: 11, color: 'rgba(255,255,255,0.7)', flex: 1, letterSpacing: 0.5 },
  securedBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.tertiary },
  securedText: { fontFamily: fontFamily.bold, fontSize: 10, color: '#fff', letterSpacing: 0.3 },
  escrowHeroAmt: { fontFamily: fontFamily.extraBold, fontSize: 32, color: colors.onPrimary, letterSpacing: -0.5 },
  escrowHeroAmtLine2: { fontFamily: fontFamily.extraBold, fontSize: 32, color: colors.onPrimary, letterSpacing: -0.5, marginBottom: space.sm },
  escrowHeroDesc: { fontFamily: fontFamily.regular, fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 18, marginBottom: space.sm },
  escrowIdRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  escrowIdText: { fontFamily: fontFamily.medium, fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  snapshotCard: { margin: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' },
  snapshotHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  snapshotTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.primary, flex: 1 },
  snapshotLot: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  snapshotBuyerRow: { padding: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  snapshotKey: { fontFamily: fontFamily.bold, fontSize: 9, color: colors.outline, letterSpacing: 0.5, marginBottom: 3 },
  snapshotBuyerName: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.onSurface },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.tertiary },
  snapshotSettlementRow: { padding: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  snapshotSettlementAmt: { fontFamily: fontFamily.extraBold, fontSize: 26, color: colors.primary, letterSpacing: -0.5 },
  zeroDeductRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  zeroDeductText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.tertiary },
  snapshotProduceRow: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: space.sm },
  snapshotProduceText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurface, flex: 1 },
  gavranBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.surfaceContainerHigh },
  gavranText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurface },
  timelineCard: { marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, padding: space.md },
  timelineHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
  timelineTitle: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.onSurface },
  stageBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, backgroundColor: colors.onPrimaryContainer },
  stageText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primaryContainer },
  milestoneRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, marginBottom: space.md, position: 'relative' },
  connectorLine: { position: 'absolute', left: 15, top: 32, width: 2, height: '100%', backgroundColor: colors.outlineVariant, zIndex: -1 },
  connectorLineDone: { backgroundColor: colors.tertiary },
  stepCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: colors.surface, zIndex: 1 },
  stepCircleDone: { backgroundColor: colors.tertiary, borderColor: colors.tertiary },
  stepCircleActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primaryContainer },
  stepContent: { flex: 1 },
  stepContentActive: { padding: space.sm, borderRadius: radius.xl, borderWidth: 2, borderColor: colors.primaryContainer, backgroundColor: colors.onPrimaryContainer },
  liveGpsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  liveGpsDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.critical },
  liveGpsText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.critical, letterSpacing: 0.5 },
  stepTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface, marginBottom: 2 },
  stepTitleDone: { color: colors.tertiary },
  stepTitleActive: { color: colors.primaryContainer },
  stepTime: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, marginBottom: 4 },
  stepSubBox: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.md, backgroundColor: colors.surfaceContainerHigh },
  stepSubBoxGreen: { backgroundColor: colors.positiveContainer },
  stepSubText: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  stepSubTextGreen: { color: colors.tertiary },
  driverCard: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.sm, marginTop: space.xs, borderRadius: radius.lg, backgroundColor: colors.surface },
  driverAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  driverAvatarText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onPrimary },
  driverInfo: { flex: 1 },
  driverName: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  driverTruck: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  callDriverBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, height: 36, borderRadius: radius.lg, backgroundColor: colors.primaryContainer },
  callDriverText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onPrimary },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  etaText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurface },
  routeText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginHorizontal: space.md, marginBottom: space.xs, padding: space.sm, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  docIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(155,47,0,0.08)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primary, flex: 1 },
  docSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  reportRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginHorizontal: space.md, marginBottom: space.xs, height: touch.targetMin, borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.critical },
  reportText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.critical },
  insuredRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, paddingHorizontal: space.md, paddingBottom: space.sm },
  insuredText: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.tertiary, flex: 1, lineHeight: 16 },
  tabBar: { flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingBottom: space.xl - 8, paddingTop: space.xs },
  tabBarItem: { flex: 1, alignItems: 'center', paddingVertical: space.xs },
  tabBarLabel: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.outline, marginTop: 2 },
  tabBarLabelActive: { color: colors.primary, fontFamily: fontFamily.bold },
});
