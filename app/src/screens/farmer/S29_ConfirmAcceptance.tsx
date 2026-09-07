/**
 * S29_ConfirmAcceptance — Screen 29: Binding sauda agreement confirmation.
 * Matched to Stitch `29_confirm_acceptance_binding_sauda_agreement/screen.png`
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

export default function S29_ConfirmAcceptance({ navigation }: any) {
  const { t } = useT();
  const [agreed, setAgreed] = useState(false);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('confirm_header_title')}</Text>
          <Text style={styles.headerSub}>{t('confirm_header_sub')}</Text>
        </View>
        <Text style={styles.headerRef}>#LP-403</Text>
        <TouchableOpacity style={styles.listenBtn}>
          <Icon name="volume" size={13} color={colors.primary} />
          <Text style={styles.listenText}>{t('splash_listen')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.legalBand}>
          <View style={styles.legalLeft}>
            <Icon name="shield-check" size={16} color={colors.primaryContainer} />
            <Text style={styles.legalTitle}>{t('confirm_legal_title')}</Text>
          </View>
        </View>

        {/* Countdown */}
        <View style={styles.countdownBand}>
          <Icon name="clock" size={14} color={colors.primaryContainer} />
          <Text style={styles.countdownLabel}>{t('confirm_countdown_label')}</Text>
          <Text style={styles.countdownTimer}>{t('confirm_countdown_timer')}</Text>
        </View>

        {/* Produce card */}
        <View style={styles.produceCard}>
          <Image source={redOnions} style={styles.produceThumb} />
          <View style={styles.produceInfo}>
            <View style={styles.produceTitleRow}>
              <Text style={styles.produceName}>{t('confirm_produce_name')}</Text>
              <View style={styles.gradeChip}><Text style={styles.gradeChipText}>{t('confirm_produce_grade')}</Text></View>
            </View>
            <Text style={styles.produceWeight}>{t('confirm_produce_weight')}</Text>
            <Text style={styles.produceLot}>{t('confirm_produce_lot')}</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.partiesCard}>
          <View style={styles.partySide}>
            <Icon name="leaf" size={13} color={colors.tertiary} />
            <Text style={styles.partyRole}>{t('confirm_party_seller_role')}</Text>
            <Text style={styles.partyName}>{t('confirm_party_seller_name')}</Text>
            <Text style={styles.partySub}>{t('confirm_party_seller_sub')}</Text>
          </View>
          <View style={styles.partiesVsCol}>
            <View style={styles.partiesLine} />
          </View>
          <View style={styles.partySide}>
            <View style={styles.partyRatingRow}>
              <Icon name="handshake" size={13} color={colors.primary} />
              <Icon name="star" size={11} color="#F59E0B" />
              <Text style={styles.partyRating}>4.7</Text>
            </View>
            <Text style={styles.partyRole}>{t('confirm_party_buyer_role')}</Text>
            <Text style={styles.partyName}>{t('confirm_party_buyer_name')}</Text>
            <Text style={styles.partySub}>{t('confirm_party_buyer_sub')}</Text>
          </View>
        </View>

        {/* Bank payout breakdown */}
        <View style={styles.payoutCard}>
          <View style={styles.payoutHeader}>
            <Icon name="building" size={14} color={colors.primary} />
            <Text style={styles.payoutTitle}>{t('confirm_payout_title')}</Text>
            <Text style={styles.payoutSub}>{t('confirm_payout_sub')}</Text>
          </View>

          <View style={styles.payoutRow}>
            <View>
              <Text style={styles.payoutKey}>{t('confirm_payout_rate_key')}</Text>
              <Text style={styles.payoutKeyMr}>{t('confirm_payout_rate_keymr')}</Text>
            </View>
            <Text style={styles.payoutVal}>{t('confirm_payout_rate_val')}</Text>
          </View>

          <View style={styles.payoutRow}>
            <View>
              <Text style={styles.payoutKey}>{t('confirm_payout_loading_key')}</Text>
              <Text style={styles.payoutKeyMr}>{t('confirm_payout_loading_keymr')}</Text>
            </View>
            <Text style={[styles.payoutVal, { color: colors.critical }]}>{t('confirm_payout_loading_val')}</Text>
          </View>

          <View style={styles.payoutRow}>
            <Text style={styles.payoutKey}>{t('confirm_payout_platform_key')}</Text>
            <View style={styles.freeBadge}><Text style={styles.freeBadgeText}>{t('confirm_payout_platform_free')}</Text></View>
            <Text style={[styles.payoutVal, { color: colors.tertiary }]}>{t('confirm_payout_platform_val')}</Text>
          </View>

          {/* Net payout hero */}
          <View style={styles.netHeroCard}>
            <View>
              <Text style={styles.netHeroLabel}>{t('confirm_net_hero_label')}</Text>
              <Text style={styles.netHeroSubLabel}>{t('confirm_net_hero_sub')}</Text>
            </View>
            <View style={styles.netHeroRight}>
              <Text style={styles.netHeroAmount}>{t('confirm_net_hero_amount')}</Text>
              <View style={styles.guaranteeBadge}>
                <Icon name="shield-check" size={11} color={colors.tertiary} />
                <Text style={styles.guaranteeBadgeText}>{t('confirm_guarantee_badge')}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.netHeroNote}>
            {t('confirm_net_hero_note')}
          </Text>

          <View style={styles.escrowNote}>
            <Icon name="lock" size={12} color={colors.tertiary} />
            <Text style={styles.escrowNoteText}>
              {t('confirm_escrow_note')}
            </Text>
          </View>
        </View>

        {/* Terms list */}
        <View style={styles.termsCard}>
          <View style={styles.termItem}>
            <Text style={styles.termBullet}>1.</Text>
            <Text style={styles.termText}>{t('confirm_term1_text')}</Text>
          </View>
          <View style={styles.termItem}>
            <Text style={styles.termBullet}>2.</Text>
            <Text style={styles.termText}>{t('confirm_term2_text')}</Text>
          </View>
        </View>

      </ScrollView>

      {/* Action Dock */}
      <View style={styles.dock}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed && <Icon name="check" size={14} color={colors.onPrimaryContainer} />}
          </View>
          <Text style={styles.checkboxText}>{t('confirm_terms_agree')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dockBtn, agreed ? styles.dockBtnActive : styles.dockBtnDisabled]}
          disabled={!agreed}
          onPress={() => navigation.navigate('S31_DealsList')}
        >
          <View style={styles.dockBtnContent}>
            <Icon name="clipboard" size={18} color={agreed ? colors.onPrimary : colors.outline} />
            <View>
              <Text style={[styles.dockBtnText, agreed ? styles.dockBtnTextActive : null]}>
                {t('confirm_cta_btn')}
              </Text>
              <Text style={[styles.dockBtnSub, agreed ? styles.dockBtnSubActive : null]}>
                {t('confirm_cta_sub')}
              </Text>
            </View>
          </View>
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
  headerTitle: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.onSurface },
  headerSub: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  headerRef: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.primaryContainer },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, backgroundColor: 'rgba(155,47,0,0.08)' },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  scroll: { paddingBottom: 150 },
  legalBand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.md, paddingVertical: space.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  legalLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legalTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primaryContainer },
  countdownBand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: space.sm, backgroundColor: '#FFFBEB' },
  countdownLabel: { fontFamily: fontFamily.medium, fontSize: 13, color: '#92400E' },
  countdownTimer: { fontFamily: fontFamily.extraBold, fontSize: 14, color: '#B45309' },
  produceCard: { flexDirection: 'row', margin: space.md, padding: space.sm, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  produceThumb: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.surfaceContainerHigh },
  produceInfo: { flex: 1, marginLeft: space.md, justifyContent: 'center' },
  produceTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  produceName: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  gradeChip: { backgroundColor: colors.positiveContainer, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm },
  gradeChipText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  produceWeight: { fontFamily: fontFamily.extraBold, fontSize: 15, color: colors.primary, letterSpacing: -0.2, marginBottom: 2 },
  produceLot: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  partiesCard: { flexDirection: 'row', marginHorizontal: space.md, padding: space.md, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  partySide: { flex: 1 },
  partiesVsCol: { width: 40, alignItems: 'center', justifyContent: 'center' },
  partiesLine: { width: 1, height: '80%', backgroundColor: colors.outlineVariant },
  partyRatingRow: { position: 'absolute', right: 0, top: 0, flexDirection: 'row', alignItems: 'center', gap: 2 },
  partyRating: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurfaceVariant },
  partyRole: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 4, marginBottom: 2 },
  partyName: { fontFamily: fontFamily.extraBold, fontSize: 15, color: colors.onSurface },
  partySub: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
  payoutCard: { margin: space.md, padding: space.md, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  payoutHeader: { marginBottom: space.md, paddingBottom: space.sm, borderBottomWidth: 1, borderBottomColor: colors.surfaceContainerHigh },
  payoutTitle: { fontFamily: fontFamily.extraBold, fontSize: 15, color: colors.onSurface, marginTop: 4 },
  payoutSub: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  payoutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
  payoutKey: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  payoutKeyMr: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  payoutVal: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.onSurface },
  freeBadge: { alignSelf: 'flex-start', backgroundColor: colors.positiveContainer, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, marginTop: 2 },
  freeBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  netHeroCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.outlineVariant, marginTop: space.xs },
  netHeroLabel: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.onSurface },
  netHeroSubLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  netHeroRight: { alignItems: 'flex-end' },
  netHeroAmount: { fontFamily: fontFamily.extraBold, fontSize: 24, color: colors.primary, letterSpacing: -0.5 },
  guaranteeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.positiveContainer, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, marginTop: 2 },
  guaranteeBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  netHeroNote: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: space.sm, fontStyle: 'italic' },
  escrowNote: { flexDirection: 'row', gap: 6, marginTop: space.md, padding: space.sm, backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: radius.sm },
  escrowNoteText: { flex: 1, fontFamily: fontFamily.medium, fontSize: 12, color: colors.tertiary, lineHeight: 16 },
  termsCard: { marginHorizontal: space.md, padding: space.md, borderRadius: radius.md, backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant },
  termItem: { flexDirection: 'row', gap: space.sm, marginBottom: space.sm },
  termBullet: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurfaceVariant },
  termText: { flex: 1, fontFamily: fontFamily.regular, fontSize: 13, color: colors.onSurface, lineHeight: 19 },
  dock: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md, paddingHorizontal: space.xs },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primaryContainer },
  checkboxText: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  dockBtn: { paddingVertical: space.sm, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  dockBtnDisabled: { backgroundColor: colors.surfaceContainerHigh },
  dockBtnActive: { backgroundColor: colors.primary, shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5 },
  dockBtnContent: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  dockBtnText: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.outline },
  dockBtnTextActive: { color: colors.onPrimary },
  dockBtnSub: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.outline },
  dockBtnSubActive: { color: colors.primaryContainer },
});
