import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';
import { AppState } from 'react-native';
import { onlineManager, useQuery, useQueryClient } from '@tanstack/react-query';
import type { DiscoveryDate } from '@mireqo/contracts';
import { getAreas } from './catalog';
import { getDiscoveryContext } from './discovery-catalog';
import { useAreaPreference } from './preferences';
export function discoveryError(error: unknown): string | null {
  return error
    ? error instanceof Error
      ? error.message
      : 'The catalog could not be loaded. Please try again.'
    : null;
}
const subscribeOnline = (listener: () => void) =>
  onlineManager.subscribe(listener);
export function useIsOffline() {
  return !useSyncExternalStore(
    subscribeOnline,
    () => onlineManager.isOnline(),
    () => true,
  );
}
function useSession() {
  const preference = useAreaPreference();
  const client = useQueryClient();
  const [date, setDate] = useState<DiscoveryDate>('default');
  const areas = useQuery({
    queryKey: ['areas'],
    queryFn: ({ signal }) => getAreas(signal),
    staleTime: Infinity,
  });
  const selectedArea = !preference.hydrating
    ? (areas.data?.items.find((area) => area.id === preference.areaId) ?? null)
    : null;
  const context = useQuery({
    queryKey: ['discovery-context', selectedArea?.id],
    queryFn: ({ signal }) => getDiscoveryContext(selectedArea!.id, signal),
    enabled: !!selectedArea,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const refresh = () => {
    if (!context.isFetching) void context.refetch();
  };
  const { refetch } = context;
  useEffect(() => {
    if (!selectedArea) return;
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refetch();
    });
    // Current launch areas share Mexico City's fixed UTC-06 calendar. The API
    // remains the clock authority; local timers only request a new generation.
    const localDay = () =>
      new Intl.DateTimeFormat('en-CA', {
        timeZone: selectedArea.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
    let observedDay = localDay();
    const timer = setInterval(() => {
      const nextDay = localDay();
      if (nextDay !== observedDay) {
        observedDay = nextDay;
        void refetch();
      }
    }, 15_000);
    return () => {
      listener.remove();
      clearInterval(timer);
    };
  }, [selectedArea, refetch]);
  return {
    areas: areas.data?.items ?? [],
    areasLoading: areas.isPending,
    areasError: discoveryError(areas.error),
    retryAreas: () => {
      void areas.refetch();
    },
    selectedArea,
    hydrating: preference.hydrating,
    persistenceError: preference.error,
    retryPersistence: preference.retryPersistence,
    selectArea: (id: string) => {
      if (
        areas.data?.items.some((area) => area.id === id) &&
        id !== preference.areaId
      ) {
        client.removeQueries({
          queryKey: ['discovery-context', id],
          exact: true,
        });
        preference.selectArea(id);
      }
    },
    date,
    setDate,
    context: context.data,
    contextError: discoveryError(context.error),
    contextLoading: !!selectedArea && context.isPending,
    refreshing: context.isFetching && !!context.data,
    refresh,
    isOffline: useIsOffline(),
  };
}
export type DiscoverySession = ReturnType<typeof useSession>;
const SessionContext = createContext<DiscoverySession | null>(null);
export function DiscoverySessionProvider({ children }: PropsWithChildren) {
  return (
    <SessionContext.Provider value={useSession()}>
      {children}
    </SessionContext.Provider>
  );
}
export function useDiscoverySession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('DiscoverySessionProvider missing');
  return session;
}
