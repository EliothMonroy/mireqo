import {
  useInfiniteQuery,
  useQuery,
  onlineManager,
} from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import { getAreas, getEvents, CatalogError } from './catalog';
import { useAreaPreference } from './preferences';
const subscribeOnline = (listener: () => void) =>
  onlineManager.subscribe(listener);
function errorMessage(error: unknown): string | null {
  if (!error) return null;
  return error instanceof CatalogError
    ? error.message
    : 'The event catalog could not be loaded. Please try again.';
}
export function useDiscoverData() {
  const preference = useAreaPreference();
  const online = useSyncExternalStore(
    subscribeOnline,
    () => onlineManager.isOnline(),
    () => true,
  );
  const areas = useQuery({
    queryKey: ['areas'],
    queryFn: ({ signal }) => getAreas(signal),
    staleTime: Infinity,
  });
  const selectedArea = !preference.hydrating
    ? (areas.data?.items.find((area) => area.id === preference.areaId) ?? null)
    : null;
  const events = useInfiniteQuery({
    queryKey: ['events', selectedArea?.id],
    queryFn: ({ pageParam, signal }) =>
      getEvents(selectedArea!.id, pageParam, signal),
    enabled: selectedArea !== null && !preference.hydrating,
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.nextCursor,
  });
  return {
    areas: areas.data?.items ?? [],
    areasLoading: areas.isPending,
    areasError: errorMessage(areas.error),
    retryAreas: () => {
      void areas.refetch();
    },
    selectedArea,
    hydrating: preference.hydrating,
    persistenceError: preference.error,
    selectArea: (areaId: string) => {
      if (areas.data?.items.some((area) => area.id === areaId))
        preference.selectArea(areaId);
    },
    retryPersistence: preference.retryPersistence,
    events: events.data?.pages.flatMap((page) => page.items) ?? [],
    demo: events.data?.pages[0]?.demo,
    initialLoading: !!selectedArea && events.isPending,
    error: events.isFetchNextPageError ? null : errorMessage(events.error),
    refreshing: events.isRefetching && !events.isFetchingNextPage,
    refresh: () => {
      if (!events.isFetching) void events.refetch();
    },
    loadingMore: events.isFetchingNextPage,
    loadMore: () => {
      if (events.hasNextPage && !events.isFetching) void events.fetchNextPage();
    },
    hasMore: events.hasNextPage,
    paginationError: events.isFetchNextPageError
      ? errorMessage(events.error)
      : null,
    isOffline: !online,
  };
}
export type DiscoverData = ReturnType<typeof useDiscoverData>;
