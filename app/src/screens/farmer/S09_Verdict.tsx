/**
 * S9 — the verdict. The most important screen in the product. Everything
 * upstream exists to make this credible.
 *
 * ★ I6: `NO_ADVICE` is a 200 with a body, not an error. It renders through
 *   exactly the same success path as every other action — `VerdictCard` branches
 *   on `data.action`, not this screen on a thrown error. TanStack Query never
 *   sees a refusal as a failure, because it never is one.
 *
 * ★ Never 500, per CANON §7.4 — but the client side of "never 500" is: a real
 *   network/server error still goes through `ErrorState` with a retry. Only a
 *   real 200 response reaches `VerdictCard`, refusal included.
 *
 * Request params (`DEFAULT_QTY_KG`, `DEFAULT_GRADE`, `DEFAULT_COMMODITY_ID`,
 * `DEFAULT_MARKET_ID`) are the same demo-lot constants S4 and every fixture
 * already agree on — there is no lot-creation flow in scope yet.
 */

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { recommendWindow } from '../../lib/api';
import { getLocale } from '../../lib/locale';
import {
  DEFAULT_COMMODITY_ID,
  DEFAULT_GRADE,
  DEFAULT_HORIZON_DAYS,
  DEFAULT_MARKET_ID,
  DEFAULT_QTY_KG,
  USE_FIXTURES,
} from '../../config';
import { fxHold } from '../../fixtures/window';
import { VerdictCard } from '../../components/farmer/VerdictCard';
import { EmptyState, ErrorState, Skeleton } from '../../components/farmer/States';
import type { Locale } from '../../types/api';

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

export default function S09_Verdict() {
  const [locale, setLocale] = useState<Locale>('mr');
  useEffect(() => {
    getLocale().then(l => l && setLocale(l));
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ai', 'window', 'recommend', DEFAULT_COMMODITY_ID, DEFAULT_MARKET_ID, DEFAULT_QTY_KG],
    queryFn: fetchVerdict,
  });

  if (isLoading) {
    return (
      <ScrollView contentContainerStyle={styles.root}>
        <Skeleton height={400} />
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ErrorState message="निर्णय आणता आला नाही. पुन्हा प्रयत्न करा." onRetry={() => refetch()} />
    );
  }

  if (!data) {
    return <EmptyState title="या लॉटसाठी अजून सल्ला उपलब्ध नाही." />;
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <VerdictCard data={data} qtyKg={DEFAULT_QTY_KG} locale={locale} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 24 },
});
