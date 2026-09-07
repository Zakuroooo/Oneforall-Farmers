/**
 * Talks — the negotiation inbox, shared by the farmer and the buyer.
 *
 * ★ Why this screen exists: reaching a counterparty used to mean walking
 *   lot -> buyers list -> buyer profile -> bargaining, four screens deep, and
 *   only from the selling flow. There was no one place that answered "who is
 *   talking to me right now?". This is that place, and it is a tab on both
 *   sides.
 *
 * ★ Why it is not a free-text messenger: there is no chat endpoint. The
 *   backend has no chat router at all (`app/routers/` has no chat or messages
 *   route), and the previous attempt at one polled `/tx/{id}/messages`, which
 *   does not exist — it was deleted for that reason.
 *
 *   What the backend *does* have is the thing that actually matters here: a
 *   real negotiation channel. `GET /offers/{id}/thread` returns the whole
 *   back-and-forth, each round carrying a price and an optional `note` — the
 *   note is the message. Accept, reject and counter are all real endpoints
 *   with a three-round cap enforced server-side. So the conversation in this
 *   product is the offer thread, and this screen renders it rather than
 *   inventing a parallel messaging system nothing could deliver.
 *
 * ★ Symmetric by construction. The farmer and the buyer see the same thread
 *   from opposite ends; `viewerRole` decides only which side of the
 *   conversation is labelled "you", so the two sides cannot drift apart the
 *   way two separately-built screens would.
 */

import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { colors, fontFamily, radius, space, type as typography } from '../../theme/tokens';
import { Icon } from '../../components/ui/Icon';
import { useT } from '../../lib/i18n';
import { formatNumber, formatPaise, toQuintal } from '../../lib/money';
import { getOffers } from '../../lib/api';
import { USE_FIXTURES } from '../../config';
import { fxIncomingOffer, fxIncomingOfferLastRound } from '../../fixtures/offers';
import { ErrorState, Skeleton } from '../../components/farmer/States';
import type { OfferDto, OfferStatus, Role } from '../../types/api';

const STATUS_KEY: Record<OfferStatus, string> = {
  OPEN: 'chat_status_open',
  ACCEPTED: 'chat_status_accepted',
  REJECTED: 'chat_status_rejected',
  EXPIRED: 'chat_status_expired',
  COUNTERED: 'chat_status_countered',
  WITHDRAWN: 'chat_status_withdrawn',
};

async function fetchOffers(): Promise<OfferDto[]> {
  if (USE_FIXTURES) return [fxIncomingOffer, fxIncomingOfferLastRound];
  return getOffers();
}

export function TalksList({
  viewerRole,
  onOpenThread,
}: {
  viewerRole: Role;
  /** Where a tapped talk goes. The two sides own different thread screens, so
   * this stays a callback rather than this component reaching for a navigator
   * it would have to branch on. */
  onOpenThread: (offer: OfferDto) => void;
}) {
  const { t, locale } = useT();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['offers', 'talks'],
    queryFn: fetchOffers,
  });

  if (isLoading) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <View style={styles.scroll}>
          <Skeleton height={96} />
          <View style={{ height: space.sm }} />
          <Skeleton height={96} />
        </View>
      </View>
    );
  }

  if (error && !data) {
    return <ErrorState message={t('offers_fetch_error')} onRetry={() => refetch()} />;
  }

  const offers = data ?? [];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Icon name="message-circle" size={18} color={colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{t('chat_title')}</Text>
          <Text style={styles.headerSub}>{t('chat_subtitle')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {offers.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Icon name="message-circle" size={26} color={colors.outline} />
            </View>
            <Text style={styles.emptyTitle}>{t('chat_empty_title')}</Text>
            <Text style={styles.emptyBody}>
              {viewerRole === 'BUYER' ? t('chat_empty_body_buyer') : t('chat_empty_body')}
            </Text>
          </View>
        ) : (
          offers.map(offer => {
            // Whoever moved last is not the one being waited on.
            const waitingOnViewer = offer.initiator !== viewerRole && offer.status === 'OPEN';
            return (
              <TouchableOpacity
                key={offer.id}
                style={[styles.card, waitingOnViewer && styles.cardWaiting]}
                onPress={() => onOpenThread(offer)}
                accessibilityRole="button">
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Icon
                      name={offer.initiator === 'BUYER' ? 'building' : 'leaf'}
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>
                      {offer.initiator === 'BUYER' ? t('chat_from_buyer') : t('chat_from_you')}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {t('chat_round', { round: formatNumber(offer.round, locale) })} ·{' '}
                      {t('chat_qty', { qty: formatNumber(toQuintal(offer.qty_kg), locale) })}
                    </Text>
                  </View>
                  <View style={styles.statusChip}>
                    <Text style={styles.statusChipText}>{t(STATUS_KEY[offer.status])}</Text>
                  </View>
                </View>

                <Text style={styles.rate}>
                  {t('chat_last_offer', {
                    rate: formatPaise(offer.price_paise_per_qtl, locale),
                  })}
                </Text>

                {/* The note is the message — the only free text this channel
                    carries, and the reason a thread reads as a conversation. */}
                <Text style={styles.note} numberOfLines={2}>
                  {offer.note?.trim() ? offer.note : t('chat_no_note')}
                </Text>

                <View style={styles.cardFoot}>
                  <Text style={[styles.waiting, waitingOnViewer && styles.waitingOnYou]}>
                    {waitingOnViewer ? t('chat_awaiting_you') : t('chat_awaiting_them')}
                  </Text>
                  <View style={styles.openRow}>
                    <Text style={styles.openText}>{t('chat_open')}</Text>
                    <Icon name="chevron-right" size={16} color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingTop: space.xl + 8,
    paddingBottom: space.xs,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  headerTitle: { ...typography.titleLg, color: colors.onSurface, fontFamily: fontFamily.extraBold },
  headerSub: { ...typography.labelSm, color: colors.onSurfaceVariant, fontFamily: fontFamily.medium },

  scroll: { padding: space.md, paddingBottom: space.xxl, gap: space.sm },

  emptyCard: {
    alignItems: 'center',
    gap: 8,
    padding: space.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { ...typography.titleLg, color: colors.onSurface, textAlign: 'center' },
  emptyBody: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 19,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderCard,
    padding: space.md,
  },
  cardWaiting: { borderWidth: 2, borderColor: colors.primaryContainer },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: { ...typography.titleMd, color: colors.onSurface },
  cardMeta: { ...typography.labelSm, color: colors.onSurfaceVariant, fontFamily: fontFamily.medium },
  statusChip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  statusChipText: { ...typography.labelSm, color: colors.onSurfaceVariant },

  rate: {
    ...typography.titleLg,
    color: colors.primary,
    fontFamily: fontFamily.extraBold,
    marginTop: space.xs,
  },
  note: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2, lineHeight: 18 },

  cardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.xs,
    marginTop: space.sm,
    paddingTop: space.xs,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  waiting: { ...typography.labelSm, color: colors.onSurfaceVariant, flex: 1 },
  waitingOnYou: { color: colors.primary },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  openText: { ...typography.labelMd, color: colors.primary },
});
