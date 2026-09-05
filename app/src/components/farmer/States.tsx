/**
 * Loading / error / empty, stubbed.
 *
 * ★ These belong in `src/components/ui/` and that directory is Shreya's (SH2).
 *   I am not creating files in her lane, so these live here, deliberately ugly,
 *   deliberately un-styled, and deliberately marked. When SH2 lands, delete this
 *   file and change the imports — it is one line per screen.
 *
 * They exist at all because CLAUDE.md §5 says a screen renders four states and a
 * screen with only the happy path is not done. Waiting for a teammate's component
 * to write the other three is how you end up with fifteen happy-path screens at H30.
 */

import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

// TODO(shreya): replace all three with src/components/ui/{Skeleton,ErrorState,EmptyState}.
//   Blocker filed. Until then these are placeholders and look it.

export function Skeleton({ height = 120 }: { height?: number }) {
  return (
    <View
      accessibilityLabel="loading"
      style={{
        height,
        backgroundColor: '#E8E8E8',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <ActivityIndicator />
    </View>
  );
}

/**
 * ★ NO_ADVICE must never reach this component.
 *
 * A refusal is a 200 with a body and a reason. Routing it here would render it as a
 * crash with a retry button, which reads as "the app broke" — the exact opposite of
 * I6, where refusing on purpose is the thing we want a judge to see.
 */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={{ padding: 24, alignItems: 'center' }}>
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 16 }}>
        {message}
      </Text>
      {onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          style={{ paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#1B5E20', borderRadius: 8 }}>
          {/* TODO(shreya): t('common.retry') once i18n.tsx exists (SH1). */}
          <Text style={{ color: '#FFF', fontSize: 16 }}>पुन्हा प्रयत्न करा</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

/**
 * The empty state is not a nicety. A judge's second click is the thing you did not
 * seed, and "no lots yet" with a button beats a blank screen or a spinner that never
 * resolves.
 */
export function EmptyState({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={{ padding: 24, alignItems: 'center' }}>
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 16 }}>{title}</Text>
      {action && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          style={{ paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#1B5E20', borderRadius: 8 }}>
          <Text style={{ color: '#FFF', fontSize: 16 }}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
