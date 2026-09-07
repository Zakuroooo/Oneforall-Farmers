/**
 * S15 — My Lots. The list P9's other screens have been missing an entry point
 * from: S12 creates a lot and S13 scores one, but until now neither could be
 * reached except by going through the other first, and a farmer with lots
 * already on file had nowhere to see them.
 *
 * ★ CLAUDE.md §9: "Judges click the second thing. Every screen needs a real
 *   empty state." A farmer with zero lots gets Marathi text and the same
 *   create button as the header, not a blank list.
 *
 * ★ I2: `LotDto.qty_kg` is stored in kg and **displayed in quintals**, floored
 *   via `toQuintal` — never rounded, never a raw kg number on screen.
 *
 * ★ `LotDto.grade` is `LotGrade` (four values, including `UNGRADED`), not
 *   `Grade` (three). An ungraded lot must read as "not yet assessed", not
 *   render blank or be mistaken for a low grade — collapsing the two is the
 *   exact bug `types/api.ts` warns about.
 */

import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getLots } from '../../lib/api';
import { getLocale } from '../../lib/locale';
import { translate } from '../../lib/i18n';
import { formatDate } from '../../lib/dates';
import { formatNumber, formatPaise, toQuintal } from '../../lib/money';
import { FIXTURE_LOTS_EMPTY, USE_FIXTURES } from '../../config';
import { fxMyLots, fxMyLotsEmpty } from '../../fixtures/lots';
import { fxEscrowEvents, fxEscrowEventsDisputed, fxTx, fxTxDisputed } from '../../fixtures/escrow';
import { fxIncomingOffer, fxIncomingOfferLastRound } from '../../fixtures/offers';
import { fxPool } from '../../fixtures/pools';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import type { BadgeType } from '../../components/ui/Badge';
import { EscrowTimeline, txStatusLabel } from '../../components/EscrowTimeline';
import { EmptyState, ErrorState, Skeleton } from '../../components/farmer/States';
import type { MyLotsStackParamList } from '../../navigation/FarmerTabs';
import type { EscrowEvent, LotDto, LotGrade, LotStatus, Locale, OfferDto, TxDto } from '../../types/api';

type Props = NativeStackScreenProps<MyLotsStackParamList, 'S15_MyLots'>;

/**
 * Same values `S13_SelfAssay`'s `GRADE_BADGE` uses for `A`/`B`/`C`, plus
 * `UNGRADED`, which `Grade` (S13's three-value type) has no slot for at all.
 * Not imported from S13 — this task's diff is scoped to this file,
 * `FarmerTabs.tsx` and `fixtures/lots.ts` only — so the three shared values
 * are restated here rather than adding an export to a file outside that
 * scope. If S13 ever changes its palette, change it here too.
 */
const GRADE_BADGE: Record<LotGrade, BadgeType> = {
  A: 'GRADE_A',
  B: 'GRADE_B',
  C: 'GRADE_C',
  UNGRADED: 'INFO',
};

const GRADE_LABEL_KEY: Record<LotGrade, string> = {
  A: 'lot_grade_a',
  B: 'lot_grade_b',
  C: 'lot_grade_c',
  UNGRADED: 'lot_grade_ungraded',
};

/** Every `LotStatus` value — dictionary keys, not text. S15 is a
 * farmer-facing screen and none of these nine values may reach the screen
 * untranslated in whatever locale is selected. */
const STATUS_LABEL_KEY: Record<LotStatus, string> = {
  DRAFT: 'lot_status_draft',
  LISTED: 'lot_status_listed',
  POOLED: 'lot_status_pooled',
  OFFERED: 'lot_status_offered',
  COMMITTED: 'lot_status_committed',
  IN_TRANSIT: 'lot_status_in_transit',
  DELIVERED: 'lot_status_delivered',
  SETTLED: 'lot_status_settled',
  CANCELLED: 'lot_status_cancelled',
};

/**
 * No commodity/market picker or reference-data screen exists yet (same gap
 * `S04_Home` notes for its own hardcoded commodity/market label). This
 * repo's fixtures use both `'onion'`/`'cmd_onion'` for the same commodity
 * across different commits — both map here rather than one of them
 * rendering blank. Dictionary keys, not text, so this respects locale too.
 */
const COMMODITY_NAME_KEY: Record<string, string> = {
  onion: 'demo_commodity_name',
  cmd_onion: 'demo_commodity_name',
};
const MARKET_NAME_KEY: Record<string, string> = {
  mkt_lasalgaon: 'market_lasalgaon',
  mkt_pune: 'market_pune',
  mkt_nagpur: 'market_nagpur',
};

async function fetchLots(): Promise<LotDto[]> {
  if (USE_FIXTURES) return FIXTURE_LOTS_EMPTY ? fxMyLotsEmpty : fxMyLots;
  return getLots();
}

interface TxWithEvents {
  tx: TxDto;
  events: EscrowEvent[];
}

/**
 * TODO(akash): there is no actor-scoped "list my transactions" endpoint
 * anywhere in CANON §7.7 or FRONTEND_NEEDS_BACKEND.md §7 — only
 * `GET /tx/{id}` for one at a time, which is no use to a list screen that
 * does not already have ids to ask for. Under fixtures this returns the two
 * escrow fixtures every other screen already agrees on; without fixtures it
 * returns empty rather than guessing at a path nothing in this repo defines.
 */
async function fetchTransactions(): Promise<TxWithEvents[]> {
  if (USE_FIXTURES) {
    return [
      { tx: fxTx, events: fxEscrowEvents },
      { tx: fxTxDisputed, events: fxEscrowEventsDisputed },
    ];
  }
  return [];
}

/**
 * Offers awaiting the farmer's response — `initiator: 'BUYER'` and
 * `status: 'OPEN'`, per S14's own header comment. `GET /offers` is
 * actor-scoped both directions (FRONTEND_NEEDS_BACKEND.md §6), so the real
 * path filters the same list S14 itself reads, rather than a second
 * endpoint.
 */
async function fetchOffersAwaitingResponse(): Promise<OfferDto[]> {
  if (USE_FIXTURES) return [fxIncomingOffer, fxIncomingOfferLastRound];
  return [];
}

/**
 * TODO(akash): same gap as `fetchTransactions` — no "list my pools"
 * endpoint, only `GET /pools/{id}`. Fixtures stand in until one exists.
 */
async function fetchMyPools() {
  if (USE_FIXTURES) return [fxPool];
  return [];
}

function commodityMarketLabel(lot: LotDto, locale: Locale): string {
  const commodityKey = COMMODITY_NAME_KEY[lot.commodity_id];
  const marketKey = MARKET_NAME_KEY[lot.market_id];
  const commodity = commodityKey ? translate(commodityKey, locale) : lot.commodity_id;
  const market = marketKey ? translate(marketKey, locale) : lot.market_id;
  return `${commodity} · ${market}`;
}

function harvestDateLabel(lot: LotDto, locale: Locale): string {
  // `formatDate` (lib/dates.ts), not `devNum` — `devNum` only translates the
  // digits, so `2026-08-28` came out as `२०२६-०८-२८`: ISO order in Devanagari
  // numerals, which is a wire format in costume and not a date anyone reads.
  return formatDate(lot.harvest_date, locale, translate('harvest_date_missing', locale));
}

export default function S15_MyLots({ navigation }: Props) {
  const [locale, setLocale] = useState<Locale>('mr');
  useFocusEffect(
    React.useCallback(() => {
      getLocale().then(l => l && setLocale(l));
    }, []),
  );

  const { data: lots, isLoading, error, refetch } = useQuery({
    queryKey: ['lots'],
    queryFn: fetchLots,
  });

  // Transactions are additive to this screen's own loading/error/empty
  // states below — a farmer with lots but no transactions yet still sees
  // the lots list; a failure fetching transactions does not blank the lots
  // that already loaded. Not one of the "four states" this screen gates on.
  const { data: transactions } = useQuery({
    queryKey: ['tx', 'mine'],
    queryFn: fetchTransactions,
  });

  const { data: pendingOffers } = useQuery({
    queryKey: ['offers', 'awaitingResponse'],
    queryFn: fetchOffersAwaitingResponse,
  });

  const { data: myPools } = useQuery({
    queryKey: ['pools', 'mine'],
    queryFn: fetchMyPools,
  });

  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  const goCreateLot = () => navigation.navigate('S12_CreateLot');

  if (isLoading) {
    return (
      <View style={styles.root}>
        <Skeleton height={80} />
        <View style={{ height: 12 }} />
        <Skeleton height={80} />
      </View>
    );
  }

  // P11: `error && !lots`, not a bare `error` — same rule as S4/S7/S9. A
  // farmer's own lot list is the screen he lands on; a failed background
  // refetch must not replace lots the cache is still holding with a retry
  // button. The empty state below still handles a genuinely empty list.
  if (error && !lots) {
    return (
      <ErrorState message={translate('lots_fetch_error', locale)} onRetry={() => refetch()} />
    );
  }

  if (!lots || lots.length === 0) {
    return (
      <View style={styles.root}>
        <EmptyState
          title={translate('lots_empty_title', locale)}
          description={translate('lots_empty_description', locale)}
          ctaText={translate('lots_empty_cta', locale)}
          onCtaPress={goCreateLot}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>{translate('my_lots_header', locale)}</Text>
        <Button
          title={translate('new_lot_header_button', locale)}
          variant="outline"
          onPress={goCreateLot}
          style={styles.headerButton}
        />
      </View>

      {lots.map(item => (
        <TouchableOpacity
          key={item.id}
          onPress={() => navigation.navigate('S13_SelfAssay', { lot_id: item.id })}>
          <Card style={styles.lotCard}>
            <View style={styles.lotHeaderRow}>
              <Text style={styles.lotTitle}>{commodityMarketLabel(item, locale)}</Text>
              <Badge label={translate(GRADE_LABEL_KEY[item.grade], locale)} type={GRADE_BADGE[item.grade]} />
            </View>
            <Text style={styles.lotLine}>
              {translate('qty_label_value', locale, { qty: formatNumber(toQuintal(item.qty_kg), locale) })}
            </Text>
            <Text style={styles.lotLine}>
              {translate('harvest_label_value', locale, { date: harvestDateLabel(item, locale) })}
            </Text>
            <Text style={styles.lotStatus}>{translate(STATUS_LABEL_KEY[item.status], locale)}</Text>
          </Card>
        </TouchableOpacity>
      ))}

      {pendingOffers && pendingOffers.length > 0 ? (
        <>
          <Text style={[styles.header, styles.txSectionHeader]}>
            {translate('pending_offers_section_header', locale)}
          </Text>
          {pendingOffers.map(offer => (
            <TouchableOpacity
              key={offer.id}
              onPress={() => navigation.navigate('S14_CounterOffer', { offer_id: offer.id })}>
              <Card style={styles.lotCard}>
                <View style={styles.lotHeaderRow}>
                  <Text style={styles.lotTitle}>
                    {translate('offer_round_short', locale, { round: formatNumber(offer.round, locale) })}
                  </Text>
                  <Text style={styles.txStatusText}>{translate('respond_to_offer_link', locale)}</Text>
                </View>
                <Text style={styles.lotLine}>
                  {formatPaise(offer.price_paise_per_qtl, locale)} {translate('per_quintal_label', locale)}
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </>
      ) : null}

      {myPools && myPools.length > 0 ? (
        <>
          <Text style={[styles.header, styles.txSectionHeader]}>
            {translate('my_pools_section_header', locale)}
          </Text>
          {myPools.map(pool => (
            <TouchableOpacity
              key={pool.fpo.id}
              onPress={() => navigation.navigate('S16_PoolSplit', { pool_id: pool.fpo.id })}>
              <Card style={styles.lotCard}>
                <View style={styles.lotHeaderRow}>
                  <Text style={styles.lotTitle}>{pool.fpo.name_mr}</Text>
                  <Text style={styles.txStatusText}>{translate('view_share_link', locale)}</Text>
                </View>
                <Text style={styles.lotLine}>
                  {translate('pool_summary_line', locale, {
                    qty: formatNumber(toQuintal(pool.total_qty_kg), locale),
                    members: formatNumber(pool.members.length, locale),
                  })}
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </>
      ) : null}

      {transactions && transactions.length > 0 ? (
        <>
          <Text style={[styles.header, styles.txSectionHeader]}>
            {translate('my_transactions_section_header', locale)}
          </Text>
          {transactions.map(({ tx, events }) => {
            const expanded = expandedTxId === tx.id;
            return (
              <Card key={tx.id} style={styles.lotCard}>
                <TouchableOpacity
                  onPress={() => setExpandedTxId(expanded ? null : tx.id)}
                  accessibilityRole="button">
                  <View style={styles.lotHeaderRow}>
                    <Text style={styles.lotTitle}>{translate('transaction_id_line', locale, { id: tx.id })}</Text>
                    <Text style={styles.txStatusText}>{txStatusLabel(tx.status, locale)}</Text>
                  </View>
                  <Text style={styles.lotLine}>
                    {translate('net_amount_value', locale, { value: formatPaise(tx.net_paise, locale) })}
                  </Text>
                  <Text style={styles.txToggleHint}>
                    {translate(expanded ? 'timeline_hide_link' : 'timeline_show_link', locale)}
                  </Text>
                </TouchableOpacity>
                {expanded ? (
                  <View style={styles.txExpanded}>
                    <EscrowTimeline tx={tx} events={events} locale={locale} />
                  </View>
                ) : null}
              </Card>
            );
          })}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  header: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  txSectionHeader: { marginTop: 24, marginBottom: 12 },
  headerButton: { minHeight: 40, paddingVertical: 8, paddingHorizontal: 12 },
  scrollContent: { paddingBottom: 24 },
  lotCard: { padding: 16 },
  txStatusText: { fontSize: 12, fontWeight: '700', color: '#E65100' },
  txToggleHint: { fontSize: 13, color: '#1B5E20', fontWeight: '600', marginTop: 8 },
  txExpanded: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 12 },
  lotHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lotTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  lotLine: { fontSize: 14, color: '#334155', marginTop: 2 },
  lotStatus: { fontSize: 13, color: '#64748B', marginTop: 6, fontWeight: '600' },
});
