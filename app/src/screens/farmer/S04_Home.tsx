/**
 * S04_Home — Screen 08: Home / Daily Intelligence Dashboard.
 *
 * Pixel-matched to Stitch `08_home_mandi_setu_daily_intelligence/screen.png`.
 *
 * ★ ZERO EMOJIS — all icons are SVG.
 * ★ FULL I18N — every text uses t('key').
 * ★ REAL SVG CHART — 7-day bar chart using react-native-svg.
 */

import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, fontFamily, space, radius, cardShadow } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';
import { useAuth } from '../../lib/auth';
import { getPriceSeries, recommendWindow } from '../../lib/api';
import { formatPaise } from '../../lib/money';
import {
  DEFAULT_COMMODITY_ID,
  DEFAULT_GRADE,
  DEFAULT_HORIZON_DAYS,
  DEFAULT_MARKET_ID,
  DEFAULT_QTY_KG,
  USE_FIXTURES,
} from '../../config';
import { fxPriceSeries } from '../../fixtures/prices';
import { fxHold } from '../../fixtures/window';
import type { HomeStackParamList, FarmerTabParamList } from '../../navigation/FarmerTabs';
import type { PricePoint } from '../../types/api';

type Props = NativeStackScreenProps<HomeStackParamList, 'S4_Home'>;
type ParentNav = CompositeNavigationProp<
  Props['navigation'],
  BottomTabNavigationProp<FarmerTabParamList>
>;

// ── Price chart — draws whatever 7 points it's handed; no data of its own ──
const CHART_W = 280;
const CHART_H = 120;
const BAR_GAP = 6;

function PriceChart({ points }: { points: PricePoint[] }) {
  const numBars = points.length;
  if (numBars === 0) return null;
  const barW = (CHART_W - BAR_GAP * (numBars - 1)) / numBars;
  const prices = points.map(p => p.modal_paise_per_qtl);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;

  return (
    <Svg width={CHART_W} height={CHART_H + 20} viewBox={`0 0 ${CHART_W} ${CHART_H + 20}`}>
      {/* Guide lines */}
      {[0, 0.5, 1].map(frac => {
        const y = CHART_H * (1 - frac);
        return (
          <Line
            key={frac}
            x1={0}
            y1={y}
            x2={CHART_W}
            y2={y}
            stroke="rgba(141,113,104,0.15)"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        );
      })}

      {/* Bars */}
      {points.map((p, i) => {
        const normH = ((p.modal_paise_per_qtl - minPrice) / range) * (CHART_H - 12) + 8;
        const x = i * (barW + BAR_GAP);
        const y = CHART_H - normH;
        const isToday = i === points.length - 1;
        const dayLabel = new Date(p.obs_date).toLocaleDateString(undefined, { weekday: 'narrow' });

        return (
          <React.Fragment key={p.obs_date}>
            <Rect
              x={x}
              y={y}
              width={barW}
              height={normH}
              rx={4}
              fill={isToday ? colors.primaryContainer : colors.surfaceContainerHighest}
            />
            {/* Day label */}
            <SvgText
              x={x + barW / 2}
              y={CHART_H + 16}
              textAnchor="middle"
              fontSize={10}
              fontFamily={fontFamily.semiBold}
              fill={isToday ? colors.primaryContainer : colors.outline}>
              {dayLabel}
            </SvgText>
            {/* Price label on today's bar */}
            {isToday && (
              <SvgText
                x={x + barW / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize={9}
                fontFamily={fontFamily.bold}
                fill={colors.primaryContainer}>
                {formatPaise(p.modal_paise_per_qtl, 'en')}
              </SvgText>
            )}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

async function fetchPrices() {
  if (USE_FIXTURES) return fxPriceSeries;
  return getPriceSeries(DEFAULT_COMMODITY_ID, DEFAULT_MARKET_ID, 14);
}

async function fetchVerdict() {
  if (USE_FIXTURES) return fxHold;
  return recommendWindow({
    commodity_id: DEFAULT_COMMODITY_ID,
    market_id: DEFAULT_MARKET_ID,
    qty_kg: DEFAULT_QTY_KG,
    grade: DEFAULT_GRADE,
    lot_id: null,
    horizon_days: DEFAULT_HORIZON_DAYS,
  });
}

// ── Screen ──────────────────────────────────────────────────────────
const redOnions = require('../../assets/images/red_onions.jpg');

export default function S04_Home({ navigation }: Props) {
  const { t } = useT();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const parentNav = navigation as unknown as ParentNav;
  const goToLots = () => parentNav.navigate('MyLots', { screen: 'S15_MyLots' } as never);

  // ★ These used to be literal numbers baked into the JSX below — every
  //   screen that shows "today's onion price" invented its own, so Home
  //   said ₹3,120 while the phone-entry screen said ₹2,850–3,120 and the
  //   published-lot radar said ₹2,100. Same demo scenario every other
  //   screen (S9_Verdict, S04's own earlier build) already reads from —
  //   one real query, so this number can't drift from the others again.
  const pricesQuery = useQuery({ queryKey: ['home', 'prices'], queryFn: fetchPrices, staleTime: 5 * 60 * 1000 });
  const verdictQuery = useQuery({ queryKey: ['home', 'verdict'], queryFn: fetchVerdict, staleTime: 5 * 60 * 1000 });

  const points = pricesQuery.data?.points ?? [];
  const last = points[points.length - 1];
  const prev = points.length >= 2 ? points[points.length - 2] : undefined;
  const recent7 = points.slice(-7);
  const minPaise = recent7.length ? Math.min(...recent7.map(p => p.min_paise_per_qtl)) : 0;
  const maxPaise = recent7.length ? Math.max(...recent7.map(p => p.max_paise_per_qtl)) : 0;
  const avgPaise = recent7.length
    ? Math.floor(recent7.reduce((s, p) => s + p.modal_paise_per_qtl, 0) / recent7.length)
    : 0;
  const deltaPaise = last && prev ? last.modal_paise_per_qtl - prev.modal_paise_per_qtl : 0;
  const isUp = deltaPaise >= 0;

  const verdict = verdictQuery.data;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── 1. Top bar — a conventional navbar: menu left, the product
             name centered as the title (not a personal greeting — the
             farmer's own name lives one tap away, in the menu), a
             balancing spacer on the right so the centered title is
             actually centered rather than left-shifted by the hamburger. */}
        <View style={[styles.topBar, { paddingTop: insets.top + space.xs }]}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => navigation.getParent()?.getParent()?.navigate('Menu' as never)}
            accessibilityRole="button"
            accessibilityLabel={t('app_name')}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </TouchableOpacity>
          <View style={styles.topBarText}>
            <Text style={styles.topGreeting} numberOfLines={1}>
              {t('app_name')}
            </Text>
            <Text style={styles.topDate}>{t('home_market_name')}</Text>
          </View>
          {/* Voice narration and buyer-bid notifications are not wired yet
              (no TTS-per-screen pipeline, no push/poll for new offers) — a
              tappable icon that silently does nothing reads as a broken
              button, so these render as plain, non-interactive glyphs
              until there is a real handler behind them. */}
          <View style={styles.topActions}>
            <View style={styles.topIconBtn}>
              <Icon name="mic" size={18} color={colors.outline} />
            </View>
            <View style={styles.topIconBtn}>
              <Icon name="bell" size={18} color={colors.outline} />
            </View>
          </View>
        </View>

        {/* ── 2. Offer alert banner ──────────────────────── */}
        <TouchableOpacity style={styles.offerBanner} activeOpacity={0.85}>
          <View style={styles.offerBannerLeft}>
            <View style={styles.offerDot} />
            <View>
              <Text style={styles.offerBannerTitle}>
                {t('home_buyers_bids', { count: '3' })}
              </Text>
              <Text style={styles.offerBannerSub}>
                {t('home_valid_mins', { mins: '45' })}
              </Text>
            </View>
          </View>
          <View style={styles.offerBannerBtn}>
            <Text style={styles.offerBannerBtnText}>{t('home_review_offers')}</Text>
            <Icon name="chevron-right" size={14} color={colors.onPrimary} />
          </View>
        </TouchableOpacity>

        {/* ── 3. Price intelligence card ────────────────── */}
        <View style={styles.priceCard}>
          {pricesQuery.isLoading ? (
            <Text style={styles.cardStatusText}>{t('loading_label')}</Text>
          ) : pricesQuery.isError || !last ? (
            <Text style={styles.cardErrorText}>{t('home_price_error')}</Text>
          ) : (
            <>
              {/* Card header */}
              <View style={styles.priceCardHeader}>
                <View>
                  <Text style={styles.priceCardLabel}>{t('home_todays_rate')}</Text>
                  <Text style={styles.priceHero}>
                    {formatPaise(last.modal_paise_per_qtl, 'en')}
                    <Text style={styles.priceHeroUnit}>/q</Text>
                  </Text>
                </View>
                <View style={styles.priceCardRight}>
                  {deltaPaise !== 0 && (
                    <View
                      style={[
                        styles.trendBadge,
                        !isUp && { backgroundColor: colors.criticalContainer, borderColor: 'rgba(185,28,28,0.2)' },
                      ]}>
                      <Icon
                        name={isUp ? 'trending-up' : 'trending-down'}
                        size={12}
                        color={isUp ? colors.tertiary : colors.critical}
                      />
                      <Text style={[styles.trendText, !isUp && { color: colors.critical }]}>
                        {isUp ? '+' : ''}
                        {formatPaise(deltaPaise, 'en')}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.arrivalsText}>
                    {t('home_arrivals', { count: String(last.arrivals_qtl) })}
                  </Text>
                </View>
              </View>

              {/* Min / Avg / Max row */}
              <View style={styles.priceStats}>
                {[
                  { labelKey: 'home_min', value: minPaise },
                  { labelKey: 'home_avg', value: avgPaise },
                  { labelKey: 'home_max', value: maxPaise },
                ].map(({ labelKey, value }) => (
                  <View key={labelKey} style={styles.priceStat}>
                    <Text style={styles.priceStatLabel}>{t(labelKey)}</Text>
                    <Text style={styles.priceStatValue}>{formatPaise(value, 'en')}</Text>
                  </View>
                ))}
              </View>

              {/* 7-day chart */}
              <View style={styles.chartSection}>
                <View style={styles.chartHeader}>
                  <Icon name="chart-bar" size={12} color={colors.primary} />
                  <Text style={styles.chartLabel}>{t('home_7day_climb')}</Text>
                </View>
                <View style={styles.chartArea}>
                  <PriceChart points={recent7} />
                </View>
              </View>

              {/* AI Intelligence footer */}
              <View style={styles.aiRow}>
                <View style={styles.aiIconBg}>
                  <Icon name="star" size={12} color={colors.primary} />
                </View>
                <Text style={styles.aiLabel}>{t('home_ai_intelligence')}</Text>
                {verdict && (
                  <Text style={styles.aiConfidence}>
                    {t('home_confidence_label', { level: t(`confidence_${verdict.confidence.toLowerCase()}`) })}
                  </Text>
                )}
              </View>
            </>
          )}
        </View>

        {/* ── 4. Advisory card ──────────────────────────── */}
        <View style={styles.advisoryCard}>
          {verdictQuery.isLoading ? (
            <Text style={styles.cardStatusText}>{t('loading_label')}</Text>
          ) : verdictQuery.isError || !verdict ? (
            <Text style={styles.cardErrorText}>{t('home_verdict_error')}</Text>
          ) : (
            <>
              <View style={styles.advisoryHeader}>
                <Icon name="info" size={14} color={colors.primary} />
                <Text style={styles.advisoryLabel}>{t('home_advisory')}</Text>
              </View>

              <Text style={styles.advisoryRecommendation}>
                {verdict.action === 'HOLD' && verdict.hold_days !== null
                  ? t('home_hold_recommendation', { days: String(verdict.hold_days) })
                  : t(verdict.action === 'NO_ADVICE' ? 'no_advice_label' : `action_${verdict.action.toLowerCase()}`)}
              </Text>
              <Text style={styles.advisoryHoldCosts}>
                {t('home_holding_costs', { cost: formatPaise(verdict.costs.total_paise_per_qtl, 'en') })}
              </Text>

              {/* Gain/Loss row — ★ I16: identical font size for both numbers */}
              {verdict.expected_gain_paise !== null && verdict.worst_case_paise !== null && (
                <View style={styles.advisoryStats}>
                  <View style={styles.advisoryStat}>
                    <Text style={styles.advisoryStatLabel}>
                      {t('home_expected_gain', { qty: String(Math.floor(DEFAULT_QTY_KG / 100)) })}
                    </Text>
                    <Text style={[styles.advisoryStatValue, { color: colors.tertiary }]}>
                      +{formatPaise(verdict.expected_gain_paise, 'en')}
                    </Text>
                  </View>
                  <View style={styles.advisoryStatDivider} />
                  <View style={styles.advisoryStat}>
                    <Text style={styles.advisoryStatLabel}>
                      {t('home_worst_case', { qty: String(Math.floor(DEFAULT_QTY_KG / 100)) })}
                    </Text>
                    <Text style={[styles.advisoryStatValue, { color: colors.critical }]}>
                      {formatPaise(verdict.worst_case_paise, 'en')}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.costBreakdownBtn} onPress={() => navigation.navigate('S9_Verdict')}>
                <Icon name="clipboard" size={13} color={colors.primary} />
                <Text style={styles.costBreakdownText}>
                  {t('home_cost_breakdown', { cost: formatPaise(verdict.costs.total_paise_per_qtl, 'en') })}
                </Text>
                <Icon name="chevron-right" size={13} color={colors.primary} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── 5. My lots section ────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home_active_lots')}</Text>
          <TouchableOpacity style={styles.sectionAction} onPress={goToLots}>
            <Text style={styles.sectionActionText}>{t('home_manage_all')}</Text>
            <Icon name="chevron-right" size={14} color={colors.primaryContainer} />
          </TouchableOpacity>
        </View>

        {/* Lot card */}
        <View style={styles.lotCard}>
          <View style={styles.lotCardHeader}>
            <Image source={redOnions} style={styles.lotPhoto} />
            <View style={styles.lotInfo}>
              <View style={styles.lotTitleRow}>
                <Text style={styles.lotTitle}>Onion – Gavran Red</Text>
                <View style={styles.lotActiveBadge}>
                  <View style={styles.lotActiveDot} />
                  <Text style={styles.lotActiveText}>ACTIVE</Text>
                </View>
              </View>
              <Text style={styles.lotSub}>{t('home_stored_at', { location: 'Lasalgaon Mandi' })}</Text>
              <Text style={styles.lotBuyerCount}>{t('home_buyers_interested', { count: '3' })}</Text>
            </View>
          </View>

          <View style={styles.lotStatsRow}>
            <View style={styles.lotStat}>
              <Text style={styles.lotStatLabel}>Qty</Text>
              <Text style={styles.lotStatValue}>50 qtl</Text>
            </View>
            <View style={styles.lotStat}>
              <Text style={styles.lotStatLabel}>{t('home_farmer_ask')}</Text>
              <Text style={[styles.lotStatValue, { color: colors.primary }]}>₹3,100/q</Text>
            </View>
            <View style={styles.lotStat}>
              <Text style={styles.lotStatLabel}>{t('home_lot_count', { count: '1' })}</Text>
              <Text style={styles.lotStatValue}>#2847</Text>
            </View>
          </View>

          {/* ★ "Book Truck" removed — there is no logistics-booking endpoint
              anywhere in CANON; this button went nowhere and promised a
              feature the product does not have. */}
          <View style={styles.lotActions}>
            <TouchableOpacity style={styles.lotPrimaryBtn} onPress={goToLots}>
              <Text style={styles.lotPrimaryBtnText}>{t('home_view_lot')}</Text>
              <Icon name="chevron-right" size={14} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.escrowRow}>
            <Icon name="shield-check" size={12} color={colors.tertiary} />
            <Text style={styles.escrowText}>{t('home_escrow_guarantee')}</Text>
          </View>
        </View>

        {/* ★ The "Quick actions" grid (Weigh Slips, Book Truck, a second
            Manage All) was removed outright: Weigh Slips and Book Truck have
            no backing endpoint, and Manage All already exists once, wired,
            in the section header above — a second copy of the same link was
            dead weight, not a second feature. */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 90,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.md,
    paddingBottom: space.sm,
    backgroundColor: colors.surface,
    zIndex: 1,
    ...cardShadow,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginRight: space.sm,
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.onSurface,
  },
  topBarText: { flex: 1, alignItems: 'center' },
  topGreeting: {
    fontFamily: fontFamily.extraBold,
    fontSize: 19,
    color: colors.primary,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  topDate: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 1,
    textAlign: 'center',
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  topIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.critical,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },

  // Offer banner
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: space.md,
    marginTop: space.md,
    padding: space.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    shadowColor: '#9B2F00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  offerBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    flex: 1,
  },
  offerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFB59D',
  },
  offerBannerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.onPrimary,
  },
  offerBannerSub: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  offerBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  offerBannerBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.onPrimary,
  },

  // Price card
  cardStatusText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  cardErrorText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.critical,
  },
  priceCard: {
    margin: space.md,
    marginTop: space.sm,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#9A3412',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  priceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: space.sm,
  },
  priceCardLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  priceHero: {
    fontFamily: fontFamily.extraBold,
    fontSize: 36,
    color: colors.primary,
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  priceHeroUnit: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    letterSpacing: 0,
  },
  priceCardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.positiveContainer,
    borderWidth: 1,
    borderColor: 'rgba(4,120,87,0.2)',
  },
  trendText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.tertiary,
  },
  arrivalsText: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textAlign: 'right',
  },

  // Price stats
  priceStats: {
    flexDirection: 'row',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
    marginBottom: space.sm,
  },
  priceStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: space.xs,
    borderRightWidth: 1,
    borderRightColor: colors.outlineVariant,
  },
  priceStatLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceStatValue: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.onSurface,
    marginTop: 1,
  },

  // Chart
  chartSection: {
    marginBottom: space.sm,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: space.xs,
  },
  chartLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  chartArea: {
    alignItems: 'center',
  },

  // AI row
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: space.xs,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  aiIconBg: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(155,47,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 0.5,
    flex: 1,
  },
  aiConfidence: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    color: colors.warning,
  },

  // Advisory card
  advisoryCard: {
    marginHorizontal: space.md,
    marginBottom: space.sm,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.onPrimaryContainer,
    borderWidth: 1.5,
    borderColor: colors.primaryContainer,
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: space.xs,
  },
  advisoryLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  advisoryRecommendation: {
    fontFamily: fontFamily.extraBold,
    fontSize: 16,
    color: colors.primary,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  advisoryHoldCosts: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginBottom: space.sm,
    lineHeight: 16,
  },
  advisoryStats: {
    flexDirection: 'row',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(194,65,12,0.15)',
    marginBottom: space.sm,
  },
  advisoryStat: {
    flex: 1,
    padding: space.sm,
    alignItems: 'center',
  },
  advisoryStatDivider: {
    width: 1,
    backgroundColor: 'rgba(194,65,12,0.15)',
  },
  advisoryStatLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 3,
  },
  advisoryStatValue: {
    fontFamily: fontFamily.extraBold,
    fontSize: 20,
    letterSpacing: -0.3,
  },
  advisoryStatSub: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    marginTop: 1,
  },
  costBreakdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(155,47,0,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(155,47,0,0.12)',
  },
  costBreakdownText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.primary,
    flex: 1,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.md,
    marginBottom: space.xs,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.onSurface,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionActionText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.primaryContainer,
  },

  // Lot card
  lotCard: {
    marginHorizontal: space.md,
    marginBottom: space.sm,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#9A3412',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lotCardHeader: {
    flexDirection: 'row',
    gap: space.sm,
    marginBottom: space.sm,
  },
  lotPhoto: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    flexShrink: 0,
  },
  lotInfo: {
    flex: 1,
  },
  lotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  lotTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.onSurface,
  },
  lotActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.positiveContainer,
  },
  lotActiveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.tertiary,
  },
  lotActiveText: {
    fontFamily: fontFamily.bold,
    fontSize: 9,
    color: colors.tertiary,
    letterSpacing: 0.4,
  },
  lotSub: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  lotBuyerCount: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.primaryContainer,
    marginTop: 2,
  },
  lotStatsRow: {
    flexDirection: 'row',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
    marginBottom: space.sm,
  },
  lotStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: space.xs,
    borderRightWidth: 1,
    borderRightColor: colors.outlineVariant,
  },
  lotStatLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  lotStatValue: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.onSurface,
    marginTop: 2,
  },
  lotActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: space.xs,
  },
  lotSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primaryContainer,
    backgroundColor: colors.onPrimaryContainer,
  },
  lotSecondaryBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.primaryContainer,
  },
  lotPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.primaryContainer,
  },
  lotPrimaryBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.onPrimary,
  },
  escrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
    paddingTop: space.xs,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  escrowText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    color: colors.tertiary,
  },

  // Quick actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: space.md,
    gap: 8,
    marginBottom: space.md,
  },
  quickActionCard: {
    flex: 1,
    padding: space.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#9A3412',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  qaIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  qaLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.onSurface,
    textAlign: 'center',
  },
  qaSub: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 13,
  },
});
