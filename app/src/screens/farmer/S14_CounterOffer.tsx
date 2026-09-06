/**
 * S14 — counter-offer. Demo beat 9 ("the middleman beat"), P10, and one of
 * the two screens PRANAY.md §1.5 says decide whether we win.
 *
 * ★ PRANAY.md §1.5: "The farmer's own forecast is rendered *directly above*
 *   the input box where he types his counter-price. That single layout
 *   decision is the entire 'we removed the middleman' claim, made visible.
 *   The middleman's whole advantage is knowing the price curve when the
 *   farmer does not. Put the curve above the input." The `ForecastFan` below
 *   is not decoration — its position in the JSX, directly above the price
 *   `TextInput`, is the actual feature.
 *
 * ★ CANON §7.6 / FRONTEND_NEEDS_BACKEND.md §6: three actions on an incoming
 *   offer — accept (creates a transaction), reject, or counter (round+1,
 *   `409 MAX_ROUNDS` past round 3). The counter button is disabled on round 3
 *   from `OfferDto.round` itself, not left for the 409 to catch — a farmer
 *   should never be told "no" after typing a price and tapping submit when
 *   the screen already knew.
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { acceptOffer, counterOffer, getForecast, getOffers, rejectOffer } from '../../lib/api';
import { getLocale } from '../../lib/locale';
import { formatPaise } from '../../lib/money';
import { DEFAULT_COMMODITY_ID, DEFAULT_HORIZON_DAYS, DEFAULT_MARKET_ID, USE_FIXTURES } from '../../config';
import { fxForecast } from '../../fixtures/forecast';
import { fxIncomingOffer } from '../../fixtures/offers';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ForecastFan } from '../../components/charts/ForecastFan';
import { EmptyState, ErrorState, Skeleton } from '../../components/farmer/States';
import type { MyLotsStackParamList } from '../../navigation/FarmerTabs';
import type { ForecastRes, Locale, OfferDto } from '../../types/api';

type Props = NativeStackScreenProps<MyLotsStackParamList, 'S14_CounterOffer'>;

const MAX_ROUND = 3;

interface OfferAndForecast {
  offer: OfferDto;
  forecast: ForecastRes;
}

/**
 * `GET /offers/{offer_id}` is not a documented endpoint (FRONTEND_NEEDS_BACKEND.md
 * §6 only names `GET /offers` — the actor-scoped list — and the per-offer
 * action endpoints). Under fixtures this returns the fixed incoming-offer
 * fixture; against a real API it reads the actor-scoped list `getOffers()`
 * already provides and picks the requested id out of it, rather than
 * inventing a single-offer route CANON never defines.
 */
async function fetchOfferAndForecast(offerId: string): Promise<OfferAndForecast | null> {
  const [offer, forecast] = await Promise.all([
    USE_FIXTURES
      ? Promise.resolve(offerId === fxIncomingOffer.id ? fxIncomingOffer : null)
      : getOffers().then(offers => offers.find(o => o.id === offerId) ?? null),
    USE_FIXTURES
      ? Promise.resolve(fxForecast)
      : getForecast(DEFAULT_COMMODITY_ID, DEFAULT_MARKET_ID, DEFAULT_HORIZON_DAYS),
  ]);
  if (!offer) return null;
  return { offer, forecast };
}

type ActionResult = { kind: 'accepted' } | { kind: 'rejected' } | { kind: 'countered'; offer: OfferDto };

export default function S14_CounterOffer({ route }: Props) {
  const offerId = route.params?.offer_id ?? fxIncomingOffer.id;

  const [locale, setLocale] = useState<Locale>('mr');
  React.useEffect(() => {
    getLocale().then(l => l && setLocale(l));
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['offers', offerId, 'withForecast'],
    queryFn: () => fetchOfferAndForecast(offerId),
  });

  const [counterPrice, setCounterPrice] = useState('');

  const {
    mutate: act,
    isPending: acting,
    isError: actFailed,
    isSuccess: acted,
    data: actionResult,
    reset: resetAct,
  } = useMutation({
    mutationFn: async (action: 'accept' | 'reject' | 'counter'): Promise<ActionResult> => {
      if (!data) throw new Error('no offer loaded');
      if (action === 'accept') {
        if (!USE_FIXTURES) await acceptOffer(data.offer.id);
        return { kind: 'accepted' };
      }
      if (action === 'reject') {
        if (!USE_FIXTURES) await rejectOffer(data.offer.id);
        return { kind: 'rejected' };
      }
      const price = Number(counterPrice);
      const countered = USE_FIXTURES
        ? { ...data.offer, id: `${data.offer.id}_c`, price_paise_per_qtl: price, round: data.offer.round + 1, initiator: 'FARMER' as const, parent_offer_id: data.offer.id }
        : await counterOffer(data.offer.id, { price_paise_per_qtl: price });
      return { kind: 'countered', offer: countered };
    },
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
      <ErrorState message="ऑफर आणता आली नाही. पुन्हा प्रयत्न करा." onRetry={() => refetch()} />
    );
  }

  if (!data) {
    return <EmptyState title="ही ऑफर सापडली नाही — कदाचित आधीच उत्तर दिले गेले आहे." />;
  }

  if (actFailed) {
    return (
      <ErrorState message="कारवाई करता आली नाही. पुन्हा प्रयत्न करा." onRetry={() => resetAct()} />
    );
  }

  if (acting) {
    return (
      <ScrollView contentContainerStyle={styles.root}>
        <Skeleton height={120} />
      </ScrollView>
    );
  }

  if (acted && actionResult) {
    const message =
      actionResult.kind === 'accepted'
        ? 'ऑफर स्वीकारली. व्यवहार सुरू झाला — एस्क्रॉ टाइमलाइन "माझे लॉट" मध्ये दिसेल.'
        : actionResult.kind === 'rejected'
          ? 'ऑफर नाकारली.'
          : `नवीन काउंटर पाठवला: ${formatPaise(actionResult.offer.price_paise_per_qtl, locale)} प्रति क्विंटल (फेरी ${actionResult.offer.round}).`;
    return (
      <View style={styles.root}>
        <Card style={styles.resultCard}>
          <Text style={styles.resultText}>{message}</Text>
        </Card>
      </View>
    );
  }

  const { offer, forecast } = data;
  const atLastRound = offer.round >= MAX_ROUND;
  const parsedCounter = Number(counterPrice);
  const canSubmitCounter =
    !atLastRound && counterPrice.trim().length > 0 && Number.isFinite(parsedCounter) && parsedCounter > 0;

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.header}>व्यापाऱ्याची ऑफर — फेरी {offer.round}</Text>
      <Card style={styles.offerCard}>
        <Text style={styles.offerPrice}>{formatPaise(offer.price_paise_per_qtl, locale)} प्रति क्विंटल</Text>
        <Text style={styles.offerQty}>प्रमाण: {offer.qty_kg} किलो</Text>
        {offer.note ? <Text style={styles.offerNote}>{offer.note}</Text> : null}
      </Card>

      {/* The forecast, directly above the counter-price input — PRANAY.md
          §1.5. This ordering in the JSX is the feature, not a stray chart. */}
      <Text style={styles.sectionLabel}>तुमचा अंदाज (पुढील {DEFAULT_HORIZON_DAYS} दिवस)</Text>
      <ForecastFan
        p10={forecast.points.map(p => p.p10_paise_per_qtl)}
        p50={forecast.points.map(p => p.p50_paise_per_qtl)}
        p90={forecast.points.map(p => p.p90_paise_per_qtl)}
        locale={locale}
      />

      <Text style={styles.sectionLabel}>तुमची काउंटर किंमत (प्रति क्विंटल)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="उदा. २०५०००"
        value={counterPrice}
        onChangeText={setCounterPrice}
        editable={!atLastRound}
      />
      {atLastRound ? (
        <Text style={styles.lastRoundNote}>तिसरी फेरी झाली — यापुढे काउंटर करता येणार नाही.</Text>
      ) : null}

      <View style={styles.actionRow}>
        <Button title="स्वीकारा" onPress={() => act('accept')} style={styles.actionButton} />
        <Button
          title="काउंटर करा"
          variant="outline"
          onPress={() => act('counter')}
          disabled={!canSubmitCounter}
          style={styles.actionButton}
        />
      </View>
      <Button title="नकार द्या" variant="ghost" onPress={() => act('reject')} style={styles.rejectButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 20 },
  header: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  offerCard: { padding: 16, marginBottom: 20 },
  offerPrice: { fontSize: 24, fontWeight: '800', color: '#1B5E20' },
  offerQty: { fontSize: 14, color: '#64748B', marginTop: 4 },
  offerNote: { fontSize: 13, color: '#334155', marginTop: 8, fontStyle: 'italic' },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginTop: 8, marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  lastRoundNote: { fontSize: 13, color: '#C53030', marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  actionButton: { flex: 1 },
  rejectButton: { marginTop: 12 },
  resultCard: { padding: 24, alignItems: 'center' },
  resultText: { fontSize: 16, color: '#1E293B', textAlign: 'center', lineHeight: 24 },
});
