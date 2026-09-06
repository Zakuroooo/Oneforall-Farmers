/**
 * S6 — nearby mandis, gross vs transport vs **net**, ordered by net (the
 * differentiator).
 *
 * TODO(kartik): K6 (`/prices/nearby`) does not exist yet — this builds against
 *   `fixtures/nearby.ts`. `USE_FIXTURES` is the one line that changes.
 *
 * `district_id` comes from the signed-in farmer (`useAuth().user`), falling
 * back to the demo district only if somehow absent — every registered farmer
 * has one (S3 requires it), so the fallback is defensive, not the real path.
 */

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { getNearbyMarkets } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { getLocale } from '../../lib/locale';
import { formatPaise } from '../../lib/money';
import { DEFAULT_COMMODITY_ID, USE_FIXTURES } from '../../config';
import { fxNearby } from '../../fixtures/nearby';
import { EmptyState, ErrorState, Skeleton } from '../../components/farmer/States';
import type { Locale, NearbyMarketRow } from '../../types/api';

async function fetchNearby(districtId: string) {
  return USE_FIXTURES ? fxNearby : getNearbyMarkets(DEFAULT_COMMODITY_ID, districtId);
}

export default function S06_Nearby() {
  const { user } = useAuth();
  const districtId = user?.district_id ?? 'dist_nashik';
  const [locale, setLocale] = useState<Locale>('mr');
  useEffect(() => {
    getLocale().then(l => l && setLocale(l));
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['prices', 'nearby', DEFAULT_COMMODITY_ID, districtId],
    queryFn: () => fetchNearby(districtId),
  });

  if (isLoading) {
    return (
      <ScrollView contentContainerStyle={styles.root}>
        <Skeleton height={100} />
        <View style={{ height: 12 }} />
        <Skeleton height={100} />
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ErrorState message="जवळपासची मंडई आणता आली नाही. पुन्हा प्रयत्न करा." onRetry={() => refetch()} />
    );
  }

  if (!data || data.rows.length === 0) {
    return <EmptyState title="जवळपास मंडई सापडली नाही." />;
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.title}>जवळपासची मंडई — निव्वळ किमतीनुसार क्रमवारी</Text>
      {/* Sorted by net server-side (data.sorted_by) — rendered in that order, not re-sorted. */}
      {data.rows.map(row => (
        <NearbyRow key={row.market_id} row={row} locale={locale} />
      ))}
    </ScrollView>
  );
}

function NearbyRow({ row, locale }: { row: NearbyMarketRow; locale: Locale }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.marketName}>{row.name_mr}</Text>
        <Text style={styles.distance}>{row.distance_km} किमी</Text>
      </View>
      <View style={styles.lineRow}>
        <Text style={styles.lineLabel}>सकल</Text>
        <Text style={styles.lineValue}>{formatPaise(row.gross_paise_per_qtl, locale)}</Text>
      </View>
      <View style={styles.lineRow}>
        <Text style={styles.lineLabel}>वाहतूक + कमिशन</Text>
        <Text style={styles.lineValue}>
          −{formatPaise(row.transport_paise_per_qtl + row.commission_paise_per_qtl, locale)}
        </Text>
      </View>
      <View style={[styles.lineRow, styles.netRow]}>
        <Text style={styles.netLabel}>निव्वळ</Text>
        <Text style={styles.netValue}>{formatPaise(row.net_paise_per_qtl, locale)}</Text>
      </View>
    </View>
  );
}

const GREEN = '#1B5E20';

const styles = StyleSheet.create({
  root: { padding: 24 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  marketName: { fontSize: 17, fontWeight: '700' },
  distance: { fontSize: 13, color: '#888' },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  lineLabel: { fontSize: 14, color: '#666' },
  lineValue: { fontSize: 14, color: '#666' },
  netRow: { borderTopWidth: 1, borderTopColor: '#DDD', marginTop: 6, paddingTop: 8 },
  netLabel: { fontSize: 16, fontWeight: '700', color: GREEN },
  netValue: { fontSize: 18, fontWeight: '800', color: GREEN },
});
