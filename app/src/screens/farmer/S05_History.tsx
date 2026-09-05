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
import { DEFAULT_COMMODITY_ID, DEFAULT_MARKET_ID, USE_FIXTURES } from '../../config';
import { fxPriceHistory } from '../../fixtures/prices';
import { PriceHistory } from '../../components/charts/PriceHistory';
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

  const { data, isLoading, error, refetch } = useQuery({
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

  if (error) {
    return (
      <ErrorState message="इतिहास आणता आला नाही. पुन्हा प्रयत्न करा." onRetry={() => refetch()} />
    );
  }

  if (!data || data.points.length === 0) {
    return <EmptyState title="या मार्केटसाठी इतिहास उपलब्ध नाही." />;
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.title}>कांदा · लासलगाव — १८० दिवसांचा इतिहास</Text>
      <PriceHistory points={data.points} locale={locale} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 24 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
});
