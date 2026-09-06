/**
 * S5 — 180-day price history, source-coloured segments (I8).
 *
 * TODO(kartik): K4 (`/prices/series` with `days=180`) does not exist yet — this
 *   builds against `fixtures/prices.ts`'s `fxPriceHistory`. `USE_FIXTURES` is
 *   the one line that changes when it lands.
 */

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { getPriceSeries } from '../../lib/api';
import { getLocale } from '../../lib/locale';
import { translate } from '../../lib/i18n';
import { formatNumber } from '../../lib/money';
import { DEFAULT_COMMODITY_ID, DEFAULT_MARKET_ID, USE_FIXTURES } from '../../config';
import { fxPriceHistory } from '../../fixtures/prices';
import { PriceHistory } from '../../components/charts/PriceHistory';
import { StaleBanner } from '../../components/farmer/StaleBanner';
import { EmptyState, ErrorState, Skeleton } from '../../components/farmer/States';
import type { Locale } from '../../types/api';

async function fetchHistory() {
  return USE_FIXTURES ? fxPriceHistory : getPriceSeries(DEFAULT_COMMODITY_ID, DEFAULT_MARKET_ID, 180);
}

export default function S05_History() {
  const [locale, setLocale] = useState<Locale>('mr');
  useEffect(() => {
    getLocale().then(l => l && setLocale(l));
  }, []);

  const { data, dataUpdatedAt, isLoading, error, refetch } = useQuery({
    queryKey: ['prices', 'series', '180', DEFAULT_COMMODITY_ID, DEFAULT_MARKET_ID],
    queryFn: fetchHistory,
  });

  if (isLoading) {
    return (
      <ScrollView contentContainerStyle={styles.root}>
        <Skeleton height={220} />
      </ScrollView>
    );
  }

  const hasData = data && data.points.length > 0;

  // P11: same rule as S4/S7/S9 — a hydrated cache can hold history from an
  // earlier session while today's background refetch fails offline.
  if (error && !hasData) {
    return (
      <ErrorState message={translate('history_error', locale)} onRetry={() => refetch()} />
    );
  }

  if (!data || !hasData) {
    return <EmptyState title={translate('history_empty', locale)} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <StaleBanner dataUpdatedAt={dataUpdatedAt} locale={locale} />
      <Text style={styles.title}>
        {translate('history_title', locale, {
          market: translate('demo_commodity_market', locale),
          days: formatNumber(180, locale),
        })}
      </Text>
      <PriceHistory points={data.points} locale={locale} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 24 },
  title: { fontSize: 18, fontWeight: '700', color: '#212121', marginBottom: 16 },
});
