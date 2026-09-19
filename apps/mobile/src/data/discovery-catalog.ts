import {
  parseDiscoveryContextResponse,
  parseDiscoveryEventsResponse,
} from '@mireqo/contracts';
import { request } from './catalog';
import type { DiscoveryScope } from '../domain/discovery-filters';
export type { DiscoveryScope } from '../domain/discovery-filters';
export async function getDiscoveryContext(
  areaId: string,
  signal?: AbortSignal,
) {
  const result = parseDiscoveryContextResponse(
    await request(
      `/v1/discovery/context?areaId=${encodeURIComponent(areaId)}`,
      signal,
    ),
  );
  if (result.area.id !== areaId) throw new Error('Discovery area mismatch');
  return result;
}
export async function getDiscoveryEvents(
  scope: DiscoveryScope,
  cursor: string | null,
  limit: number,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({ ...scope, limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  const result = parseDiscoveryEventsResponse(
    await request(`/v1/discovery/events?${params}`, signal),
  );
  if (
    result.area.id !== scope.areaId ||
    result.context.token !== scope.context ||
    result.filters.date !== scope.date ||
    result.filters.category !== (scope.category ?? null) ||
    result.filters.collection !== (scope.collection ?? null)
  )
    throw new Error('Discovery context mismatch');
  return result;
}
export const discoveryKey = (scope: DiscoveryScope, kind: 'preview' | 'list') =>
  [
    'discovery',
    kind,
    scope.areaId,
    scope.context,
    scope.date,
    scope.category ?? null,
    scope.collection ?? null,
  ] as const;
