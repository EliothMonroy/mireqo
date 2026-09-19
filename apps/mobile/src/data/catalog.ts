import { parseAreasResponse, parseEventsResponse } from '@mireqo/contracts';
const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
export class CatalogError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
export async function request(
  path: string,
  signal?: AbortSignal,
): Promise<unknown> {
  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}${path}`, {
      signal,
    });
    if (!response.ok) {
      throw new CatalogError(
        response.status === 404
          ? 'NOT_FOUND'
          : response.status === 400
            ? 'INVALID_REQUEST'
            : 'UNAVAILABLE',
        response.status === 400
          ? 'This demo catalog changed. Refresh to start again.'
          : 'We could not reach the event catalog. Please try again.',
      );
    }
    return await response.json();
  } catch (error) {
    // Native transport/body-read exceptions can contain implementation details
    // and URLs. Keep cancellation and typed HTTP failures intact.
    if (
      error instanceof CatalogError ||
      signal?.aborted ||
      (error instanceof Error && error.name === 'AbortError')
    )
      throw error;
    throw new CatalogError(
      'UNAVAILABLE',
      'We could not reach the event catalog. Please try again.',
    );
  }
}
export async function getAreas(signal?: AbortSignal) {
  return parseAreasResponse(await request('/v1/areas', signal));
}
export async function getEvents(
  areaId: string,
  cursor: string | null,
  signal?: AbortSignal,
) {
  const query = `areaId=${encodeURIComponent(areaId)}&limit=6${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
  const result = parseEventsResponse(
    await request(`/v1/events?${query}`, signal),
  );
  if (
    result.area.id !== areaId ||
    result.items.some((event) => event.areaId !== areaId)
  )
    throw new Error('Catalog area mismatch');
  return result;
}
