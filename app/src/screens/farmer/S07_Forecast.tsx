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
import { translate } from '../../lib/i18n';
import { formatBps, formatNumber } from '../../lib/money';
import { DEFAULT_COMMODITY_ID, DEFAULT_HORIZON_DAYS, DEFAULT_MARKET_ID, USE_FIXTURES } from '../../config';
import { fxForecast } from '../../fixtures/forecast';
import { ForecastFan } from '../../components/charts/ForecastFan';
import { StaleBanner } from '../../components/farmer/StaleBanner';
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

  const { data, dataUpdatedAt, isLoading, error, refetch } = useQuery({
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

  const hasData = data && data.points.length > 0;

  // P11: same reasoning as S4/S9 — a hydrated cache can hold a real forecast
  // from an earlier session while a background refetch on a dead network
  // fails. This screen had been left on the old `if (error)` rule, which
  // meant a forecast the offline cache was still holding got shadowed by
  // the retry screen the moment airplane mode kicked in — exactly beat 7's
  // territory. Only "nothing to show at all" is the error state now.
  if (error && !hasData) {
    return (
      <ErrorState message={translate('forecast_error', locale)} onRetry={() => refetch()} />
    );
  }

  if (!data || !hasData) {
    return <EmptyState title={translate('forecast_empty', locale)} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <StaleBanner dataUpdatedAt={dataUpdatedAt} locale={locale} />
      <Text style={styles.title}>
        {translate('forecast_title', locale, {
          market: translate('demo_commodity_market', locale),
          days: formatNumber(DEFAULT_HORIZON_DAYS, locale),
        })}
      </Text>
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
          {translate('model_reliability_line', locale, {
            mase: data.model_card.mase,
            coverage: formatBps(data.model_card.coverage_80_bps, locale),
          })}
        </Text>
        <Text style={styles.modelNoteCta}>{translate('model_note_cta', locale)}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 24 },
  title: { fontSize: 18, fontWeight: '700', color: '#212121', marginBottom: 16 },
  modelNote: { fontSize: 13, color: '#888', marginTop: 16 },
  modelNoteCta: { fontSize: 13, color: '#1B5E20', fontWeight: '700', marginTop: 6 },
});
