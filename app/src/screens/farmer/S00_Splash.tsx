/**
 * S00_Splash — Screen 01: Landing / Splash screen.
 *
 * Pixel-matched to Stitch `01_splash_bhaav_ka_bharosa_seedha_sauda/screen.png`.
 *
 * ★ ZERO EMOJIS — all icons are SVG via Icon component.
 * ★ FULL I18N — every text uses t('key'), language switcher changes all text live.
 */

import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fontFamily, space, radius, touch } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';
import type { Locale } from '../../types/api';
import type { AuthStackParamList } from '../../navigation/AuthStack';
import { demoTodayRange } from '../../lib/demoPrice';
import { ListenButton } from '../../components/ui/ListenButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'S0_Splash'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const mandiWarehouse = require('../../assets/images/mandi_warehouse.jpg');

export default function S00_Splash({ navigation }: Props) {
  const { t, locale, setLocale } = useT();
  const [selectedLang, setSelectedLang] = useState<Locale>(locale);

  const handleLangSwitch = (lang: Locale) => {
    setSelectedLang(lang);
    setLocale(lang);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Ambient glow effects */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowMidRight} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── 1. Top ribbon ─────────────────────────────────── */}
        <View style={styles.topRibbon}>
          <View style={styles.liveChip}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{t('splash_live_mandi')}</Text>
          </View>
          {/* ★ This pill had no `onPress` at all — the very first speaker a
              farmer meets did nothing when tapped. `ListenButton` owns the
              behaviour so it cannot go dead again by copy-paste, and it reads
              the screen: the product name, the tagline, and today's price. */}
          <ListenButton
            text={`${t('splash_app_name')}. ${t('splash_tagline')}. ${t('splash_today_price')}: ${demoTodayRange(locale)}.`}
          />
        </View>

        {/* ── 2. App emblem ─────────────────────────────────── */}
        <View style={styles.emblemContainer}>
          <View style={styles.emblemGlow} />
          <View style={styles.emblemOuter}>
            <View style={styles.emblemInner}>
              <Icon name="leaf" size={40} color="#FFFFFF" />
              <View style={styles.emblemBridge} />
              <Text style={styles.emblemSetuText}>SETU</Text>
            </View>
          </View>
          {/* Verified badge */}
          <View style={styles.verifiedBadge}>
            <Icon name="check-circle" size={12} color={colors.onTertiary} />
            <Text style={styles.verifiedText}>{t('splash_verified')}</Text>
          </View>
        </View>

        {/* ── 3. App name ───────────────────────────────────── */}
        {/* ★ One name. This rendered `splash_app_name` *and*
            `splash_app_name_latin` — so an English farmer saw "Krishi Mitra"
            with "KRISHI MITRA" stacked beneath it, and a Marathi one saw two
            scripts at once on the app's first screen. */}
        <Text style={styles.appName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          {t('splash_app_name')}
        </Text>

        {/* ── 4. Tagline ────────────────────────────────────── */}
        <View style={styles.taglineCard}>
          {/* Same duplication as the name: `splash_tagline` and
              `splash_tagline_sub` say the same thing twice. */}
          <Text style={styles.taglineDevanagari}>{t('splash_tagline')}</Text>
        </View>

        {/* ── 5. Live price strip ───────────────────────────── */}
        <View style={styles.priceStrip}>
          <View style={styles.priceStripInner}>
            <Image source={mandiWarehouse} style={styles.pricePhoto} />
            <View style={styles.priceInfo}>
              <View style={styles.priceHeader}>
                <View style={styles.priceLabelRow}>
                  <Icon name="trending-up" size={12} color={colors.tertiary} />
                  <Text style={styles.priceLabel}>{t('splash_today_price')}</Text>
                </View>
                <Text style={styles.priceMarket}>{t('splash_market_name')}</Text>
              </View>
              <Text style={styles.priceCommodity}>{t('splash_commodity')}</Text>
              <Text style={styles.priceRange}>
                {demoTodayRange(locale)}
                <Text style={styles.priceUnit}> {t('splash_per_quintal')}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* ── 6. Trust badges ───────────────────────────────── */}
        <View style={styles.trustGrid}>
          <View style={styles.trustCard}>
            <View style={[styles.trustIconBg, { backgroundColor: 'rgba(155,47,0,0.08)' }]}>
              <Icon name="building" size={16} color={colors.primary} />
            </View>
            <Text style={styles.trustTitle}>{t('splash_apmc_enam')}</Text>
            <Text style={styles.trustSub}>{t('splash_apmc_sub')}</Text>
          </View>
          <View style={styles.trustCard}>
            <View style={[styles.trustIconBg, { backgroundColor: 'rgba(0,97,70,0.08)' }]}>
              <Icon name="lock" size={16} color={colors.tertiary} />
            </View>
            <Text style={styles.trustTitle}>{t('splash_secured')}</Text>
            <Text style={[styles.trustSub, { color: colors.tertiary, fontFamily: fontFamily.bold }]}>
              {t('splash_secured_sub')}
            </Text>
          </View>
          <View style={styles.trustCard}>
            <View style={[styles.trustIconBg, { backgroundColor: 'rgba(194,65,12,0.08)' }]}>
              <Icon name="handshake" size={16} color={colors.secondaryContainer} />
            </View>
            <Text style={styles.trustTitle}>{t('splash_direct')}</Text>
            <Text style={styles.trustSub}>{t('splash_direct_sub')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* ── 7. Bottom action pad (fixed) ────────────────── */}
      <View style={styles.bottomDock}>
        {/* Language selector */}
        <View style={styles.langRow}>
          <Icon name="globe" size={14} color={colors.outline} />
          {(['mr', 'hi', 'en'] as Locale[]).map(lang => {
            const isActive = selectedLang === lang;
            const label = lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिंदी' : 'English';
            return (
              <TouchableOpacity
                key={lang}
                style={[styles.langPill, isActive && styles.langActive]}
                onPress={() => handleLangSwitch(lang)}>
                <Text style={[styles.langText, isActive && styles.langActiveText]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CTA button */}
        <TouchableOpacity
          style={styles.ctaBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('S1_Language')}>
          <Text style={styles.ctaText}>{t('splash_get_started')}</Text>
          <Icon name="arrow-right" size={20} color={colors.onPrimary} />
        </TouchableOpacity>

        {/* OTP login link */}
        <TouchableOpacity style={styles.otpRow} activeOpacity={0.7}>
          <Icon name="zap" size={12} color={colors.tertiary} />
          <Text style={styles.otpText}>{t('splash_otp_login')}</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <View style={styles.footerDot} />
            <Text style={styles.footerText}>{t('splash_footer_node')}</Text>
          </View>
          <View style={styles.footerRight}>
            <Icon name="shield-check" size={10} color={colors.tertiary} />
            <Text style={styles.footerText}>{t('splash_footer_encrypt')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: space.xxl,
  },

  // Ambient glow
  glowTopLeft: {
    position: 'absolute',
    top: -96,
    left: -80,
    width: 384,
    height: 384,
    borderRadius: 192,
    backgroundColor: 'rgba(194,65,12,0.06)',
  },
  glowMidRight: {
    position: 'absolute',
    top: 250,
    right: -96,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(155,47,0,0.04)',
  },

  // Top ribbon
  topRibbon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.md,
    paddingTop: space.xl + 20,
    paddingBottom: space.xs,
    width: '100%',
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.tertiary,
    marginRight: 6,
  },
  liveText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.tertiary,
    textTransform: 'uppercase',
  },
  listenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(155,47,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(155,47,0,0.15)',
    gap: 4,
  },
  listenText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.3,
    color: colors.primary,
  },

  // Emblem
  emblemContainer: {
    alignItems: 'center',
    marginTop: space.xxl,
    marginBottom: space.md,
    position: 'relative',
  },
  emblemGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 24,
    backgroundColor: 'rgba(194,65,12,0.08)',
    top: -16,
  },
  emblemOuter: {
    width: 112,
    height: 112,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9A3412',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  emblemInner: {
    width: 96,
    height: 96,
    borderRadius: 20,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emblemBridge: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 2,
    marginTop: 4,
    marginBottom: 2,
  },
  emblemSetuText: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.9)',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -8,
    right: -12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tertiary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.surface,
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verifiedText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.onTertiary,
  },

  // App name
  /**
   * ★ The title was clipped under the logo in Marathi and Hindi. Cause:
   *   `fontSize: 40` with `lineHeight: 48`. Devanagari needs far more
   *   vertical room than Latin at the same size — the shirorekha and the
   *   matras above it (कृषी) plus descenders below sit outside what a 1.2×
   *   line box allows, so the glyph tops were cut. Latin never showed it,
   *   which is why it read as a logo-overflow bug rather than a type bug.
   *   1.45× plus explicit padding clears both extremes in all three scripts.
   */
  appName: {
    fontFamily: fontFamily.extraBold,
    fontSize: 38,
    lineHeight: 58,
    paddingTop: 6,
    paddingBottom: 2,
    color: colors.primary,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: space.md,
    alignSelf: 'stretch',
    paddingHorizontal: space.md,
  },

  // Tagline
  taglineCard: {
    marginTop: space.lg,
    marginHorizontal: space.xxl,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(225,191,181,0.5)',
    alignItems: 'center',
  },
  taglineDevanagari: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.onSurface,
    textAlign: 'center',
  },

  // Price strip
  priceStrip: {
    marginTop: space.lg,
    marginHorizontal: space.md,
    width: SCREEN_WIDTH - space.md * 2,
  },
  priceStripInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(225,191,181,0.5)',
    overflow: 'hidden',
  },
  pricePhoto: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    marginRight: space.sm,
  },
  priceInfo: {
    flex: 1,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  priceLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.tertiary,
    letterSpacing: 0.2,
  },
  priceMarket: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.outline,
  },
  priceCommodity: {
    fontFamily: fontFamily.extraBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.onSurface,
  },
  priceRange: {
    fontFamily: fontFamily.extraBold,
    fontSize: 18,
    lineHeight: 22,
    color: colors.primary,
    letterSpacing: -0.3,
  },
  priceUnit: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },

  // Trust grid
  trustGrid: {
    flexDirection: 'row',
    paddingHorizontal: space.md,
    marginTop: space.md,
    gap: 8,
  },
  trustCard: {
    flex: 1,
    padding: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(225,191,181,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  trustIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  trustTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 11,
    lineHeight: 14,
    color: colors.onSurface,
  },
  trustSub: {
    fontSize: 10,
    fontFamily: fontFamily.medium,
    color: colors.onSurfaceVariant,
    lineHeight: 12,
    marginTop: 2,
  },

  // Bottom dock
  bottomDock: {
    paddingHorizontal: space.md,
    paddingTop: space.xs,
    paddingBottom: space.lg,
    backgroundColor: colors.surface,
  },

  // Language selector
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: 'rgba(225,191,181,0.5)',
    alignSelf: 'center',
    gap: 2,
  },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginLeft: 4,
  },
  langActive: {
    backgroundColor: colors.primary,
    shadowColor: '#9A3412',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  langText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  langActiveText: {
    fontFamily: fontFamily.bold,
    color: colors.onPrimary,
  },

  // CTA
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: touch.targetHero,
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.lg,
    gap: space.sm,
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.39,
    shadowRadius: 14,
    elevation: 6,
  },
  ctaText: {
    fontFamily: fontFamily.extraBold,
    fontSize: 18,
    color: colors.onPrimary,
    letterSpacing: 0.3,
  },

  // OTP link
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.sm,
    gap: 4,
  },
  otpText: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.2,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.md,
    paddingTop: space.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(225,191,181,0.4)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.tertiary,
  },
  footerText: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.2,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
});
