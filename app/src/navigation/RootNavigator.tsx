/**
 * The role branch. One place, no route guards. Pranay.
 *
 * ★ A buyer cannot reach a farmer screen because `FarmerTabs` was never mounted.
 *   That is stronger than a guard on every screen, because there is no per-screen
 *   check that anyone can forget to add to screen seventeen at H29.
 *
 *   It is *not* the authorization boundary — the server is, and it scopes every
 *   read by the JWT actor and returns 404 for someone else's row (I4). This is the
 *   UX layer of the same idea. Both exist; only one of them is load-bearing.
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../lib/auth';
import { AuthStack } from './AuthStack';
import { BuyerTabs } from './BuyerTabs';
import { FarmerTabs } from './FarmerTabs';

function Splash() {
  return (
    <View style={styles.splash}>
      <ActivityIndicator size="large" color="#1B5E20" />
    </View>
  );
}

export function RootNavigator() {
  const { status, user } = useAuth();

  // The `/auth/me` round trip. Rendering AuthStack here would flash the language
  // picker at a returning farmer every cold start.
  if (status === 'loading') return <Splash />;

  if (!user) return <AuthStack />;

  return user.role === 'FARMER' ? <FarmerTabs /> : <BuyerTabs />;
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
