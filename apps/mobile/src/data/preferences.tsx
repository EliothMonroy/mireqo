import { createContext, useContext, useSyncExternalStore } from 'react';
import type { AreaPreference } from './area-preference';
export const AreaPreferenceContext = createContext<AreaPreference | null>(null);
export function useAreaPreference() {
  const store = useContext(AreaPreferenceContext);
  if (!store) throw new Error('Area preferences provider is missing');
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
  return { ...state, selectArea: store.select, retryPersistence: store.retry };
}
