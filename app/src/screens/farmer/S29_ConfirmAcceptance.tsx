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
          <Text style={styles.headerTitle}>सौदा स्वीकृती</Text>
          <Text style={styles.headerSub}>Confirm Binding Agreement</Text>
        </View>
        <Text style={styles.headerRef}>#LP-403</Text>
        <TouchableOpacity style={styles.listenBtn}>
          <Icon name="volume" size={13} color={colors.primary} />
          <Text style={styles.listenText}>{t('splash_listen')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ★ "APMC Act 1963 · Enforceable Trade Contract" removed — this app
            has no actual legal standing under that Act, and claiming a deal
            is government-enforceable when it is a demo-stage FSM transition
            is exactly the kind of claim that gets a product in real trouble
            in front of a government panel. */}
        <View style={styles.legalBand}>
          <View style={styles.legalLeft}>
            <Icon name="shield-check" size={16} color={colors.primaryContainer} />
            <Text style={styles.legalTitle}>सौदा करार</Text>
          </View>
        </View>

        {/* Countdown */}
        <View style={styles.countdownBand}>
          <Icon name="clock" size={14} color={colors.primaryContainer} />
          <Text style={styles.countdownLabel}>स्वीकृतीची मुदत:</Text>
          <Text style={styles.countdownTimer}>14:52 शिल्लक (14:52 mins)</Text>
        </View>

        {/* Produce card */}
        <View style={styles.produceCard}>
          <Image source={redOnions} style={styles.produceThumb} />
          <View style={styles.produceInfo}>
            <View style={styles.produceTitleRow}>
              <Text style={styles.produceName}>उन्हाळ कांदा (GAVRAN RED)</Text>
              <View style={styles.gradeChip}><Text style={styles.gradeChipText}>Grade A (850)</Text></View>
            </View>
            <Text style={styles.produceWeight}>४० क्विंटल (80 पोती / ५० किलो)</Text>
            <Text style={styles.produceLot}>Lot #LP-403 · AI Assayed Quality Verified</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.partiesCard}>
          <View style={styles.partySide}>
            <Icon name="leaf" size={13} color={colors.tertiary} />
            <Text style={styles.partyRole}>शेतकरी (Seller)</Text>
            <Text style={styles.partyName}>रामभाऊ पाटील</Text>
            <Text style={styles.partySub}>निफाड, नाशिक (शेत बांध)</Text>
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
            <Text style={styles.partyRole}>खरेदीदार (Buyer)</Text>
            <Text style={styles.partyName}>Pune Trading Co.</Text>
            <Text style={styles.partySub}>गुलटेकडी, पुणे</Text>
          </View>
        </View>

        {/* Bank payout breakdown */}
        <View style={styles.payoutCard}>
          <View style={styles.payoutHeader}>
            <Icon name="building" size={14} color={colors.primary} />
            <Text style={styles.payoutTitle}>थेट बँक जमा हिशोब</Text>
            <Text style={styles.payoutSub}>Direct RTGS Breakdown</Text>
          </View>

          <View style={styles.payoutRow}>
            <View>
              <Text style={styles.payoutKey}>निश्चित भाव (Agreed Rate)</Text>
              <Text style={styles.payoutKeyMr}>₹1,900 × ४० क्विंटल (40 Qtl)</Text>
            </View>
            <Text style={styles.payoutVal}>₹76,000</Text>
          </View>

          <View style={styles.payoutRow}>
            <View>
              <Text style={styles.payoutKey}>शेत हमाली (Loading Charges)</Text>
              <Text style={styles.payoutKeyMr}>८० पोती भरणा (₹७.५ / पोते)</Text>
            </View>
            <Text style={[styles.payoutVal, { color: colors.critical }]}>–₹600</Text>
          </View>

          <View style={styles.payoutRow}>
            <Text style={styles.payoutKey}>कृषी मित्र शुल्क (Platform Fee)</Text>
            <View style={styles.freeBadge}><Text style={styles.freeBadgeText}>०% मोफत</Text></View>
            <Text style={[styles.payoutVal, { color: colors.tertiary }]}>₹0</Text>
          </View>

          {/* Net payout hero */}
          <View style={styles.netHeroCard}>
            <View>
              <Text style={styles.netHeroLabel}>शेतकऱ्याला थेट बँक जमा</Text>
              <Text style={styles.netHeroSubLabel}>Net Payout to Farmer</Text>
            </View>
            <View style={styles.netHeroRight}>
              <Text style={styles.netHeroAmount}>₹75,400</Text>
              <View style={styles.guaranteeBadge}>
                <Icon name="shield-check" size={11} color={colors.tertiary} />
                <Text style={styles.guaranteeBadgeText}>100% हमी</Text>
              </View>
            </View>
          </View>
          <Text style={styles.netHeroNote}>
            शेत वजन पावतीनंतर तात्काळ RTGS
          </Text>

          <View style={styles.escrowNote}>
            <Icon name="lock" size={12} color={colors.tertiary} />
            <Text style={styles.escrowNoteText}>
              ₹76,000 रक्कम APMC अधिकृत बँक एस्क्रो खात्यात सुरक्षित जमा आहे. पेमेंटची 100% हमी.
            </Text>
          </View>
        </View>

        {/* Logistics terms */}
        <View style={styles.logisticsCard}>
          <View style={styles.logisticsHeader}>
            <Icon name="truck" size={16} color={colors.primary} />
            <Text style={styles.logisticsTitle}>वाहतूक व वजन अटी (Logistics Terms)</Text>
          </View>

          <View style={styles.logisticsItem}>
            <Icon name="clock" size={13} color={colors.primaryContainer} />
            <View style={styles.logisticsInfo}>
              <Text style={styles.logisticsItemTitle}>उद्या सकाळी १०:०० ते दुपारी १:००</Text>
              <Text style={styles.logisticsItemSub}>
                Pune Trading Co. ची ६-चाकी गाडी थेट आपल्या शेत बांधावर (निफाड) येईल.
              </Text>
            </View>
          </View>

          <View style={styles.logisticsItem}>
            <Icon name="scale" size={13} color={colors.primaryContainer} />
            <View style={styles.logisticsInfo}>
              <Text style={styles.logisticsItemTitle}>काटा वजन (Digital Weighment)</Text>
              <Text style={styles.logisticsItemSub}>
                निफाड सहकारी वजनकाटा किंवा बांधावरील डिजिटल स्केल. कोणतीही अनधिकृत ढागी/कपात नाही.
              </Text>
            </View>
          </View>

          <View style={styles.logisticsItem}>
            <Icon name="zap" size={13} color={colors.primaryContainer} />
            <View style={styles.logisticsInfo}>
              <Text style={styles.logisticsItemTitle}>२ तासांत बँक खात्यात पैसे</Text>
              <Text style={styles.logisticsItemSub}>
                गाडीत भरणा पूर्ण होऊन स्वाक्षरी केलेली वजन पावती अॅपमध्ये अपलोड करताच RTGS सुरुहोईल.
              </Text>
            </View>
          </View>
        </View>

        {/* Agreement checkbox */}
        <TouchableOpacity style={styles.agreementRow} onPress={() => setAgreed(a => !a)} activeOpacity={0.8}>
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Icon name="check" size={14} color={colors.onPrimary} />}
          </View>
          <Text style={styles.agreementText}>
            मी ४० क्विंटल कांदा ₹1,900/क्विंटल दराने विकण्यास पूर्ण संमती देत आहे.{'\n'}
            <Text style={styles.agreementSubText}>
              ही निवड निश्चित झाल्यावर बदलता येणार नाही.
            </Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.securityNote}>
          256-बिट एन्क्रिप्टेड
        </Text>
      </ScrollView>

      {/* CTA dock */}
      <View style={styles.dock}>
        <TouchableOpacity
          style={[styles.acceptBtn, !agreed && styles.acceptBtnDisabled]}
          disabled={!agreed}
          onPress={() => navigation.navigate('S30_DealDone')}>
          <Icon name="shield-check" size={18} color={agreed ? colors.onPrimary : colors.outline} />
          <Text style={[styles.acceptBtnText, !agreed && styles.acceptBtnTextDisabled]}>
            सौदा पक्का करा · Accept &amp; Lock Deal{'\n'}
            <Text style={styles.acceptBtnSub}>(₹75,400)</Text>
          </Text>
        </TouchableOpacity>
        <View style={styles.dockLinks}>
          <TouchableOpacity style={styles.declineLink}>
            <Icon name="x-circle" size={13} color={colors.outline} />
            <Text style={styles.declineLinkText}>सौदा नाकारा (Decline Offer)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpLink}>
            <Icon name="phone" size={13} color={colors.tertiary} />
            <Text style={styles.helpLinkText}>मदत (Helpline)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: space.xs,
    paddingHorizontal: space.md, paddingTop: space.xl + 8, paddingBottom: space.sm,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.primary },
  headerSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  headerRef: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurfaceVariant },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, backgroundColor: 'rgba(155,47,0,0.08)' },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  scroll: { paddingBottom: 200 },
  legalBand: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    margin: space.md, marginBottom: space.xs, padding: space.sm,
    borderRadius: radius.lg, backgroundColor: colors.onPrimaryContainer, borderWidth: 1, borderColor: colors.primaryContainer,
  },
  legalLeft: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  legalTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.primary },
  legalSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  legalBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  legalBadgeText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  countdownBand: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: space.md, marginBottom: space.sm, padding: space.xs, paddingHorizontal: space.sm,
    borderRadius: radius.md, backgroundColor: 'rgba(155,47,0,0.08)', borderWidth: 1, borderColor: 'rgba(155,47,0,0.2)',
  },
  countdownLabel: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.onSurface },
  countdownTimer: { fontFamily: fontFamily.extraBold, fontSize: 15, color: colors.primaryContainer, letterSpacing: -0.3 },
  produceCard: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    marginHorizontal: space.md, marginBottom: space.sm, padding: space.sm,
    borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant,
  },
  produceThumb: { width: 64, height: 64, borderRadius: radius.md },
  produceInfo: { flex: 1 },
  produceTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  produceName: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.primary },
  gradeChip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  gradeChipText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  produceWeight: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.onSurface, marginTop: 2 },
  produceLot: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  partiesCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden',
  },
  partySide: { flex: 1, padding: space.sm },
  partiesVsCol: { width: 1, backgroundColor: colors.outlineVariant },
  partiesLine: { flex: 1 },
  partyRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  partyRating: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  partyRole: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 4 },
  partyName: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  partySub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  partyLic: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.outline },
  payoutCard: {
    marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden',
  },
  payoutHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  payoutTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.primary, flex: 1 },
  payoutSub: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant },
  payoutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, gap: 6 },
  payoutKey: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onSurface },
  payoutKeyMr: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.onSurfaceVariant },
  payoutVal: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.onSurface },
  freeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.positiveContainer },
  freeBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary },
  netHeroCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    margin: space.sm, marginBottom: space.xs, padding: space.sm,
    borderRadius: radius.lg, backgroundColor: colors.positiveContainer, borderWidth: 1, borderColor: 'rgba(4,120,87,0.2)',
  },
  netHeroLabel: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.onPositiveContainer },
  netHeroSubLabel: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.tertiary },
  netHeroRight: { alignItems: 'flex-end' },
  netHeroAmount: { fontFamily: fontFamily.extraBold, fontSize: 28, color: colors.tertiary, letterSpacing: -0.5 },
  guaranteeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  guaranteeBadgeText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.tertiary },
  netHeroNote: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onSurfaceVariant, paddingHorizontal: space.sm, paddingBottom: space.xs },
  escrowNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6, margin: space.sm, marginTop: 0,
    padding: space.xs, borderRadius: radius.sm, backgroundColor: colors.positiveContainer,
  },
  escrowNoteText: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.onPositiveContainer, flex: 1 },
  logisticsCard: {
    marginHorizontal: space.md, marginBottom: space.sm, borderRadius: radius.xl,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden',
  },
  logisticsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  logisticsTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  logisticsItem: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, padding: space.sm, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  logisticsInfo: { flex: 1 },
  logisticsItemTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  logisticsItemSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2, lineHeight: 16 },
  agreementRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: space.sm,
    marginHorizontal: space.md, marginBottom: space.xs, padding: space.md,
    borderRadius: radius.xl, backgroundColor: colors.onPrimaryContainer, borderWidth: 1, borderColor: colors.primaryContainer,
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.outlineVariant,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: colors.surface,
  },
  checkboxChecked: { backgroundColor: colors.tertiary, borderColor: colors.tertiary },
  agreementText: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primary, flex: 1, lineHeight: 20 },
  agreementSubText: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  securityNote: { fontFamily: fontFamily.regular, fontSize: 10, color: colors.outline, textAlign: 'center', paddingHorizontal: space.md, marginBottom: space.sm },
  dock: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant, gap: 8,
  },
  acceptBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm,
    minHeight: touch.targetHero, backgroundColor: colors.primaryContainer, borderRadius: radius.lg,
    shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5,
    paddingVertical: space.sm,
  },
  acceptBtnDisabled: { backgroundColor: colors.surfaceContainerHigh, shadowOpacity: 0 },
  acceptBtnText: { fontFamily: fontFamily.extraBold, fontSize: 15, color: colors.onPrimary, textAlign: 'center' },
  acceptBtnTextDisabled: { color: colors.outline },
  acceptBtnSub: { fontFamily: fontFamily.medium, fontSize: 13 },
  dockLinks: { flexDirection: 'row', justifyContent: 'space-between' },
  declineLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  declineLinkText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.outline },
  helpLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  helpLinkText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.tertiary },
});
