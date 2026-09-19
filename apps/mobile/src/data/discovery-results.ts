import { useState } from 'react';
import type { DiscoveryEventsResponse } from '@mireqo/contracts';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  discoveryKey,
  getDiscoveryEvents,
  getDiscoveryContext,
  type DiscoveryScope,
} from './discovery-catalog';
import { discoveryError } from './discovery-session';
import { CatalogError } from './catalog';
export function useDiscoveryPreview(scope: DiscoveryScope) {
  const query = useQuery({
    queryKey: discoveryKey(scope, 'preview'),
    queryFn: ({ signal }) => getDiscoveryEvents(scope, null, 2, signal),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    placeholderData: (previous) =>
      previous && matchesScope(previous, scope) ? previous : undefined,
  });
  const data = useRetainedData(query.data, scope);
  return {
    ...query,
    data,
    message: discoveryError(query.error),
    stale: query.isPlaceholderData || (!query.data && !!data),
    restart:
      query.error instanceof CatalogError &&
      query.error.code === 'INVALID_REQUEST',
  };
}
export function useDiscoveryList(scope: DiscoveryScope) {
  const query = useInfiniteQuery({
    queryKey: discoveryKey(scope, 'list'),
    queryFn: ({ signal, pageParam }) =>
      getDiscoveryEvents(scope, pageParam, 6, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.nextCursor,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    placeholderData: (previous) =>
      previous?.pages[0] && matchesScope(previous.pages[0], scope)
        ? previous
        : undefined,
  });
  const data = useRetainedData(query.data, scope);
  return {
    ...query,
    data,
    stale: query.isPlaceholderData || (!query.data && !!data),
    items: data?.pages.flatMap((page) => page.items) ?? [],
    message: discoveryError(query.error),
    restart:
      query.error instanceof CatalogError &&
      query.error.code === 'INVALID_REQUEST',
  };
}

// Keep prior successful content only within the same area and filter scope. A
// new generation can fail without discarding usable rows from that scope.
function useRetainedData<T>(
  current: T | undefined,
  scope: DiscoveryScope,
): T | undefined {
  const key = JSON.stringify([
    scope.areaId,
    scope.date,
    scope.category,
    scope.collection,
  ]);
  const [previous, setPrevious] = useState({ key, data: current });
  if (
    previous.key !== key ||
    (current !== undefined && current !== previous.data)
  )
    setPrevious({ key, data: current });
  return current ?? (previous.key === key ? previous.data : undefined);
}
function matchesScope(page: DiscoveryEventsResponse, scope: DiscoveryScope) {
  return (
    page.area.id === scope.areaId &&
    page.filters.date === scope.date &&
    page.filters.category === (scope.category ?? null) &&
    page.filters.collection === (scope.collection ?? null)
  );
}

export function useDiscoveryRefresh(areaId: string) {
  const client = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function refresh() {
    if (refreshing) return null;
    setRefreshing(true);
    setError(null);
    try {
      // Use the shared query so overlapping foreground/manual renewals are
      // deduplicated and cannot install an older response over a newer one.
      const next = await client.fetchQuery({
        queryKey: ['discovery-context', areaId],
        queryFn: ({ signal }) => getDiscoveryContext(areaId, signal),
        staleTime: 0,
      });
      return next;
    } catch (failure) {
      setError(discoveryError(failure));
      return null;
    } finally {
      setRefreshing(false);
    }
  }
  return { refreshing, error, refresh };
}
