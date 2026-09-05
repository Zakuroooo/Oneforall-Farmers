/**
 * Providers, in the order they have to be in.
 *
 *   SafeAreaProvider → QueryClientProvider → [I18nProvider] → AuthProvider
 *     → NavigationContainer → RootNavigator
 *
 * `AuthProvider` sits *inside* `QueryClientProvider` because its boot path calls
 * `/auth/me`, and *outside* `NavigationContainer` because `RootNavigator` chooses
 * the navigator from `useAuth()`. Neither of those is swappable.
 *
 * ★ Do not apply this file until the plain React Native welcome screen has built
 *   and launched once. That first green build is what tells you the toolchain is
 *   sound; if this lands before it, a Gradle failure and a bad import look the same.
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApiError } from './src/lib/api';
import { AuthProvider } from './src/lib/auth';
import { RootNavigator } from './src/navigation/RootNavigator';
import { CACHE_STALE_MS } from './src/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_STALE_MS,

      /**
       * ★ Never retry a 4xx.
       *
       *   The default retries three times with backoff. On a 404 — which is what I4
       *   returns for another actor's row, and what an empty result looks like —
       *   that is roughly seven seconds of spinner before the farmer sees the empty
       *   state he was always going to see. On a 400 it is seven seconds before he
       *   sees the validation message. Retry the network, not the answer.
       */
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },

      // TODO(pranay): P8 wires `lib/offline.ts` in here so a cold start with no
      //   network renders the last known values with the stale banner, rather than
      //   an error. Venue wifi fails; the app should degrade, not stop.
    },
  },
});

export default function App() {
  // TODO(shreya): SH1 wraps <AuthProvider> in <I18nProvider>. It goes outside Auth
  //   so the login screens are already translated, and inside Query so a locale
  //   change does not blow away the cache.
  // TODO(pranay): P9 calls Sound.setCategory('Playback') once, here, at mount —
  //   without it the Marathi clips are silent when the phone is on vibrate, which
  //   is how a demo phone is always configured.
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
