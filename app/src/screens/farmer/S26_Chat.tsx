/**
 * S26 — chat + call. P15, cuttable (PRANAY.md §1.3 — "no demo beat fails if
 * this is cut"), built anyway since the ask was the whole frontend, not just
 * the golden path.
 *
 * ★ CANON has no chat section at all (`ChatMessage`'s header in
 *   `types/api.ts`) — this screen, its DTO and its two api.ts functions are
 *   all this frontend's own proposal, not a transcription of a documented
 *   contract.
 *
 * ★ 12_STACK.md: chat is "TanStack Query, 4s polling — no websockets", and
 *   call is "`Linking.openURL('tel:…')` — built in, zero deps". Both are
 *   exactly that here; nothing native beyond what React Native already ships
 *   was added for this screen.
 *
 * ★ Real gap, flagged rather than papered over: no DTO in this app (`TxDto`,
 *   `OfferDto`, buyer reliability) carries a buyer phone number anywhere.
 *   The call button below opens the dialer against a placeholder until that
 *   field exists on some response — a farmer tapping call today would dial
 *   a number that is not really the buyer's.
 */

import React, { useEffect, useState } from 'react';
import { FlatList, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getChatMessages, sendChatMessage } from '../../lib/api';
import { getLocale } from '../../lib/locale';
import { translate } from '../../lib/i18n';
import { CHAT_POLL_MS, USE_FIXTURES } from '../../config';
import { fxChatMessages } from '../../fixtures/chat';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '../../components/farmer/States';
import type { ChatMessage, Locale } from '../../types/api';

const DEFAULT_TX_ID = 'tx_1';
/** TODO(akash): no DTO exposes a buyer phone number anywhere in this app —
 * placeholder until one does. See this file's header. */
const PLACEHOLDER_BUYER_PHONE = '+911234567890';

async function fetchMessages(txId: string): Promise<ChatMessage[]> {
  if (USE_FIXTURES) return fxChatMessages;
  return getChatMessages(txId);
}

export default function S26_Chat() {
  const txId = DEFAULT_TX_ID;
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [locale, setLocale] = useState<Locale>('mr');
  useEffect(() => {
    getLocale().then(l => l && setLocale(l));
  }, []);

  const { data: messages, isLoading, error, refetch } = useQuery({
    queryKey: ['chat', txId],
    queryFn: () => fetchMessages(txId),
    // 4s polling, no websockets — 12_STACK.md's explicit choice for chat.
    refetchInterval: CHAT_POLL_MS,
  });

  const { mutate: send, isPending: sending } = useMutation({
    mutationFn: async (text: string) => {
      if (USE_FIXTURES) {
        const optimistic: ChatMessage = {
          id: `msg_local_${Date.now()}`,
          tx_id: txId,
          sender: 'FARMER',
          text,
          created_at: new Date().toISOString(),
        };
        return optimistic;
      }
      return sendChatMessage(txId, text);
    },
    onSuccess: sent => {
      queryClient.setQueryData<ChatMessage[]>(['chat', txId], (prev: ChatMessage[] | undefined) => [
        ...(prev ?? []),
        sent,
      ]);
      setDraft('');
    },
  });

  const call = () => Linking.openURL(`tel:${PLACEHOLDER_BUYER_PHONE}`);

  if (isLoading) {
    return (
      <View style={styles.root}>
        <Skeleton height={60} />
        <View style={{ height: 12 }} />
        <Skeleton height={60} />
      </View>
    );
  }

  // P11, and this screen is the sharpest case of it: the query above polls
  // every 4 s, so on a dead network a bare `if (error)` blanks a thread the
  // farmer is reading roughly four seconds after airplane mode goes on — beat
  // 7's exact territory. Messages already fetched stay on screen; only an
  // empty cache plus a failure is an error state.
  if (error && !messages) {
    return (
      <ErrorState message={translate('chat_fetch_error', locale)} onRetry={() => refetch()} />
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>{translate('chat_header', locale)}</Text>
        <TouchableOpacity onPress={call} style={styles.callButton} accessibilityRole="button">
          <Text style={styles.callButtonText}>{translate('call_button', locale)}</Text>
        </TouchableOpacity>
      </View>

      {!messages || messages.length === 0 ? (
        <EmptyState
          title={translate('chat_empty_title', locale)}
          description={translate('chat_empty_description', locale)}
        />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.sender === 'FARMER' ? styles.bubbleMine : styles.bubbleTheirs]}>
              <Text style={styles.bubbleText}>{item.text}</Text>
            </View>
          )}
        />
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={translate('message_placeholder', locale)}
          value={draft}
          onChangeText={setDraft}
          multiline
        />
        <Button
          title={translate('send_message_button', locale)}
          onPress={() => draft.trim() && send(draft.trim())}
          disabled={sending || draft.trim().length === 0}
          style={styles.sendButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  header: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  callButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#E8F5E9', borderRadius: 20 },
  callButtonText: { fontSize: 14, fontWeight: '700', color: '#1B5E20' },
  list: { paddingBottom: 12 },
  bubble: { maxWidth: '80%', borderRadius: 12, padding: 12, marginBottom: 8 },
  bubbleMine: { backgroundColor: '#E8F5E9', alignSelf: 'flex-end' },
  bubbleTheirs: { backgroundColor: '#F1F5F9', alignSelf: 'flex-start' },
  bubbleText: { fontSize: 15, color: '#1E293B' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 8 },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1E293B',
    maxHeight: 100,
    backgroundColor: '#FFFFFF',
  },
  sendButton: { minWidth: 90 },
});
