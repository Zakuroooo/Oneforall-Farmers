/**
 * Providers, in the order they have to be in.
 *
 *   SafeAreaProvider → QueryClientProvider → I18nProvider → AuthProvider
 *     → NavigationContainer → RootNavigator
 *
 * `AuthProvider` sits *inside* `QueryClientProvider` because its boot path calls
 * `/auth/me`, and *outside* `NavigationContainer` because `RootNavigator` chooses
 * the navigator from `useAuth()`. Neither of those is swappable.
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApiError } from './src/lib/api';
import { AuthProvider } from './src/lib/auth';
import { I18nProvider } from './src/lib/i18n';
import { RootNavigator } from './src/navigation/RootNavigator';
import { CACHE_STALE_MS } from './src/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_STALE_MS,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1, width: '100%', height: '100%' }}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </I18nProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
