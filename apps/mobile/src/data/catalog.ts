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
async function request(path: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(`${apiUrl.replace(/\/$/, '')}${path}`, {
    signal,
  });
  if (!response.ok) {
    throw new CatalogError(
      response.status === 400 ? 'INVALID_REQUEST' : 'UNAVAILABLE',
      response.status === 400
        ? 'This demo catalog changed. Refresh to start again.'
        : 'We could not reach the event catalog. Please try again.',
    );
  }
  return response.json();
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
