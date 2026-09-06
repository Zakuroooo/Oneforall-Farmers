/**
 * S7 — 14-day p10/p50/p90 fan. Never a bare line (PRANAY.md §2.7).
 *
 * TODO(nikhil): N2 (`/ai/forecast`) does not exist yet — this builds against
 *   `fixtures/forecast.ts`. `USE_FIXTURES` is the one line that changes when it
 *   lands.
 */

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getForecast } from '../../lib/api';
import { getLocale } from '../../lib/locale';
import { formatBps } from '../../lib/money';
import { DEFAULT_COMMODITY_ID, DEFAULT_HORIZON_DAYS, DEFAULT_MARKET_ID, USE_FIXTURES } from '../../config';
import { fxForecast } from '../../fixtures/forecast';
import { ForecastFan } from '../../components/charts/ForecastFan';
import { EmptyState, ErrorState, Skeleton } from '../../components/farmer/States';
import type { PricesStackParamList } from '../../navigation/FarmerTabs';
import type { Locale } from '../../types/api';

type Props = NativeStackScreenProps<PricesStackParamList, 'S7_Forecast'>;

async function fetchForecast() {
  return USE_FIXTURES
    ? fxForecast
    : getForecast(DEFAULT_COMMODITY_ID, DEFAULT_MARKET_ID, DEFAULT_HORIZON_DAYS);
}

export default function S07_Forecast({ navigation }: Props) {
  const [locale, setLocale] = useState<Locale>('mr');
  useEffect(() => {
    getLocale().then(l => l && setLocale(l));
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ai', 'forecast', DEFAULT_COMMODITY_ID, DEFAULT_MARKET_ID, DEFAULT_HORIZON_DAYS],
    queryFn: fetchForecast,
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
      <ErrorState message="अंदाज आणता आला नाही. पुन्हा प्रयत्न करा." onRetry={() => refetch()} />
    );
  }

  if (!data || data.points.length === 0) {
    return <EmptyState title="या मार्केटसाठी अंदाज उपलब्ध नाही." />;
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.title}>कांदा · लासलगाव — १४ दिवसांचा अंदाज</Text>
      <ForecastFan
        p10={data.points.map(p => p.p10_paise_per_qtl)}
        p50={data.points.map(p => p.p50_paise_per_qtl)}
        p90={data.points.map(p => p.p90_paise_per_qtl)}
        locale={locale}
      />
      {/*
        The footnote was already the two summary numbers; making it a tap into S8
        is what turns them from a disclaimer into something checkable. The inline
        `model_card` on this response and S8's full card carry the same `mase` and
        `coverage_80_bps` by contract, so the number a farmer taps is the number
        he lands on — if those two ever disagree, that is a backend bug and this
        is where it becomes visible.
      */}
      <TouchableOpacity
        testID="forecast-model-note"
        accessibilityRole="button"
        onPress={() => navigation.navigate('S8_ModelCard')}>
        <Text style={styles.modelNote}>
          मॉडेल विश्वासार्हता (MASE): {data.model_card.mase} · व्याप्ती:{' '}
          {formatBps(data.model_card.coverage_80_bps, locale)}
        </Text>
        <Text style={styles.modelNoteCta}>हे कसे मोजले? →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 24 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modelNote: { fontSize: 13, color: '#888', marginTop: 16 },
  modelNoteCta: { fontSize: 13, color: '#1B5E20', fontWeight: '700', marginTop: 6 },
});
