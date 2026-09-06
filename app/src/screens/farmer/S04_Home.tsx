/**
 * S4 — Home. Today's price, the source badge, one big CTA.
 *
 * ★ One CTA. Not three. The farmer opening this app has one question — *should I
 *   sell today?* — and the home screen's job is to carry him to the answer in one
 *   tap. Every extra button on this screen is a tap he might not take.
 *
 * ★ I8: the source badge is not decoration. Whatever price appears here carries
 *   the `source` from the price row, and anything that is not AGMARKNET or MSAMB
 *   is badged as such (`components/farmer/SourceBadge.tsx`).
 *
 * ★ "Today's price" is `points.find(p => p.obs_date === latest_obs_date)`, not
 *   `points[points.length - 1]`. CANON's response carries `latest_obs_date`
 *   precisely so the client does not have to assume the array is sorted or
 *   gapless — falling back to the last element only if that lookup somehow
 *   misses, which is a defensive floor, not the primary path.
 *
 * Commodity and market names are hardcoded Marathi (कांदा · लासलगाव) for the same
 * reason every other farmer screen is right now: there is no i18n system yet
 * (Shreya's SH1), and there is no commodity/market picker screen in scope either
 * — `config.ts`'s `DEFAULT_COMMODITY_ID`/`DEFAULT_MARKET_ID` fix the demo
 * scenario until one exists.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getPriceSeries } from '../../lib/api';
import { getLocale } from '../../lib/locale';
import { translate } from '../../lib/i18n';
import { formatPaise } from '../../lib/money';
import { DEFAULT_COMMODITY_ID, DEFAULT_MARKET_ID, USE_FIXTURES } from '../../config';
import { fxPriceSeries } from '../../fixtures/prices';
import { SourceBadge } from '../../components/farmer/SourceBadge';
import { StaleBanner } from '../../components/farmer/StaleBanner';
import { EmptyState, ErrorState, Skeleton } from '../../components/farmer/States';
import type { HomeStackParamList } from '../../navigation/FarmerTabs';
import type { Locale, PricePoint } from '../../types/api';

type Props = NativeStackScreenProps<HomeStackParamList, 'S4_Home'>;

async function fetchTodaysPrices() {
  return USE_FIXTURES
    ? fxPriceSeries
    : getPriceSeries(DEFAULT_COMMODITY_ID, DEFAULT_MARKET_ID, 1);
}

export default function S04_Home({ navigation }: Props) {
  const [locale, setLocale] = useState<Locale>('mr');
  useEffect(() => {
    getLocale().then(l => l && setLocale(l));
  }, []);

  const { data, dataUpdatedAt, isLoading, error, refetch } = useQuery({
    queryKey: ['prices', 'series', DEFAULT_COMMODITY_ID, DEFAULT_MARKET_ID],
    queryFn: fetchTodaysPrices,
  });

  if (isLoading) {
    return (
      <View style={styles.root}>
        <Skeleton height={40} />
        <View style={{ height: 16 }} />
        <Skeleton height={120} />
      </View>
    );
  }

  const hasData = data && data.points.length > 0;

  // P11: same reasoning as S9 — a hydrated cache can hold yesterday's prices
  // while today's background refetch fails on a dead network. Only the
  // "nothing to show at all" case is an error; a farmer who already has a
  // number on screen gets that number back with a stale banner, not a retry
  // screen replacing a price he could still act on.
  if (error && !hasData) {
    return (
      <ErrorState
        message={translate('price_fetch_error', locale)}
        onRetry={() => refetch()}
      />
    );
  }

  if (!data || !hasData) {
    return <EmptyState title={translate('home_price_empty', locale)} />;
  }

  const today: PricePoint =
    data.points.find(p => p.obs_date === data.latest_obs_date) ??
    data.points[data.points.length - 1]!;

  return (
    <View style={styles.root}>
      <StaleBanner dataUpdatedAt={dataUpdatedAt} locale={locale} />
      <View style={styles.headerRow}>
        <Text style={styles.commodity}>{translate('demo_commodity_market', locale)}</Text>
        <SourceBadge source={today.source} locale={locale} />
      </View>

      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>{translate('today_price_per_qtl_label', locale)}</Text>
        <Text style={styles.price}>{formatPaise(today.modal_paise_per_qtl, locale)}</Text>
        <Text style={styles.range}>
          {formatPaise(today.min_paise_per_qtl, locale)} – {formatPaise(today.max_paise_per_qtl, locale)}
        </Text>
      </View>

      <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('S9_Verdict')}>
        <Text style={styles.ctaLabel}>{translate('home_cta', locale)}</Text>
      </TouchableOpacity>
    </View>
  );
}

const GREEN = '#1B5E20';

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  commodity: { fontSize: 22, fontWeight: '700', color: '#212121' },
  priceCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  priceLabel: { fontSize: 15, color: '#666', marginBottom: 8 },
  price: { fontSize: 36, fontWeight: '800', color: '#212121' },
  range: { fontSize: 14, color: '#888', marginTop: 8 },
  cta: {
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 22,
    alignItems: 'center',
  },
  ctaLabel: { color: '#FFF', fontSize: 22, fontWeight: '800' },
});
