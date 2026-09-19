import {
  createContext,
  useContext,
  useSyncExternalStore,
  useState,
  useEffect,
} from 'react';
import { AppState } from 'react-native';
import type { SavedStore } from './saved-store';
export const SavedContext = createContext<SavedStore | null>(null);
export function useSaved() {
  const store = useContext(SavedContext);
  if (!store) throw new Error('Saved provider missing');
  return {
    ...useSyncExternalStore(
      store.subscribe,
      store.getSnapshot,
      store.getSnapshot,
    ),
    store,
  };
}
export function useEventClock() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = setInterval(update, 1000);
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') update();
    });
    return () => {
      clearInterval(timer);
      listener.remove();
    };
  }, []);
  return now;
}
