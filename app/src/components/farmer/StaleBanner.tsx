/**
 * StaleBanner — P11. Renders nothing when the data on screen is fresh;
 * renders its age in Marathi, with the actual clock time, when it is not.
 *
 * ★ Age is the only signal, on purpose — no NetInfo, no connectivity check.
 *   `offline.ts`'s cache has no way to know whether the network is actually
 *   down; it only knows how old what is currently rendered is. That is also
 *   the more honest thing to tell a farmer: "this is from 11:40" is true
 *   whether the phone is offline or the server was just slow.
 *
 * ★ Additive only. Every screen that uses this still renders its own
 *   loading/empty/error states first — this only ever appears inside the
 *   "data" branch, next to data that is actually on screen.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CACHE_STALE_MS } from '../../config';
import { devNum } from '../../lib/i18n';
import type { Locale } from '../../types/api';

export interface StaleBannerProps {
  /** `dataUpdatedAt` straight off a `useQuery` result — 0 means no
   * successful fetch has landed yet, which is not this component's job to
   * describe (that is the screen's loading/empty state). */
  dataUpdatedAt: number;
  locale?: Locale;
}

function formatClockMr(epochMs: number, locale: Locale): string {
  const d = new Date(epochMs);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return devNum(`${hh}:${mm}`, locale);
}

export function StaleBanner({ dataUpdatedAt, locale = 'mr' }: StaleBannerProps) {
  if (dataUpdatedAt <= 0) return null;

  const age = Date.now() - dataUpdatedAt;
  if (age < CACHE_STALE_MS) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        जुनी माहिती — शेवटचे अद्ययावत {formatClockMr(dataUpdatedAt, locale)} वाजता
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    textAlign: 'center',
  },
});
