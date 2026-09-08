import { useEffect, useState, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';
import * as Network from 'expo-network';
import { createAreaPreference } from '../data/area-preference';
import { sqliteAreaStorage } from '../data/area-sqlite';
import { AreaPreferenceContext } from '../data/preferences';

export function AppProviders({ children }: PropsWithChildren) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: 60_000, networkMode: 'always' },
        },
      }),
  );
  const [preferences] = useState(() =>
    createAreaPreference(sqliteAreaStorage()),
  );
  useEffect(() => {
    void preferences.hydrate();
    focusManager.setFocused(AppState.currentState === 'active');
    const appState = AppState.addEventListener('change', (state) =>
      focusManager.setFocused(state === 'active'),
    );
    const updateNetwork = (state: Network.NetworkState) => {
      // Unknown reachability is not proof of being offline.
      onlineManager.setOnline(
        state.isConnected !== false && state.isInternetReachable !== false,
      );
    };
    let active = true;
    void Network.getNetworkStateAsync()
      .then((state) => {
        if (active) updateNetwork(state);
      })
      .catch(() => {
        /* Requests remain the authority when native connectivity is unavailable. */
      });
    const network = Network.addNetworkStateListener(updateNetwork);
    return () => {
      active = false;
      appState.remove();
      network.remove();
    };
  }, [preferences]);
  return (
    <QueryClientProvider client={client}>
      <AreaPreferenceContext.Provider value={preferences}>
        {children}
      </AreaPreferenceContext.Provider>
    </QueryClientProvider>
  );
}
