import { parseEventDetailsResponse } from '@mireqo/contracts';
import { useQuery } from '@tanstack/react-query';
import { CatalogError, request } from './catalog';
import { detailSnapshot } from '../domain/saved-event';
import { useSaved } from './saved-context';
export async function getEventDetails(id: string, signal?: AbortSignal) {
  const result = parseEventDetailsResponse(
    await request(`/v1/events/${encodeURIComponent(id)}`, signal),
  );
  if (result.event.id !== id) throw new Error('Event identity mismatch');
  return result;
}
export function useEventDetails(id: string) {
  const { store } = useSaved();
  return useQuery({
    queryKey: ['event-details', id],
    queryFn: async ({ signal }) => {
      const revision = store.revision(id);
      const snapshot = detailSnapshot(await getEventDetails(id, signal));
      if (!signal.aborted) store.enrich(snapshot, revision);
      return snapshot;
    },
    retry: false,
    staleTime: 60_000,
  });
}
export function detailsError(error: unknown) {
  return error instanceof CatalogError && error.code === 'NOT_FOUND'
    ? 'Current details are unavailable. Your saved event is still here.'
    : 'Could not refresh event details. Last-known information is shown when available.';
}
