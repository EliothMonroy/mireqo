import { AppState } from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import type { DiscoveryContextResponse } from '@mireqo/contracts';
import { createAreaPreference } from './area-preference';
import { AreaPreferenceContext } from './preferences';
import {
  DiscoverySessionProvider,
  useDiscoverySession,
} from './discovery-session';
import { getAreas } from './catalog';
import { getDiscoveryContext } from './discovery-catalog';
import { areas, context } from '../test/discovery-fixtures';
jest.mock('./catalog', () => ({ getAreas: jest.fn() }));
jest.mock('./discovery-catalog', () => ({ getDiscoveryContext: jest.fn() }));
async function setup(initial = 'coacalco') {
  const write = jest.fn(async () => {});
  const store = createAreaPreference({
    initialize: async () => {},
    read: async () => initial,
    write,
  });
  await store.hydrate();
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>
      <AreaPreferenceContext.Provider value={store}>
        <DiscoverySessionProvider>{children}</DiscoverySessionProvider>
      </AreaPreferenceContext.Provider>
    </QueryClientProvider>
  );
  return {
    ...renderHook(() => useDiscoverySession(), { wrapper }),
    client,
    write,
  };
}
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getAreas).mockResolvedValue({ items: areas });
  jest
    .mocked(getDiscoveryContext)
    .mockImplementation(async (id) => context(id));
});
test('date survives area change, old area completion cannot cross identities, only area is persisted', async () => {
  let resolveOld!: (value: DiscoveryContextResponse) => void;
  jest.mocked(getDiscoveryContext).mockImplementation(async (id) =>
    id === 'coacalco'
      ? new Promise((resolve) => {
          resolveOld = resolve;
        })
      : context(id, 'new'),
  );
  const view = await setup();
  await waitFor(() => expect(getDiscoveryContext).toHaveBeenCalled());
  act(() => {
    view.result.current.setDate('tomorrow');
    view.result.current.selectArea('tultitlan');
  });
  await waitFor(() =>
    expect(view.result.current.context?.area.id).toBe('tultitlan'),
  );
  await act(async () => resolveOld(context()));
  expect(view.result.current.context?.context.token).toBe('new');
  expect(view.result.current.date).toBe('tomorrow');
  expect(view.write).toHaveBeenCalledWith('tultitlan');
  expect(view.write).toHaveBeenCalledTimes(1);
  act(() => view.result.current.setDate('default'));
  expect(view.result.current.selectedArea?.id).toBe('tultitlan');
  view.unmount();
  view.client.clear();
});
test('failed clock refresh preserves previous context with explicit error and retry replaces it', async () => {
  const view = await setup();
  await waitFor(() => expect(view.result.current.context).toBeDefined());
  jest
    .mocked(getDiscoveryContext)
    .mockRejectedValueOnce(new Error('API unavailable'));
  act(() => view.result.current.refresh());
  await waitFor(() =>
    expect(view.result.current.contextError).toBe('API unavailable'),
  );
  expect(view.result.current.context?.context.token).toBe('generation');
  jest
    .mocked(getDiscoveryContext)
    .mockResolvedValueOnce(context('coacalco', 'fresh'));
  act(() => view.result.current.refresh());
  await waitFor(() =>
    expect(view.result.current.context?.context.token).toBe('fresh'),
  );
  view.unmount();
  view.client.clear();
});
test('unknown stored area prompts selection, and session starts with default date', async () => {
  const view = await setup('obsolete');
  await waitFor(() => expect(view.result.current.areas).toHaveLength(2));
  expect(view.result.current.selectedArea).toBeNull();
  expect(view.result.current.date).toBe('default');
  expect(getDiscoveryContext).not.toHaveBeenCalled();
  view.unmount();
  view.client.clear();
});

test('app foreground renews server time without changing the selected date', async () => {
  let onState!: (state: 'active') => void;
  const spy = jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation((_type, listener) => {
      onState = listener;
      return { remove: jest.fn() };
    });
  const view = await setup();
  await waitFor(() => expect(view.result.current.context).toBeDefined());
  act(() => view.result.current.setDate('week'));
  jest
    .mocked(getDiscoveryContext)
    .mockResolvedValueOnce(context('coacalco', 'foreground'));
  act(() => onState('active'));
  await waitFor(() =>
    expect(view.result.current.context?.context.token).toBe('foreground'),
  );
  expect(view.result.current.date).toBe('week');
  view.unmount();
  view.client.clear();
  spy.mockRestore();
});

test('selected-area midnight renews relative dates without clearing the date choice', async () => {
  const subscription = jest
    .spyOn(AppState, 'addEventListener')
    .mockReturnValue({ remove: jest.fn() });
  jest.useFakeTimers({ now: new Date('2026-09-19T05:59:50.000Z') });
  const view = await setup();
  try {
    await waitFor(() => expect(view.result.current.context).toBeDefined());
    act(() => view.result.current.setDate('weekend'));
    const requestsBefore = jest.mocked(getDiscoveryContext).mock.calls.length;
    jest.mocked(getDiscoveryContext).mockResolvedValueOnce({
      ...context('coacalco', 'next-local-day'),
      context: {
        ...context().context,
        token: 'next-local-day',
        asOf: '2026-09-19T06:00:05.000Z',
        localDate: '2026-09-19',
        expiresAt: '2026-09-20T06:00:05.000Z',
      },
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(15_000);
    });
    await waitFor(() =>
      expect(view.result.current.context?.context.token).toBe('next-local-day'),
    );
    expect(getDiscoveryContext).toHaveBeenCalledTimes(requestsBefore + 1);
    expect(view.result.current.date).toBe('weekend');
    expect(view.result.current.context?.context.localDate).toBe('2026-09-19');
    await act(async () => {
      await jest.advanceTimersByTimeAsync(15_000);
    });
    expect(getDiscoveryContext).toHaveBeenCalledTimes(requestsBefore + 1);
  } finally {
    view.unmount();
    view.client.clear();
    jest.useRealTimers();
    subscription.mockRestore();
  }
});
