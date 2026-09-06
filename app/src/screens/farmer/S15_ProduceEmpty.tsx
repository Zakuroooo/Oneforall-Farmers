/**
 * S15_ProduceEmpty — Screen 15: My Produce empty state.
 * Matched to Stitch `15_my_produce_empty_state_listing_intro/screen.png`
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

const FEATURES = [
  { iconName: 'handshake', bgColor: 'rgba(194,65,12,0.08)', iconColor: '#C2410C', titleKey: 'produce_feat1_title', subKey: 'produce_feat1_sub', badgeKey: 'produce_feat1_badge', badgeColor: colors.surfaceContainerHigh },
  { iconName: 'camera', bgColor: 'rgba(4,120,87,0.08)', iconColor: colors.tertiary, titleKey: 'produce_feat2_title', subKey: 'produce_feat2_sub', badgeKey: 'produce_feat2_badge', badgeColor: colors.positiveContainer },
  { iconName: 'shield-check', bgColor: 'rgba(4,120,87,0.08)', iconColor: colors.tertiary, titleKey: 'produce_feat3_title', subKey: 'produce_feat3_sub', badgeKey: 'produce_feat3_badge', badgeColor: colors.positiveContainer },
] as const;

export default function S15_ProduceEmpty({ navigation }: any) {
  const { t } = useT();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Image source={farmerPortrait} style={styles.avatar} />
          <View>
            <Text style={styles.farmerName}>Rambhau Patil</Text>
            <View style={styles.locRow}>
              <Icon name="map-pin" size={11} color={colors.outline} />
              <Text style={styles.farmerLoc}>Niphad, Lasalgaon</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.listenBtn}>
          <Icon name="volume" size={13} color={colors.primary} />
          <Text style={styles.listenText}>{t('splash_listen')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Active cycle banner */}
        <View style={styles.cycleBanner}>
          <View style={styles.cycleGreen} />
          <Text style={styles.cycleText}>{t('produce_empty_cycle')}</Text>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>{t('produce_empty_heading')}</Text>
        <Text style={styles.headingSub}>{t('produce_empty_sub')}</Text>

        {/* Hero image card */}
        <View style={styles.heroCard}>
          <Image source={redOnions} style={styles.heroImage} />
          <View style={styles.heroBenchmark}>
            <Icon name="check-circle" size={13} color={colors.tertiary} />
            <Text style={styles.heroBenchmarkText}>{t('produce_benchmark')}</Text>
          </View>
          <View style={styles.heroQuote}>
            <Text style={styles.heroQuoteText}>{t('produce_empty_quote')}</Text>
            <Text style={styles.heroQuoteSub}>{t('produce_empty_quote_sub')}</Text>
          </View>
        </View>

        {/* Why section */}
        <View style={styles.whyHeader}>
          <Text style={styles.whyTitle}>{t('produce_why_title')}</Text>
          <Text style={styles.whyFarmer}>{t('produce_why_farmer')}</Text>
        </View>

        <View style={styles.featureList}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={[styles.featureIconBg, { backgroundColor: f.bgColor }]}>
                <Icon name={f.iconName} size={20} color={f.iconColor} />
              </View>
              <View style={styles.featureInfo}>
                <View style={styles.featureTitleRow}>
                  <Text style={styles.featureTitle}>{t(f.titleKey)}</Text>
                  <View style={[styles.featureBadge, { backgroundColor: f.badgeColor }]}>
                    <Text style={styles.featureBadgeText}>{t(f.badgeKey)}</Text>
                  </View>
                </View>
                <Text style={styles.featureSub}>{t(f.subKey)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Voice CTA */}
        <View style={styles.voiceRow}>
          <Icon name="mic" size={16} color={colors.primary} />
          <Text style={styles.voiceText}>
            {t('produce_voice_cta')} <Text style={styles.voicePhrase}>{t('produce_voice_phrase')}</Text>
          </Text>
        </View>

        {/* Help card */}
        <View style={styles.helpCard}>
          <View style={styles.helpIconBg}>
            <Icon name="phone" size={18} color={colors.primary} />
          </View>
          <View style={styles.helpInfo}>
            <Text style={styles.helpTitle}>{t('produce_help_title')}</Text>
            <Text style={styles.helpSub}>{t('produce_help_sub')}</Text>
          </View>
          <TouchableOpacity style={styles.callBtn}>
            <Icon name="phone" size={13} color={colors.primaryContainer} />
            <Text style={styles.callBtnText}>{t('produce_help_call')}</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.apmc}>{t('produce_apmc_reg')}</Text>
      </ScrollView>

      {/* Bottom tab bar simulation + CTA */}
      <View style={styles.dock}>
        <TouchableOpacity style={styles.ctaBtn}>
          <View style={styles.ctaPlusCircle}>
            <Icon name="plus" size={18} color={colors.onPrimary} />
          </View>
          <View>
            <Text style={styles.ctaText}>{t('produce_cta_list')}</Text>
            <Text style={styles.ctaSub}>{t('produce_cta_sub')}</Text>
          </View>
          <Icon name="arrow-right" size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
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
  farmerName: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  farmerLoc: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  listenBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full,
    backgroundColor: 'rgba(155,47,0,0.08)', borderWidth: 1, borderColor: 'rgba(155,47,0,0.15)',
  },
  listenText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.primary },
  scroll: { paddingBottom: 100 },
  cycleBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: space.md, marginTop: space.md, padding: space.xs,
    borderRadius: radius.full, backgroundColor: colors.positiveContainer,
    borderWidth: 1, borderColor: 'rgba(4,120,87,0.2)', alignSelf: 'flex-start',
    paddingHorizontal: space.sm,
  },
  cycleGreen: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.tertiary },
  cycleText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.tertiary, letterSpacing: 0.4, textTransform: 'uppercase' },
  heading: {
    fontFamily: fontFamily.extraBold, fontSize: 28, color: colors.onSurface,
    paddingHorizontal: space.md, marginTop: space.sm, letterSpacing: -0.3,
  },
  headingSub: {
    fontFamily: fontFamily.regular, fontSize: 13, color: colors.onSurfaceVariant,
    paddingHorizontal: space.md, marginBottom: space.md,
  },
  heroCard: {
    marginHorizontal: space.md, borderRadius: radius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.outlineVariant, marginBottom: space.md,
  },
  heroImage: { width: '100%', height: 180 },
  heroBenchmark: {
    position: 'absolute', top: space.sm, left: space.sm,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: radius.full,
  },
  heroBenchmarkText: { fontFamily: fontFamily.bold, fontSize: 11, color: colors.onSurface },
  heroQuote: { padding: space.md, backgroundColor: colors.surface },
  heroQuoteText: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.onSurface, lineHeight: 22 },
  heroQuoteSub: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, marginTop: 4 },
  whyHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: space.md, marginBottom: space.xs,
  },
  whyTitle: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.onSurface },
  whyFarmer: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primaryContainer },
  featureList: { paddingHorizontal: space.md, gap: 10, marginBottom: space.md },
  featureCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: space.sm,
    padding: space.md, borderRadius: radius.lg,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant,
  },
  featureIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureInfo: { flex: 1 },
  featureTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 },
  featureTitle: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.onSurface },
  featureBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full },
  featureBadgeText: { fontFamily: fontFamily.bold, fontSize: 10, color: colors.onSurface },
  featureSub: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.onSurfaceVariant, lineHeight: 17 },
  voiceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center',
    marginHorizontal: space.md, marginBottom: space.md,
  },
  voiceText: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.onSurfaceVariant },
  voicePhrase: { fontFamily: fontFamily.bold, color: colors.primaryContainer },
  helpCard: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    marginHorizontal: space.md, marginBottom: space.xs, padding: space.sm,
    borderRadius: radius.lg, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.outlineVariant,
  },
  helpIconBg: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(155,47,0,0.08)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  helpInfo: { flex: 1 },
  helpTitle: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.onSurface },
  helpSub: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.onSurfaceVariant },
  callBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.primaryContainer,
  },
  callBtnText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.primaryContainer },
  apmc: {
    fontFamily: fontFamily.regular, fontSize: 10, color: colors.outline,
    textAlign: 'center', paddingHorizontal: space.md, marginBottom: space.sm,
  },
  dock: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: space.md, paddingBottom: space.xl, paddingTop: space.sm,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant,
  },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    height: touch.targetHero, backgroundColor: colors.primaryContainer,
    borderRadius: radius.lg, paddingHorizontal: space.md,
    shadowColor: '#C2410C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5,
  },
  ctaPlusCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  ctaText: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.onPrimary, flex: 1 },
  ctaSub: { fontFamily: fontFamily.regular, fontSize: 11, color: 'rgba(255,255,255,0.75)' },
});
