/**
 * The Market tab — Stitch screen 09 (`09_market_180_day_history_14_day_
 * forecast_corridor/code.html`), built as the one screen that design
 * actually is: today's benchmark, the 180-day trend, the forecast corridor,
 * and nearby mandis ranked by *net* payout, in one scroll.
 *
 * ★ What this replaces: a four-link menu ("Price history / Forecast /
 *   Nearby markets / How reliable is the model?") that was never a Stitch
 *   screen at all — it was scaffolding invented to reach four separate
 *   pre-Stitch screens. Those four still exist and are still reachable from
 *   the "Go deeper" row at the bottom; they are simply no longer what the
 *   tab opens onto.
 *
 * ★ Every figure on this screen is read from a real response shape, never
 *   from the mockup. The Stitch HTML hardcodes ₹2,050 / 28,400 bags / "84%
 *   Confidence" / "+₹6,200 gain" as design placeholders. Those specific
 *   numbers do not appear here: the benchmark comes from the latest
 *   `PricePoint`, arrivals from `arrivals_qtl`, the corridor from the
 *   forecast's own p10/p50/p90, model quality from `ModelCardSummary`
 *   (MASE and 80% coverage — the two numbers the card actually carries),
 *   and every nearby row from `NearbyMarketRow`'s own gross/transport/
 *   commission/net. A number with no field behind it is not rendered.
 *
 * ★ I8: `source` is badged per series — nothing that is not AGMARKNET/MSAMB
 *   passes as observed mandi data.
 * ★ I16: the corridor's floor (p10) renders at the same size and weight as
 *   its ceiling (p90). Neither is smaller, greyer, or behind a tap.
 * ★ ZERO EMOJIS — every glyph is the shared SVG `Icon`.
 */

import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, fontFamily, radius, space, type as typography } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';
import { useAuth } from '../../lib/auth';
import { formatNumber, formatPaise, toQuintal } from '../../lib/money';
import { formatDateShort } from '../../lib/dates';
import { getForecast, getNearbyMarkets, getPriceSeries } from '../../lib/api';
import {
  DEFAULT_COMMODITY_ID,
  DEFAULT_HORIZON_DAYS,
  DEFAULT_MARKET_ID,
  DEFAULT_QTY_KG,
  USE_FIXTURES,
} from '../../config';
import { fxPriceHistory } from '../../fixtures/prices';
import { fxForecast } from '../../fixtures/forecast';
import { fxNearby } from '../../fixtures/nearby';
import { ErrorState, Skeleton } from '../../components/farmer/States';
import type { PricesStackParamList } from '../../navigation/FarmerTabs';
import type {
  DataSource,
  ForecastRes,
  NearbyRes,
  PricePoint,
  PriceSeriesRes,
} from '../../types/api';

type Props = NativeStackScreenProps<PricesStackParamList, 'PricesIndex'>;

/** The four windows the Stitch period selector offers, in days. 1Y is not
 * offered: `getPriceSeries` is called for 180 days, so a 1Y pill would be a
 * control that silently shows 180 days of data under a "1Y" label. */
const PERIODS = [
  { days: 7, labelKey: 'mkt_period_7' },
  { days: 30, labelKey: 'mkt_period_30' },
  { days: 90, labelKey: 'mkt_period_90' },
  { days: 180, labelKey: 'mkt_period_180' },
] as const;

const TRUSTED_SOURCES = new Set<DataSource>(['AGMARKNET', 'MSAMB']);

/**
 * `NearbyMarketRow.name_mr` is Marathi by wire contract — it is a fixed field
 * name, not a localised one, so rendering it directly puts Devanagari on an
 * English screen. Same map `S15_MyLots` already uses: resolve the id through
 * the dictionary, and fall back to the wire field only for a market this app
 * has no name for yet.
 */
const MARKET_NAME_KEY: Record<string, string> = {
  mkt_lasalgaon: 'market_lasalgaon',
  mkt_pune: 'market_pune',
  mkt_nagpur: 'market_nagpur',
};

const CHART_W = 320;
const CHART_H = 132;
const CHART_PAD = 10;

async function fetchSeries(): Promise<PriceSeriesRes> {
  if (USE_FIXTURES) return fxPriceHistory;
  return getPriceSeries(DEFAULT_COMMODITY_ID, DEFAULT_MARKET_ID, 180);
}

async function fetchForecastRes(): Promise<ForecastRes> {
  if (USE_FIXTURES) return fxForecast;
  return getForecast(DEFAULT_COMMODITY_ID, DEFAULT_MARKET_ID, DEFAULT_HORIZON_DAYS);
}

/** `getNearbyMarkets` is keyed by **district**, not market — the alternatives
 * to Lasalgaon are the other yards in Nashik district, not other rows for the
 * same yard. Same derivation and same query key as S6, so both screens share
 * one cache entry rather than fetching the same list twice. */
async function fetchNearbyRes(districtId: string): Promise<NearbyRes> {
  if (USE_FIXTURES) return fxNearby;
  return getNearbyMarkets(DEFAULT_COMMODITY_ID, districtId);
}

/** A cubic path through the points, so the trend reads as a curve like the
 * mockup rather than a polyline. Control points are the midpoints — cheap,
 * stable, and it never overshoots the data the way a spline can. */
function smoothPath(pts: Array<{ x: number; y: number }>): string {
  const first = pts[0];
  if (!first) return '';
  if (pts.length === 1) return `M ${first.x},${first.y}`;
  let d = `M ${first.x},${first.y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]!;
    const cur = pts[i]!;
    const mx = (prev.x + cur.x) / 2;
    d += ` Q ${prev.x},${prev.y} ${mx},${(prev.y + cur.y) / 2}`;
    d += ` Q ${cur.x},${cur.y} ${cur.x},${cur.y}`;
  }
  return d;
}

export default function PricesIndex({ navigation }: Props) {
  const { t, locale } = useT();
  const { user } = useAuth();
  const districtId = user?.district_id ?? 'dist_nashik';
  const [periodDays, setPeriodDays] = useState<number>(180);

  const series = useQuery({
    queryKey: ['prices', 'series', '180', DEFAULT_COMMODITY_ID, DEFAULT_MARKET_ID],
    queryFn: fetchSeries,
  });
  const forecast = useQuery({
    queryKey: ['ai', 'forecast', DEFAULT_COMMODITY_ID, DEFAULT_MARKET_ID, DEFAULT_HORIZON_DAYS],
    queryFn: fetchForecastRes,
  });
  const nearby = useQuery({
    queryKey: ['prices', 'nearby', DEFAULT_COMMODITY_ID, districtId],
    queryFn: () => fetchNearbyRes(districtId),
  });

  const points = series.data?.points ?? [];

  /** The window the period pills select, taken off the end of the series.
   * Fewer records than the window is not an error — it renders what exists. */
  const windowPoints = useMemo(
    () => (points.length > periodDays ? points.slice(points.length - periodDays) : points),
    [points, periodDays],
  );

  const latest = points.length > 0 ? points[points.length - 1] : undefined;
  const previous = points.length > 1 ? points[points.length - 2] : undefined;

  /** Day-on-day move, in paise. Rendered only when there are two records to
   * compare — a "+0" on a single-record series would be a claim, not a fact. */
  const delta =
    latest && previous ? latest.modal_paise_per_qtl - previous.modal_paise_per_qtl : null;
  const deltaBps =
    latest && previous && previous.modal_paise_per_qtl > 0
      ? Math.round((delta! / previous.modal_paise_per_qtl) * 10000)
      : null;

  /** The peak of the selected window, for the context banner under the chart. */
  const peak = useMemo(() => {
    let best: PricePoint | undefined;
    for (const p of windowPoints) {
      if (!best || p.modal_paise_per_qtl > best.modal_paise_per_qtl) best = p;
    }
    return best;
  }, [windowPoints]);

  const fPoints = forecast.data?.points ?? [];
  /** The best expected day in the corridor — the highest p50, which is what
   * "when should I sell" actually means on this data. */
  const bestDay = useMemo(() => {
    let best: (typeof fPoints)[number] | undefined;
    for (const p of fPoints) {
      if (!best || p.p50_paise_per_qtl > best.p50_paise_per_qtl) best = p;
    }
    return best;
  }, [fPoints]);

  const floorPaise = fPoints.length > 0 ? Math.min(...fPoints.map(p => p.p10_paise_per_qtl)) : null;
  const ceilingPaise = fPoints.length > 0 ? Math.max(...fPoints.map(p => p.p90_paise_per_qtl)) : null;

  const lotQuintals = toQuintal(DEFAULT_QTY_KG);

  // ── Four states ───────────────────────────────────────────────────────
  if (series.isLoading) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <ScrollView contentContainerStyle={styles.scroll}>
          <Skeleton height={120} />
          <View style={{ height: space.sm }} />
          <Skeleton height={220} />
          <View style={{ height: space.sm }} />
          <Skeleton height={200} />
        </ScrollView>
      </View>
    );
  }

  if (series.error && !series.data) {
    return <ErrorState message={t('mkt_error')} onRetry={() => series.refetch()} />;
  }

  if (!latest) {
    return <ErrorState message={t('mkt_empty')} onRetry={() => series.refetch()} />;
  }

  const sourceIsTrusted = TRUSTED_SOURCES.has(latest.source);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* ── Top app bar ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerIconRing}>
          <Icon name="trending-up" size={18} color={colors.primary} />
        </View>
        <View style={styles.headerText}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>{t('home_market_name')}</Text>
            <View style={styles.liveDot} />
          </View>
          <Text style={styles.headerSub}>{t('mkt_pulse_sub')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Commodity + season row ────────────────────────────────── */}
        <View style={styles.chipRow}>
          <View style={styles.commodityChip}>
            <View style={styles.commodityDot} />
            <Text style={styles.commodityChipText}>{t('demo_commodity_name')}</Text>
          </View>
          <View style={styles.seasonChip}>
            <Icon name="check-circle" size={12} color={colors.onPositiveContainer} />
            <Text style={styles.seasonChipText}>{t('mkt_season_badge')}</Text>
          </View>
        </View>

        {/* ── Today's benchmark ─────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.benchmarkRow}>
            <View style={styles.benchmarkLeft}>
              <Text style={styles.labelSm}>{t('mkt_benchmark_label')}</Text>
              <View style={styles.benchmarkPriceRow}>
                <Text style={styles.heroNumeral}>
                  {formatPaise(latest.modal_paise_per_qtl, locale)}
                </Text>
                <Text style={styles.perQtl}>{t('mkt_per_qtl')}</Text>
              </View>
            </View>
            {delta !== null && deltaBps !== null ? (
              <View style={[styles.deltaChip, delta < 0 && styles.deltaChipDown]}>
                <Icon
                  name={delta < 0 ? 'trending-down' : 'trending-up'}
                  size={14}
                  color={delta < 0 ? colors.critical : colors.tertiary}
                />
                <Text style={[styles.deltaChipText, delta < 0 && styles.deltaChipTextDown]}>
                  {delta < 0 ? '' : '+'}
                  {formatPaise(delta, locale)} ({formatNumber(Math.round(deltaBps / 100), locale)}%)
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.arrivalsRow}>
            <View style={styles.arrivalsLeft}>
              <Icon name="truck" size={16} color={colors.primary} />
              <Text style={styles.arrivalsValue}>
                {t('mkt_arrivals_value', { count: formatNumber(latest.arrivals_qtl, locale) })}
              </Text>
              <Text style={styles.labelSm}>{t('mkt_arrivals_note')}</Text>
            </View>
            {/* I8 — the provenance badge. `source` is shown as-is when it is
                a trusted feed, and called out when it is not. */}
            <View style={[styles.sourceBadge, !sourceIsTrusted && styles.sourceBadgeUntrusted]}>
              <Text
                style={[styles.sourceBadgeText, !sourceIsTrusted && styles.sourceBadgeTextUntrusted]}>
                {latest.source}
              </Text>
            </View>
          </View>

          {/* Day-range meter — min / modal / max, all three from the same record */}
          <View style={styles.rangeBox}>
            <View style={styles.rangeLabels}>
              <Text style={styles.rangeLabel}>
                {t('mkt_range_low')}:{' '}
                <Text style={styles.rangeValue}>{formatPaise(latest.min_paise_per_qtl, locale)}</Text>
              </Text>
              <Text style={styles.rangeLabel}>
                {t('mkt_range_avg')}:{' '}
                <Text style={styles.rangeValuePrimary}>
                  {formatPaise(latest.modal_paise_per_qtl, locale)}
                </Text>
              </Text>
              <Text style={styles.rangeLabel}>
                {t('mkt_range_high')}:{' '}
                <Text style={styles.rangeValueHigh}>
                  {formatPaise(latest.max_paise_per_qtl, locale)}
                </Text>
              </Text>
            </View>
            <View style={styles.rangeTrack}>
              <View style={styles.rangeFill} />
              <View
                style={[
                  styles.rangePin,
                  {
                    left: `${
                      latest.max_paise_per_qtl > latest.min_paise_per_qtl
                        ? Math.round(
                            ((latest.modal_paise_per_qtl - latest.min_paise_per_qtl) /
                              (latest.max_paise_per_qtl - latest.min_paise_per_qtl)) *
                              100,
                          )
                        : 50
                    }%`,
                  },
                ]}
              />
            </View>
            <View style={styles.rangeFootRow}>
              <Text style={styles.rangeFoot}>{t('mkt_range_foot_min')}</Text>
              <Text style={styles.rangeFoot}>{t('mkt_range_foot_mid')}</Text>
              <Text style={styles.rangeFoot}>{t('mkt_range_foot_max')}</Text>
            </View>
          </View>
        </View>

        {/* ── Historical trend ──────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeadRow}>
            <View style={styles.cardHeadText}>
              <Text style={styles.cardTitle}>{t('mkt_history_title')}</Text>
              <Text style={styles.labelSm}>{t('mkt_history_sub')}</Text>
            </View>
            <Icon name="chart-bar" size={20} color={colors.onSurfaceVariant} />
          </View>

          <View style={styles.pillRow}>
            {PERIODS.map(p => {
              const active = p.days === periodDays;
              return (
                <TouchableOpacity
                  key={p.days}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setPeriodDays(p.days)}
                  accessibilityRole="button">
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {t(p.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <HistoryChart points={windowPoints} />

          <View style={styles.axisRow}>
            {windowPoints.length > 1 ? (
              <>
                <Text style={styles.axisLabel}>
                  {formatDateShort(windowPoints[0]!.obs_date, locale, '')}
                </Text>
                <Text style={styles.axisLabelNow}>
                  {formatDateShort(windowPoints[windowPoints.length - 1]!.obs_date, locale, '')}
                </Text>
              </>
            ) : null}
          </View>

          <View style={styles.contextBanner}>
            <Icon name="clock" size={16} color={colors.primary} />
            <Text style={styles.contextText}>
              {windowPoints.length > 1 && peak
                ? t('mkt_history_context', {
                    peak: formatPaise(peak.modal_paise_per_qtl, locale),
                    date: formatDateShort(peak.obs_date, locale, ''),
                  })
                : t('mkt_history_short')}
            </Text>
          </View>
        </View>

        {/* ── Forecast corridor ─────────────────────────────────────── */}
        {forecast.data && fPoints.length > 0 && floorPaise !== null && ceilingPaise !== null ? (
          <View style={styles.forecastCard}>
            <View style={styles.cardHeadRow}>
              <View style={styles.cardHeadText}>
                <View style={styles.forecastTitleRow}>
                  <Icon name="zap" size={18} color={colors.primaryContainer} />
                  <Text style={styles.cardTitle}>
                    {t('mkt_forecast_title', { days: formatNumber(fPoints.length, locale) })}
                  </Text>
                </View>
                <Text style={styles.labelSm}>{t('mkt_forecast_sub')}</Text>
              </View>
            </View>

            <View style={styles.corridorBox}>
              <View style={styles.corridorHeadRow}>
                <Text style={styles.corridorHeadText}>
                  {t('mkt_corridor_today', {
                    price: formatPaise(latest.modal_paise_per_qtl, locale),
                  })}
                </Text>
                <Text style={styles.corridorHeadTextStrong}>{t('mkt_corridor_peak')}</Text>
                <Text style={styles.corridorHeadText}>
                  {t('mkt_corridor_exit', { n: formatNumber(fPoints.length, locale) })}
                </Text>
              </View>

              <ForecastCorridor
                p10={fPoints.map(p => p.p10_paise_per_qtl)}
                p50={fPoints.map(p => p.p50_paise_per_qtl)}
                p90={fPoints.map(p => p.p90_paise_per_qtl)}
              />

              {/* I16 — floor and ceiling at identical size and weight. */}
              <View style={styles.bandRow}>
                <Text style={styles.bandFloor}>
                  {t('mkt_floor_label', { price: formatPaise(floorPaise, locale) })}
                </Text>
                <Text style={styles.bandCeiling}>
                  {t('mkt_ceiling_label', { price: formatPaise(ceilingPaise, locale) })}
                </Text>
              </View>

              {bestDay ? (
                <View style={styles.bestDayRow}>
                  <View style={styles.bestDayDot} />
                  <Text style={styles.bestDayLabel}>{t('mkt_optimal_sell')}</Text>
                  <Text style={styles.bestDayValue}>
                    {t('mkt_optimal_value', {
                      date: formatDateShort(bestDay.target_date, locale, ''),
                      price: formatPaise(bestDay.p50_paise_per_qtl, locale),
                    })}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.forecastNote}>
              {t('mkt_forecast_accuracy', {
                mase: forecast.data.model_card.mase.toFixed(2),
                coverage: formatNumber(
                  Math.round(forecast.data.model_card.coverage_80_bps / 100),
                  locale,
                ),
              })}
            </Text>

            <TouchableOpacity
              style={styles.auditLink}
              onPress={() => navigation.navigate('S8_ModelCard')}
              accessibilityRole="button">
              <Text style={styles.auditLinkText}>{t('mkt_audit_link')}</Text>
              <Icon name="arrow-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ── Nearby mandis, ranked by net ──────────────────────────── */}
        {nearby.data && nearby.data.rows.length > 0 ? (
          <View style={styles.nearbySection}>
            <View style={styles.nearbyHeadRow}>
              <Text style={styles.cardTitle}>{t('mkt_nearby_title')}</Text>
              <View style={styles.lotBadge}>
                <Text style={styles.lotBadgeText}>
                  {t('mkt_nearby_lot_badge', { qty: formatNumber(lotQuintals, locale) })}
                </Text>
              </View>
            </View>
            <Text style={styles.labelSm}>{t('mkt_nearby_sub')}</Text>

            {nearby.data.rows.map((row, i) => {
              const best = nearby.data!.rows[0]!;
              const deductions =
                row.gross_paise_per_qtl - row.net_paise_per_qtl;
              const lotTotal = row.net_paise_per_qtl * lotQuintals;
              const behindBest =
                (row.net_paise_per_qtl - best.net_paise_per_qtl) * lotQuintals;
              const isBest = i === 0;
              return (
                <View
                  key={row.market_id}
                  style={[styles.nearbyCard, isBest && styles.nearbyCardBest]}>
                  {isBest ? (
                    <View style={styles.rankRibbon}>
                      <Icon name="check-circle" size={12} color={colors.onTertiary} />
                      <Text style={styles.rankRibbonText}>{t('mkt_rank_best')}</Text>
                    </View>
                  ) : null}

                  <View style={styles.nearbyTopRow}>
                    <View style={styles.nearbyIdentity}>
                      <View style={styles.nearbyNameRow}>
                        <Text style={styles.nearbyName}>
                          {MARKET_NAME_KEY[row.market_id]
                            ? t(MARKET_NAME_KEY[row.market_id]!)
                            : row.name_mr}
                        </Text>
                        {!isBest ? (
                          <View style={styles.rankChip}>
                            <Text style={styles.rankChipText}>
                              {t('mkt_rank_n', { n: formatNumber(i + 1, locale) })}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.labelSm}>
                        {t('mkt_km_away', { km: formatNumber(row.distance_km, locale) })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.netGrid}>
                    <View style={styles.netCol}>
                      <Text style={styles.labelSm}>{t('mkt_gross_rate')}</Text>
                      <Text style={styles.netGross}>
                        {formatPaise(row.gross_paise_per_qtl, locale)}
                      </Text>
                      <Text style={styles.deductionLine}>
                        {t('mkt_deductions_line', { amount: formatPaise(deductions, locale) })}
                      </Text>
                    </View>
                    <View style={styles.netColRight}>
                      <Text style={styles.netLabel}>{t('mkt_net_in_bank')}</Text>
                      <Text style={styles.netValue}>
                        {formatPaise(row.net_paise_per_qtl, locale)}
                      </Text>
                      <Text style={styles.netTotal}>
                        {t('mkt_total_for_lot', { amount: formatPaise(lotTotal, locale) })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.costRow}>
                    <Text style={styles.costItem}>
                      {t('mkt_cost_freight', {
                        amount: formatPaise(row.transport_paise_per_qtl, locale),
                      })}
                    </Text>
                    <Text style={styles.costDot}>·</Text>
                    <Text style={styles.costItem}>
                      {t('mkt_cost_adat', {
                        amount: formatPaise(row.commission_paise_per_qtl, locale),
                      })}
                    </Text>
                  </View>

                  {!isBest && behindBest < 0 ? (
                    <View style={styles.behindBanner}>
                      <Icon name="trending-down" size={14} color={colors.critical} />
                      <Text style={styles.behindText}>
                        {t('mkt_lower_payout', {
                          amount: formatPaise(Math.abs(behindBest), locale),
                        })}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}

        {/* ── Deep dives — the four screens this tab used to open onto ─ */}
        <Text style={styles.deepDiveLabel}>{t('mkt_deep_dives')}</Text>
        <View style={styles.deepDiveCard}>
          {(
            [
              { route: 'S5_History', labelKey: 'prices_link_history', icon: 'trending-up' },
              { route: 'S7_Forecast', labelKey: 'prices_link_forecast', icon: 'zap' },
              { route: 'S6_Nearby', labelKey: 'prices_link_nearby', icon: 'map-pin' },
              { route: 'S8_ModelCard', labelKey: 'prices_link_model_card', icon: 'info' },
            ] as const
          ).map((link, i) => (
            <React.Fragment key={link.route}>
              {i > 0 ? <View style={styles.deepDiveDivider} /> : null}
              <TouchableOpacity
                style={styles.deepDiveRow}
                onPress={() => navigation.navigate(link.route)}
                accessibilityRole="button">
                <View style={styles.deepDiveIconBox}>
                  <Icon name={link.icon} size={16} color={colors.primary} />
                </View>
                <Text style={styles.deepDiveText}>{t(link.labelKey)}</Text>
                <Icon name="chevron-right" size={16} color={colors.outline} />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/** The 180-day trend, drawn in the Stitch palette: terracotta line over a
 * fading area, with the latest observation dotted in verified-emerald. */
function HistoryChart({ points }: { points: PricePoint[] }) {
  if (points.length < 2) {
    return <View style={styles.chartEmpty} />;
  }
  const values = points.map(p => p.modal_paise_per_qtl);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (CHART_W - CHART_PAD * 2) / (points.length - 1);
  const coords = values.map((v, i) => ({
    x: CHART_PAD + i * stepX,
    y: CHART_H - CHART_PAD - ((v - min) / range) * (CHART_H - CHART_PAD * 2),
  }));
  const line = smoothPath(coords);
  const last = coords[coords.length - 1]!;
  const area = `${line} L ${last.x},${CHART_H} L ${coords[0]!.x},${CHART_H} Z`;

  return (
    <View style={styles.chartBox}>
      <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
        <Defs>
          <LinearGradient id="mktArea" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primaryContainer} stopOpacity="0.30" />
            <Stop offset="1" stopColor={colors.primaryContainer} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d={area} fill="url(#mktArea)" />
        <Path
          d={line}
          fill="none"
          stroke={colors.primaryContainer}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <Circle cx={last.x} cy={last.y} r={5} fill={colors.tertiary} stroke="#FFFFFF" strokeWidth={2.5} />
      </Svg>
    </View>
  );
}

/** p10–p90 as a filled corridor with the p50 path through it. The two dashed
 * edges are the same weight as each other — I16 applies to the drawing, not
 * only to the text. */
function ForecastCorridor({ p10, p50, p90 }: { p10: number[]; p50: number[]; p90: number[] }) {
  const n = p50.length;
  if (n < 2 || p10.length !== n || p90.length !== n) {
    return <View style={styles.chartEmpty} />;
  }
  const all = [...p10, ...p50, ...p90];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;
  const stepX = (CHART_W - CHART_PAD * 2) / (n - 1);
  const xy = (arr: number[]) =>
    arr.map((v, i) => ({
      x: CHART_PAD + i * stepX,
      y: CHART_H - CHART_PAD - ((v - min) / range) * (CHART_H - CHART_PAD * 2),
    }));

  const hi = xy(p90);
  const lo = xy(p10);
  const mid = xy(p50);
  const band =
    `M ${hi.map(p => `${p.x},${p.y}`).join(' L ')} ` +
    `L ${[...lo].reverse().map(p => `${p.x},${p.y}`).join(' L ')} Z`;

  return (
    <View style={styles.chartBox}>
      <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
        <Path d={band} fill={colors.primaryContainer} fillOpacity={0.14} />
        <Path
          d={smoothPath(hi)}
          fill="none"
          stroke={colors.tertiary}
          strokeWidth={1.5}
          strokeDasharray="4,3"
        />
        <Path
          d={smoothPath(lo)}
          fill="none"
          stroke={colors.critical}
          strokeWidth={1.5}
          strokeDasharray="4,3"
        />
        <Path
          d={smoothPath(mid)}
          fill="none"
          stroke={colors.primaryContainer}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingTop: space.xl + 8,
    paddingBottom: space.xs,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerIconRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { ...typography.titleLg, color: colors.primary },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.tertiary },
  headerSub: { ...typography.labelSm, color: colors.onSurfaceVariant, fontFamily: fontFamily.medium },

  scroll: { padding: space.md, paddingBottom: space.xxl, gap: space.sm },

  chipRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  commodityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.full,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
  },
  commodityDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.secondaryContainer },
  commodityChipText: { ...typography.labelMd, color: colors.onSurface },
  seasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.positiveContainer,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  seasonChipText: { ...typography.labelSm, color: colors.onPositiveContainer },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderCard,
    padding: space.md,
  },
  cardHeadRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardHeadText: { flex: 1 },
  cardTitle: { ...typography.headlineSm, color: colors.onSurface },
  labelSm: { ...typography.labelSm, color: colors.onSurfaceVariant, fontFamily: fontFamily.medium },

  benchmarkRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  benchmarkLeft: { flex: 1 },
  benchmarkPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 2 },
  heroNumeral: { ...typography.numeralHero, color: colors.onSurface },
  perQtl: { ...typography.labelLg, color: colors.onSurfaceVariant },
  deltaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.positiveContainer,
    borderRadius: radius.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deltaChipDown: { backgroundColor: colors.criticalContainer },
  deltaChipText: { ...typography.labelMd, color: colors.tertiary },
  deltaChipTextDown: { color: colors.critical },

  arrivalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.sm,
    paddingTop: space.xs,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  arrivalsLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  arrivalsValue: { ...typography.labelMd, color: colors.onSurface },
  sourceBadge: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sourceBadgeUntrusted: { backgroundColor: colors.warningContainer },
  sourceBadgeText: { ...typography.labelSm, color: colors.tertiary },
  sourceBadgeTextUntrusted: { color: colors.warning },

  rangeBox: {
    marginTop: space.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: space.sm,
  },
  rangeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rangeLabel: { ...typography.labelSm, color: colors.onSurfaceVariant, fontFamily: fontFamily.medium },
  rangeValue: { fontFamily: fontFamily.bold, color: colors.onSurface },
  rangeValuePrimary: { fontFamily: fontFamily.bold, color: colors.primary },
  rangeValueHigh: { fontFamily: fontFamily.bold, color: colors.tertiary },
  rangeTrack: {
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHighest,
    overflow: 'visible',
    justifyContent: 'center',
  },
  rangeFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.primaryContainer,
    opacity: 0.35,
  },
  rangePin: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.onSurface,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginLeft: -7,
  },
  rangeFootRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  rangeFoot: { ...typography.labelSm, fontSize: 10, color: colors.outline, fontFamily: fontFamily.medium },

  pillRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 4,
    marginTop: space.sm,
  },
  pill: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: radius.sm },
  pillActive: { backgroundColor: colors.primary },
  pillText: { ...typography.labelSm, color: colors.onSurfaceVariant },
  pillTextActive: { color: colors.onPrimary },

  chartBox: {
    marginTop: space.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingVertical: space.xs,
  },
  chartEmpty: { height: CHART_H, marginTop: space.sm },
  axisRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  axisLabel: { ...typography.labelSm, fontSize: 10, color: colors.outline, fontFamily: fontFamily.medium },
  axisLabelNow: { ...typography.labelSm, fontSize: 10, color: colors.onSurface },

  contextBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: space.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 10,
  },
  contextText: { ...typography.bodySm, color: colors.onSurface, flex: 1 },

  forecastCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primaryContainer,
    padding: space.md,
  },
  forecastTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  corridorBox: {
    marginTop: space.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: space.sm,
  },
  corridorHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  corridorHeadText: { ...typography.labelSm, color: colors.onSurfaceVariant, fontFamily: fontFamily.medium },
  corridorHeadTextStrong: { ...typography.labelSm, color: colors.primary },
  bandRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.xs },
  // I16 — same fontSize, same family, on both.
  bandFloor: { ...typography.labelSm, color: colors.critical },
  bandCeiling: { ...typography.labelSm, color: colors.tertiary },
  bestDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: space.xs,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: space.xs,
  },
  bestDayDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.tertiary },
  bestDayLabel: { ...typography.labelSm, color: colors.onSurface, flex: 1 },
  bestDayValue: { ...typography.labelMd, color: colors.tertiary },
  forecastNote: { ...typography.bodySm, fontSize: 11, color: colors.onSurfaceVariant, marginTop: space.xs },
  auditLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.xs,
    marginTop: space.xs,
    paddingTop: space.xs,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  auditLinkText: { ...typography.labelMd, color: colors.primary, flex: 1 },

  nearbySection: { gap: space.xs },
  nearbyHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.xs },
  lotBadge: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  lotBadgeText: { ...typography.labelSm, color: colors.primary },
  nearbyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderCard,
    padding: space.md,
    marginTop: space.xs,
    overflow: 'hidden',
  },
  nearbyCardBest: { borderWidth: 2, borderColor: colors.tertiary },
  rankRibbon: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tertiary,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderBottomLeftRadius: radius.md,
  },
  rankRibbonText: { ...typography.labelSm, color: colors.onTertiary },
  nearbyTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  nearbyIdentity: { flex: 1 },
  nearbyNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nearbyName: { ...typography.titleLg, color: colors.onSurface },
  rankChip: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rankChipText: { ...typography.labelSm, fontSize: 10, color: colors.onSurfaceVariant },

  netGrid: {
    flexDirection: 'row',
    gap: space.xs,
    marginTop: space.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 10,
  },
  netCol: { flex: 1 },
  netColRight: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: colors.outlineVariant,
    paddingLeft: space.sm,
  },
  netGross: { ...typography.titleLg, color: colors.onSurface },
  deductionLine: { ...typography.labelSm, fontSize: 11, color: colors.critical, marginTop: 2 },
  netLabel: { ...typography.labelSm, color: colors.tertiary },
  netValue: { ...typography.numeralData, color: colors.tertiary },
  netTotal: { ...typography.labelSm, color: colors.onSurface, marginTop: 2 },

  costRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.xs, paddingHorizontal: 2 },
  costItem: { ...typography.labelSm, fontSize: 11, color: colors.onSurfaceVariant, fontFamily: fontFamily.medium },
  costDot: { ...typography.labelSm, fontSize: 11, color: colors.outline },

  behindBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: space.xs,
    backgroundColor: colors.criticalContainer,
    borderRadius: radius.md,
    padding: space.xs,
  },
  behindText: { ...typography.labelSm, color: colors.onCriticalContainer, flex: 1 },

  deepDiveLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginTop: space.sm,
    textTransform: 'uppercase',
  },
  deepDiveCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderCard,
    overflow: 'hidden',
  },
  deepDiveRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md },
  deepDiveIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deepDiveText: { flex: 1, ...typography.titleMd, color: colors.onSurface },
  deepDiveDivider: { height: 1, backgroundColor: colors.outlineVariant, marginLeft: 52 },
});
