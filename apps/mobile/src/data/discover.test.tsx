import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import type { Area, EventsResponse } from '@mireqo/contracts';
import { createAreaPreference } from './area-preference';
import { AreaPreferenceContext } from './preferences';
import { useDiscoverData } from './discover';
import { getAreas, getEvents } from './catalog';
jest.mock('./catalog', () => ({
  getAreas: jest.fn(),
  getEvents: jest.fn(),
  CatalogError: class extends Error {},
}));
const areas: Area[] = ['coacalco', 'tultitlan'].map((id) => ({
  id,
  name: id,
  administrativeContext: 'Estado de México',
  kind: 'municipality',
  country: 'MX',
  timezone: 'America/Mexico_City',
}));
function page(
  areaId: string,
  id = 'one',
  nextCursor: string | null = null,
): EventsResponse {
  return {
    area: areas.find((area) => area.id === areaId)!,
    items: [
      {
        id,
        title: id,
        areaId,
        image: null,
        venue: null,
        neighborhood: null,
        category: null,
        schedule: { kind: 'unannounced' },
        price: { kind: 'unknown' },
        status: 'scheduled',
        updatedAt: '2026-09-07T12:00:00Z',
      },
    ],
    nextCursor,
    demo: { isDemo: true, referenceDate: '2026-09-07', datasetVersion: 'v1' },
  };
}
async function setup(initial = 'coacalco') {
  const store = createAreaPreference({
    initialize: async () => {},
    read: async () => initial,
    write: async () => {},
  });
  await store.hydrate();
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
    },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>
      <AreaPreferenceContext.Provider value={store}>
        {children}
      </AreaPreferenceContext.Provider>
    </QueryClientProvider>
  );
  return { ...renderHook(() => useDiscoverData(), { wrapper }), client };
}
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getAreas).mockResolvedValue({ items: areas });
});
test('late old-area request never appears beneath new-area identity', async () => {
  let resolveOld!: (value: EventsResponse) => void;
  jest.mocked(getEvents).mockImplementation(async (areaId) =>
    areaId === 'coacalco'
      ? new Promise((resolve) => {
          resolveOld = resolve;
        })
      : page(areaId, 'new-area-event'),
  );
  const { result, unmount, client } = await setup();
  await waitFor(() => expect(getEvents).toHaveBeenCalled());
  act(() => result.current.selectArea('tultitlan'));
  await waitFor(() =>
    expect(result.current.events[0]?.id).toBe('new-area-event'),
  );
  await act(async () => {
    resolveOld(page('coacalco', 'old-area-event'));
  });
  expect(result.current.selectedArea?.id).toBe('tultitlan');
  expect(result.current.events.map((item) => item.id)).toEqual([
    'new-area-event',
  ]);
  unmount();
  client.clear();
});
test('refresh failure preserves same-area session content and recovers', async () => {
  jest.mocked(getEvents).mockResolvedValue(page('coacalco'));
  const { result, unmount, client } = await setup();
  await waitFor(() => expect(result.current.events).toHaveLength(1));
  jest.mocked(getEvents).mockRejectedValueOnce(new Error('offline'));
  act(() => result.current.refresh());
  await waitFor(() => expect(result.current.error).not.toBeNull());
  expect(result.current.events[0]?.id).toBe('one');
  act(() => result.current.refresh());
  await waitFor(() => expect(result.current.error).toBeNull());
  unmount();
  client.clear();
});
test('pagination failure keeps first page and retry appends only successful page', async () => {
  jest
    .mocked(getEvents)
    .mockResolvedValueOnce(page('coacalco', 'one', 'cursor'))
    .mockRejectedValueOnce(new Error('interrupted'))
    .mockResolvedValueOnce(page('coacalco', 'two'));
  const { result, unmount, client } = await setup();
  await waitFor(() => expect(result.current.hasMore).toBe(true));
  act(() => result.current.loadMore());
  await waitFor(() => expect(result.current.paginationError).not.toBeNull());
  expect(result.current.events.map((item) => item.id)).toEqual(['one']);
  act(() => result.current.loadMore());
  await waitFor(() => expect(result.current.events).toHaveLength(2));
  expect(result.current.events.map((item) => item.id)).toEqual(['one', 'two']);
  expect(result.current.paginationError).toBeNull();
  unmount();
  client.clear();
});
test('unknown persisted area returns to selection without querying the wrong area', async () => {
  const { result, unmount, client } = await setup('obsolete-area');
  await waitFor(() => expect(result.current.areas).toHaveLength(2));
  expect(result.current.selectedArea).toBeNull();
  expect(getEvents).not.toHaveBeenCalled();
  unmount();
  client.clear();
});
