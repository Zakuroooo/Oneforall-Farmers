/**
 * The placeholder every unbuilt route points at, so the navigator is complete from
 * P0 and each screen replaces one line instead of appearing out of nowhere.
 *
 * It says which screen is coming, in Marathi, because a tab that opens onto a blank
 * white view during a rehearsal is indistinguishable from a crash.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function Soon({ label }: { label: string }) {
  return (
    <View style={styles.root}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.sub}>लवकरच</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  label: { fontSize: 20, marginBottom: 8 },
  sub: { fontSize: 16, color: '#666' },
});
