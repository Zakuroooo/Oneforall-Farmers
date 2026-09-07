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
import { noteText } from '../../lib/offerNote';
import { formatNumber, formatPaise, formatQuintal, quintalValuePaise, toQuintal } from '../../lib/money';
import { getOffers } from '../../lib/api';
import { USE_FIXTURES } from '../../config';
import { fxMyOffers } from '../../fixtures/offers';
import { ErrorState, Skeleton } from '../../components/farmer/States';
import { ListenButton } from '../../components/ui/ListenButton';
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
  if (USE_FIXTURES) return fxMyOffers;
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
  const waitingCount = offers.filter(
    o => o.initiator !== viewerRole && o.status === 'OPEN',
  ).length;

  /* ★ The speaker reads the inbox: how many talks, and for each one the last
     price offered and whose turn it is. A farmer who cannot read the list
     still learns the one thing it exists to tell him — who is waiting on
     him, and at what price. */
  const narration =
    offers.length === 0
      ? t('chat_empty_title')
      : [
          t('chat_narr_count', { n: formatNumber(offers.length, locale) }),
          ...offers.map(o =>
            t(o.initiator !== viewerRole && o.status === 'OPEN'
              ? 'chat_narr_waiting_you'
              : 'chat_narr_waiting_them', {
              rate: formatPaise(o.price_paise_per_qtl, locale),
              qty: formatNumber(toQuintal(o.qty_kg), locale),
            }),
          ),
        ].join(' ');

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
        <ListenButton text={narration} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── What is on the table, in one line ──────────────────────────
            Stitch 31 opens its list with a summary band before the cards;
            this is the same idea with the figures a talks list actually
            has — how many conversations, and what the live offers add up
            to if every one were accepted. */}
        {offers.length > 0 ? (
          <View style={styles.summaryCard}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryLabel}>{t('chat_summary_label')}</Text>
              <Text style={styles.summaryValue}>
                {formatPaise(
                  offers
                    .filter(o => o.status === 'OPEN')
                    .reduce((sum, o) => sum + quintalValuePaise(o.price_paise_per_qtl, o.qty_kg), 0),
                  locale,
                )}
              </Text>
            </View>
            <View style={styles.summaryChip}>
              <Text style={styles.summaryChipText}>
                {t('chat_summary_count', { n: formatNumber(waitingCount, locale) })}
              </Text>
            </View>
          </View>
        ) : null}

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
            /* ★ A concluded talk is not waiting on anybody. An accepted
               offer was reading "Waiting for their reply", which is the one
               thing it is certainly not doing — the deal is struck. Only an
               OPEN offer gets a waiting line; the rest state where they
               ended. */
            const live = offer.status === 'OPEN';
            const note = noteText(offer.note, t);
            const total = quintalValuePaise(offer.price_paise_per_qtl, offer.qty_kg);
            return (
              <View key={offer.id} style={[styles.card, waitingOnViewer && styles.cardWaiting]}>
                {/* ── Tinted header band, Stitch 31's card anatomy ─────── */}
                <View style={[styles.band, waitingOnViewer && styles.bandWaiting]}>
                  <Text style={[styles.bandRound, waitingOnViewer && styles.bandRoundWaiting]}>
                    {t('chat_round', { round: formatNumber(offer.round, locale) })}
                  </Text>
                  <View style={styles.bandDot} />
                  <Text style={[styles.bandStatus, waitingOnViewer && styles.bandRoundWaiting]}>
                    {t(STATUS_KEY[offer.status])}
                  </Text>
                </View>

                <View style={styles.cardBody}>
                  {/* Who, and for how much produce */}
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
                        {t('chat_qty', { qty: formatQuintal(offer.qty_kg, locale) })}
                      </Text>
                    </View>
                  </View>

                  {/* ── The figures panel: rate on the left, what the whole
                      lot comes to on the right, divided — Stitch 31's
                      "वजन व पोती / नक्त देय रक्कम" band. Both at one size. */}
                  <View style={styles.figures}>
                    <View style={styles.figureCol}>
                      <Text style={styles.figureLabel}>{t('bg_rate_label')}</Text>
                      <View style={styles.figureLine}>
                        <Text style={styles.figureValue}>
                          {formatPaise(offer.price_paise_per_qtl, locale)}
                        </Text>
                        <Text style={styles.figureUnit}>{t('bg_per_qtl')}</Text>
                      </View>
                    </View>
                    <View style={styles.figureDivider} />
                    <View style={styles.figureColRight}>
                      <Text style={styles.figureLabel}>{t('bg_lot_total_label')}</Text>
                      <Text style={[styles.figureValue, styles.figureTotal]}>
                        {formatPaise(total, locale)}
                      </Text>
                    </View>
                  </View>

                  {/* The note is the message — the only free text this
                      channel carries, and the reason a thread reads as a
                      conversation. Rendered only when there is one, rather
                      than as a permanent "(no message)" placeholder. */}
                  {note ? (
                    <View style={styles.noteRow}>
                      <Icon name="message-circle" size={13} color={colors.onSurfaceVariant} />
                      <Text style={styles.note} numberOfLines={2}>
                        {note}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.cardFoot}>
                    <View style={styles.waitingRow}>
                      <Icon
                        name={
                          waitingOnViewer
                            ? 'zap'
                            : offer.status === 'ACCEPTED'
                              ? 'check-circle'
                              : live
                                ? 'clock'
                                : 'info'
                        }
                        size={13}
                        color={
                          waitingOnViewer
                            ? colors.primary
                            : offer.status === 'ACCEPTED'
                              ? colors.tertiary
                              : colors.onSurfaceVariant
                        }
                      />
                      <Text
                        style={[
                          styles.waiting,
                          waitingOnViewer && styles.waitingOnYou,
                          offer.status === 'ACCEPTED' && styles.waitingDone,
                        ]}>
                        {live
                          ? waitingOnViewer
                            ? t('chat_awaiting_you')
                            : t('chat_awaiting_them')
                          : t(`chat_ended_${offer.status.toLowerCase()}`)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.openBtn, waitingOnViewer && styles.openBtnPrimary]}
                      onPress={() => onOpenThread(offer)}
                      accessibilityRole="button">
                      <Text
                        style={[styles.openText, waitingOnViewer && styles.openTextPrimary]}>
                        {t('chat_open')}
                      </Text>
                      <Icon
                        name="arrow-right"
                        size={15}
                        color={waitingOnViewer ? colors.onPrimary : colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
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

  /* ── Summary band, Stitch 31's opener ─────────────────────────── */
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
  },
  summaryLeft: { flex: 1, minWidth: 0 },
  summaryLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  summaryValue: {
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    lineHeight: 30,
    color: colors.primary,
  },
  summaryChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.primaryContainer,
    flexShrink: 0,
  },
  summaryChipText: { ...typography.labelSm, color: colors.onPrimary, fontFamily: fontFamily.bold },

  /* ── The card, built to Stitch 31's anatomy: a tinted band across the
     top, then the body, then a divided figures panel. ───────────────── */
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderCard,
    overflow: 'hidden',
  },
  cardWaiting: { borderWidth: 2, borderColor: colors.primaryContainer },

  band: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    paddingVertical: 7,
    backgroundColor: colors.surfaceContainer,
  },
  bandWaiting: { backgroundColor: colors.primaryContainer },
  bandRound: { ...typography.labelSm, color: colors.onSurfaceVariant, fontFamily: fontFamily.bold },
  bandRoundWaiting: { color: colors.onPrimary },
  bandDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.outline },
  bandStatus: { ...typography.labelSm, color: colors.onSurfaceVariant },

  cardBody: { padding: space.md, gap: space.sm },

  cardTop: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, minWidth: 0 },
  cardTitle: { ...typography.titleMd, color: colors.onSurface },
  cardMeta: { ...typography.labelSm, color: colors.onSurfaceVariant, fontFamily: fontFamily.medium },

  figures: {
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: space.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainer,
  },
  figureCol: { flex: 1, minWidth: 0, gap: 1 },
  figureColRight: { flex: 1, minWidth: 0, gap: 1, alignItems: 'flex-end' },
  figureDivider: { width: 1, backgroundColor: colors.outlineVariant, marginHorizontal: space.sm },
  figureLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  /* Sibling Texts and an explicit lineHeight — a nested smaller <Text>
     takes over the line box on Android and shears the top off the number. */
  figureLine: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  figureValue: {
    fontFamily: fontFamily.extraBold,
    fontSize: 18,
    lineHeight: 26,
    color: colors.onSurface,
  },
  figureUnit: { ...typography.labelSm, color: colors.onSurfaceVariant, fontFamily: fontFamily.medium },
  figureTotal: { color: colors.primary },

  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  note: { ...typography.bodySm, color: colors.onSurfaceVariant, flex: 1, lineHeight: 18 },

  cardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.xs,
    paddingTop: space.xs,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  waitingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1, minWidth: 0 },
  waiting: { ...typography.labelSm, color: colors.onSurfaceVariant, flexShrink: 1 },
  waitingOnYou: { color: colors.primary, fontFamily: fontFamily.bold },
  waitingDone: { color: colors.tertiary, fontFamily: fontFamily.bold },

  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerHigh,
    flexShrink: 0,
  },
  openBtnPrimary: { backgroundColor: colors.primaryContainer },
  openTextPrimary: { color: colors.onPrimary, fontFamily: fontFamily.extraBold },
  openText: { ...typography.labelMd, color: colors.primary },
});
