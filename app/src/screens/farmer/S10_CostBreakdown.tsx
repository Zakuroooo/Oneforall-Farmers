/**
 * S10 — the cost breakdown. P5, and P0 priority, because it is the screen that
 * turns the verdict from a claim into an audit.
 *
 * ★ Why this is a screen and not only the expandable row inside `VerdictCard`:
 *   PRANAY.md §1.4's inventory gives S10 its own ID, and §1.7's S9 mockup
 *   annotates the cost row `costs.total_paise_per_qtl → S10`. The row on S9 is
 *   the peek — five numbers, no context. This is where the farmer (or a judge
 *   who taps it) sees the same five numbers multiplied out onto his actual lot,
 *   and which of them he pays only if he waits. Both exist on purpose.
 *
 * ★ It reads the **same `queryKey` as S9**, deliberately. That means:
 *     - no second network call — TanStack serves it from cache instantly,
 *     - it works in airplane mode off the P11 hydrated cache,
 *     - and the two screens can never disagree about the numbers, because
 *       there is one cache entry and both read it.
 *   Passing `costs` through route params would have been fewer lines and would
 *   have made S10 unreachable from a cold start or a deep link.
 *
 * ★ I1 — every value on this screen is an integer of paise until `formatPaise`.
 *   The one multiplication (`per_qtl × quintals`) is integer × integer. There is
 *   no division anywhere in this file; `toQuintal` owns the only one, in
 *   `lib/money.ts`.
 *
 * ★ The total rendered is the **server's** `total_paise_per_qtl`, not a sum this
 *   screen computes. If the server's total ever disagrees with its own five
 *   lines, the farmer must see what the server actually charged and we must fail
 *   a test — not have the client quietly paper over the gap. That agreement is
 *   asserted in `__tests__/S10_CostBreakdown.test.tsx`, which is P5's gate.
 */

import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { recommendWindow } from '../../lib/api';
import { getLocale } from '../../lib/locale';
import { translate } from '../../lib/i18n';
import { formatNumber, formatPaise, toQuintal } from '../../lib/money';
import {
  DEFAULT_COMMODITY_ID,
  DEFAULT_GRADE,
  DEFAULT_HORIZON_DAYS,
  DEFAULT_MARKET_ID,
  DEFAULT_QTY_KG,
  USE_FIXTURES,
} from '../../config';
import { fxHold } from '../../fixtures/window';
import { StaleBanner } from '../../components/farmer/StaleBanner';
import { EmptyState, ErrorState, Skeleton } from '../../components/farmer/States';
import type { Locale, WindowCosts } from '../../types/api';

/**
 * The five deductions, in the order the S9 mockup lists them.
 *
 * `whenHolding` marks the two a farmer pays **only if he waits**. This is not an
 * invention: `NearbyMarketRow`'s own contract in `types/api.ts` defines a
 * sell-today net as `gross − transport − commission − loading` — storage and
 * spoilage are absent from it because nothing is stored and nothing rots in a
 * lot that leaves today. Saying so is the difference between a farmer reading
 * ₹155/क्विंटल as a toll and reading it as a choice.
 *
 * TODO(nilesh): confirm against `domain/costs.py` when the decision engine
 *   lands. If storage/spoilage do accrue on a same-day sale in your model, this
 *   flag is wrong and the note below must come off — a wrong reassurance is
 *   worse than no reassurance.
 */
const COST_LINES: Array<{
  key: keyof Omit<WindowCosts, 'total_paise_per_qtl'>;
  labelKey: string;
  whenHolding: boolean;
}> = [
  { key: 'transport_paise_per_qtl', labelKey: 'cost_transport', whenHolding: false },
  { key: 'commission_paise_per_qtl', labelKey: 'cost_commission', whenHolding: false },
  { key: 'storage_paise_per_qtl', labelKey: 'cost_storage', whenHolding: true },
  { key: 'spoilage_paise_per_qtl', labelKey: 'cost_spoilage', whenHolding: true },
  { key: 'loading_paise_per_qtl', labelKey: 'cost_loading', whenHolding: false },
];

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

export default function S10_CostBreakdown() {
  const [locale, setLocale] = useState<Locale>('mr');
  useFocusEffect(
    useCallback(() => {
      getLocale().then(l => l && setLocale(l));
    }, []),
  );

  // Identical to S9's key — see the header note. A different key here would mean
  // a second request and two caches that can drift apart.
  const { data, dataUpdatedAt, isLoading, error, refetch } = useQuery({
    queryKey: ['ai', 'window', 'recommend', DEFAULT_COMMODITY_ID, DEFAULT_MARKET_ID, DEFAULT_QTY_KG],
    queryFn: fetchVerdict,
  });

  if (isLoading) {
    return (
      <ScrollView contentContainerStyle={styles.root}>
        <Skeleton height={320} />
      </ScrollView>
    );
  }

  // Same rule as S9 (P11): an errored background refetch must not shadow a
  // verdict the hydrated cache still holds. Only refuse to render when there is
  // genuinely nothing.
  if (error && !data) {
    return (
      <ErrorState message={translate('cost_breakdown_error', locale)} onRetry={() => refetch()} />
    );
  }

  if (!data) {
    return <EmptyState title={translate('cost_breakdown_empty', locale)} />;
  }

  const { costs } = data;
  const qtyQtl = toQuintal(DEFAULT_QTY_KG);

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <StaleBanner dataUpdatedAt={dataUpdatedAt} locale={locale} />

      <Text style={styles.title}>{translate('cost_breakdown_title', locale)}</Text>
      <Text style={styles.subtitle}>
        {translate('cost_breakdown_subtitle', locale, {
          market: translate('demo_commodity_market', locale),
          perQtl: translate('per_quintal_label', locale),
        })}
      </Text>

      <View style={styles.card}>
        {COST_LINES.map(line => (
          <View key={line.key} style={styles.row} testID={`cost-row-${line.key}`}>
            <View style={styles.labelCol}>
              <Text style={styles.label}>{translate(line.labelKey, locale)}</Text>
              {line.whenHolding ? (
                <Text style={styles.labelNote}>{translate('only_when_holding_note', locale)}</Text>
              ) : null}
            </View>
            <Text style={styles.value}>{formatPaise(costs[line.key], locale)}</Text>
          </View>
        ))}

        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>{translate('cost_total', locale)}</Text>
          <Text testID="cost-total" style={styles.totalValue}>
            {formatPaise(costs.total_paise_per_qtl, locale)}
          </Text>
        </View>
      </View>

      {/*
        The number a farmer actually feels. ₹155/क्विंटल is abstract; ₹6,214 off
        four tonnes is the thing he decides against. Integer × integer (I1/I2) —
        `toQuintal` floors the kg, so this understates rather than overstates.
      */}
      <View style={styles.lotCard}>
        <Text style={styles.lotLabel}>
          {translate('lot_total_cost_label', locale, { qty: formatNumber(qtyQtl, locale) })}
        </Text>
        <Text testID="cost-whole-lot" style={styles.lotValue}>
          {formatPaise(costs.total_paise_per_qtl * qtyQtl, locale)}
        </Text>
        <Text style={styles.lotNote}>
          {translate('lot_cost_multiply_note', locale, {
            total: formatPaise(costs.total_paise_per_qtl, locale),
            qty: formatNumber(qtyQtl, locale),
          })}
        </Text>
      </View>

      <Text style={styles.footnote}>{translate('cost_breakdown_footnote', locale)}</Text>
    </ScrollView>
  );
}

const GREEN = '#1B5E20';

const styles = StyleSheet.create({
  root: { padding: 24 },

  title: { fontSize: 24, fontWeight: '800', color: '#212121' },
  subtitle: { fontSize: 15, color: '#666', marginTop: 4, marginBottom: 20 },

  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  labelCol: { flexShrink: 1, paddingRight: 12 },
  label: { fontSize: 16, color: '#333' },
  labelNote: { fontSize: 12, color: '#888', marginTop: 2 },
  value: { fontSize: 16, color: '#212121', fontWeight: '600' },

  totalRow: { borderTopWidth: 1, borderTopColor: '#EEE', marginTop: 6, paddingTop: 14 },
  totalLabel: { fontSize: 18, fontWeight: '800', color: '#212121' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#212121' },

  lotCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  lotLabel: { fontSize: 15, color: '#666', textAlign: 'center' },
  lotValue: { fontSize: 28, fontWeight: '800', color: GREEN, marginTop: 6 },
  lotNote: { fontSize: 13, color: '#888', marginTop: 6 },

  footnote: { fontSize: 14, color: '#555', lineHeight: 22, marginTop: 20 },
});
