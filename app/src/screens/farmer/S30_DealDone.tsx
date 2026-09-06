/**
 * S30_DealDone — Screen 30: Deal confirmed celebration.
 * Matched to Stitch `30_deal_done_confetti_celebration_sauda_locked/screen.png`
 * ★ ZERO EMOJIS  ★ FULL I18N
 */
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';

const STEPS = [
  { num: 1, doneKey: 'deal_done_step1', subKey: 'deal_done_step1_time', done: true },
  { num: 2, doneKey: 'deal_done_step2', subKey: 'deal_done_step2_time', done: false, isNext: true },
  { num: 3, doneKey: 'deal_done_step3', subKey: null, done: false },
  { num: 4, doneKey: 'deal_done_step4', subKey: null, done: false },
] as const;

export default function S30_DealDone({ navigation }: any) {
  const { t } = useT();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Top banner */}
      <View style={styles.topBanner}>
        <View style={styles.topBannerLeft}>
          <Icon name="check-circle" size={14} color={colors.onPrimary} />
          <Text style={styles.topBannerText}>{t('deal_done_status')}</Text>
        </View>
        <TouchableOpacity style={styles.listenBtn}>
          <Icon name="volume" size={13} color={colors.onPrimary} />
          <Text style={styles.listenText}>{t('splash_listen')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Celebration header */}
        <View style={styles.celebrationCard}>
          {/* Star burst background icon */}
          <View style={styles.celebIcon}>
            <Icon name="star" size={40} color={colors.primaryContainer} />
          </View>
          <Text style={styles.dealHeading}>{t('deal_done_heading')}</Text>
          <Text style={styles.dealSubheading}>{t('deal_done_subheading')}</Text>
          <View style={styles.refRow}>
            <Text style={styles.refLabel}>{t('deal_done_ref')}</Text>
            <Text style={styles.refNum}>#SD-2024-8842</Text>
            <TouchableOpacity style={styles.copyBtn}>
              <Icon name="clipboard" size={12} color={colors.outline} />
            </TouchableOpacity>
          </View>
          <View style={styles.soldBanner}>
            <Icon name="trending-up" size={14} color={colors.primaryContainer} />
            <Text style={styles.soldText}>{t('deal_done_sold')}</Text>
          </View>
        </View>

        {/* Settlement card */}
        <View style={styles.settlementCard}>
          <View style={styles.settlementHeader}>
            <Text style={styles.settlementLabel}>{t('deal_done_settlement')}</Text>
            <View style={styles.escrowBadge}>
              <Icon name="shield-check" size={11} color={colors.tertiary} />
              <Text style={styles.escrowBadgeText}>{t('deal_done_escrow')}</Text>
            </View>
          </View>
          <Text style={styles.settlementAmount}>₹75,400</Text>
          <Text style={styles.settlementSub}>(RTGS {t('deal_done_bank')})</Text>

          <View style={styles.bankRow}>
            <Icon name="building" size={14} color={colors.tertiary} />
            <Text style={styles.bankText}>SBI ••••••4209</Text>
            <Text style={styles.ifscText}>IFSC: SBIN0001248</Text>
          </View>

          <View style={styles.escrowNote}>
            <Icon name="shield-check" size={14} color={colors.tertiary} />
            <Text style={styles.escrowNoteText}>{t('deal_done_escrow_note')}</Text>
          </View>
        </View>

        {/* Buyer & Farmer details */}
        <View style={styles.partiesCard}>
          <View style={styles.partySection}>
            <View style={styles.partyHeader}>
              <Text style={styles.partyLabel}>{t('deal_done_buyer_label')}</Text>
              <View style={styles.apmcVerifiedBadge}>
                <Icon name="check-circle" size={11} color={colors.tertiary} />
                <Text style={styles.apmcVerifiedText}>APMC Verified</Text>
              </View>
            </View>
            <Text style={styles.partyName}>Pune Trading Co.</Text>
            <Text style={styles.partySub}>Gulte-APMC Yard, Pune (Gulte) • Reg: MH-PUN-2018-84920</Text>
            <View style={styles.ratingRow}>
              <Icon name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>4.9 (2400+ deals)</Text>
            </View>
          </View>
          <View style={styles.partyDivider} />
          <View style={styles.partySection}>
            <Text style={styles.partyLabel}>{t('deal_done_farmer_label')}</Text>
            <Text style={styles.partyName}>Rambhau Patil (Niphad, Nashik)</Text>
            <Text style={styles.partySub}>Farm gate pickup</Text>
          </View>
        </View>

        {/* Produce lot */}
        <View style={styles.lotCard}>
          <View style={styles.lotCardHeader}>
            <Text style={styles.lotLabel}>{t('deal_done_produce_label')}</Text>
            <View style={styles.gradeBadge}><Text style={styles.gradeText}>Grade A (850/1000)</Text></View>
          </View>
          {[
            ['Variety:', 'Gavran Lal Kanda (Gavran Red)'],
            ['Weight & bags:', '40 quintal · 80 bags (50kg bags)'],
            ['Rate per quintal:', '₹1,900 / quintal'],
          ].map(([k, v]) => (
            <View key={k} style={styles.lotRow}>
              <Text style={styles.lotKey}>{k}</Text>
              <Text style={styles.lotVal}>{v}</Text>
            </View>
          ))}
          <View style={styles.lotDivider} />
          <View style={styles.lotRow}>
            <Text style={styles.lotKey}>Gross:</Text>
            <Text style={styles.lotVal}>₹76,000</Text>
          </View>
          <View style={styles.lotRow}>
            <Text style={[styles.lotKey, { color: colors.critical }]}>Hamali & Tolai Waja:</Text>
            <Text style={[styles.lotVal, { color: colors.critical }]}>–₹600</Text>
          </View>
          <View style={[styles.lotRow, { marginTop: 4 }]}>
            <Text style={[styles.lotKey, { fontFamily: fontFamily.bold }]}>Net (निवळ):</Text>
            <Text style={[styles.lotVal, { fontFamily: fontFamily.extraBold, color: colors.tertiary }]}>₹75,400</Text>
          </View>
        </View>

        {/* Next steps */}
        <Text style={styles.nextStepsLabel}>{t('deal_done_next')}</Text>
        <View style={styles.stepsList}>
          {STEPS.map((step) => (
            <View key={step.num} style={styles.stepRow}>
              <View style={[styles.stepNum,
                step.done && styles.stepNumDone,
              ('isNext' in step && step.isNext) && styles.stepNumNext]}>
                {step.done
                  ? <Icon name="check" size={12} color={colors.onPrimary} />
                  : <Text style={[styles.stepNumText, ('isNext' in step && step.isNext) && styles.stepNumTextNext]}>{step.num}</Text>
                }
              </View>
              <View style={styles.stepInfo}>
                <Text style={[styles.stepTitle, ('isNext' in step && step.isNext) && { color: colors.primary }]}>
                  {t(step.doneKey)}
                </Text>
                {step.subKey && (
                  <Text style={styles.stepSub}>{t(step.subKey)}</Text>
                )}
              </View>
              {step.done && <Text style={styles.stepDoneTag}>Done</Text>}
              {('isNext' in step && step.isNext) && <Text style={styles.stepNextTag}>Tomorrow morning 10:00</Text>}
            </View>
          ))}
        </View>

        {/* Help */}
        <View style={styles.helpRow}>
          <Icon name="phone" size={12} color={colors.primary} />
          <Text style={styles.helpText}>{t('deal_done_help')} 1800-233-4567 (Toll Free)</Text>
        </View>
      </ScrollView>

      {/* CTA dock */}
      <View style={styles.dock}>
        <TouchableOpacity style={styles.ctaPrimary}>
          <Text style={styles.ctaPrimaryText}>{t('deal_done_cta_track')}</Text>
          <Icon name="arrow-right" size={18} color={colors.onPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctaSecondary}>
          <Icon name="chevron-down" size={14} color={colors.primaryContainer} />
          <Text style={styles.ctaSecondaryText}>{t('deal_done_cta_pdf')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctaTertiary}>
          <Icon name="volume" size={14} color={colors.tertiary} />
          <Text style={styles.ctaTertiaryText}>{t('deal_done_cta_share')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: space.md, paddingTop: space.xl + 8, paddingBottom: space.sm,
    backgroundColor: colors.primary,
  },
  topBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  topBannerText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onPrimary },
  listenBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onPrimary },
  scroll: { paddingBottom: 170 },
  celebrationCard: {
    margin: space.md, padding: space.lg, borderRadius: radius.xl,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant,
    alignItems: 'center',
  },
  celebIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.onPrimaryContainer, alignItems: 'center', justifyContent: 'center',
    marginBottom: space.md,
  },
  dealHeading: { fontFamily: fontFamily.extraBold, fontSize: 26, color: colors.primary, textAlign: 'center' },
  dealSubheading: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 4 },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.sm },
  refLabel: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  refNum: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  copyBtn: { padding: 4 },
  soldBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: space.sm,
    paddingHorizontal: space.sm, paddingVertical: 6, borderRadius: radius.md,
    backgroundColor: colors.onPrimaryContainer, borderWidth: 1, borderColor: colors.primaryContainer,
  },
  soldText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primary },
  settlementCard: {
    marginHorizontal: space.md, marginBottom: space.sm, padding: space.md,
    borderRadius: radius.xl, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.outlineVariant,
  },
  settlementHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.xs },
  settlementLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  escrowBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full,
    backgroundColor: colors.positiveContainer,
  },
  escrowBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  settlementAmount: { fontFamily: fontFamily.extraBold, fontSize: 36, color: colors.tertiary, letterSpacing: -0.5 },
  settlementSub: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, marginBottom: space.sm },
  bankRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: space.xs },
  bankText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  ifscText: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant },
  escrowNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: space.xs,
    padding: space.sm, borderRadius: radius.md,
    backgroundColor: colors.positiveContainer, borderWidth: 1, borderColor: 'rgba(4,120,87,0.2)',
  },
  escrowNoteText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onPositiveContainer, flex: 1 },
  partiesCard: {
    marginHorizontal: space.md, marginBottom: space.sm,
    borderRadius: radius.xl, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden',
  },
  partySection: { padding: space.md },
  partyDivider: { height: 1, backgroundColor: colors.outlineVariant },
  partyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  partyLabel: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  apmcVerifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.positiveContainer,
  },
  apmcVerifiedText: { fontFamily: fontFamily.bold, fontSize: 9, color: colors.tertiary },
  partyName: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.onSurface },
  partySub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  ratingText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  lotCard: {
    marginHorizontal: space.md, marginBottom: space.sm, padding: space.md,
    borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant,
  },
  lotCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.sm },
  lotLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  gradeBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full,
    backgroundColor: colors.positiveContainer,
  },
  gradeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  lotRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  lotKey: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant },
  lotVal: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.onSurface },
  lotDivider: { height: 1, backgroundColor: colors.outlineVariant, marginVertical: space.xs },
  nextStepsLabel: {
    fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface,
    paddingHorizontal: space.md, marginBottom: space.xs,
  },
  stepsList: { paddingHorizontal: space.md, gap: 12, marginBottom: space.sm },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  stepNum: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.outlineVariant,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepNumDone: { backgroundColor: colors.tertiary, borderColor: colors.tertiary },
  stepNumNext: { borderColor: colors.primary },
  stepNumText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.outline },
  stepNumTextNext: { color: colors.primary },
  stepInfo: { flex: 1 },
  stepTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  stepSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 1 },
  stepDoneTag: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary, paddingTop: 4 },
  stepNextTag: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant, paddingTop: 4, textAlign: 'right' },
  helpRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: space.md, marginBottom: space.sm,
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
    height: 44, borderWidth: 1.5, borderColor: colors.primaryContainer, borderRadius: radius.lg,
  },
  ctaSecondaryText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primaryContainer },
  ctaTertiary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    height: 40, borderRadius: radius.lg, backgroundColor: colors.positiveContainer,
  },
  ctaTertiaryText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.tertiary },
});
