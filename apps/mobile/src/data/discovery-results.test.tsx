import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import {
  useDiscoveryList,
  useDiscoveryPreview,
  useDiscoveryRefresh,
} from './discovery-results';
import {
  getDiscoveryEvents,
  getDiscoveryContext,
  type DiscoveryScope,
} from './discovery-catalog';
import { page, context } from '../test/discovery-fixtures';
jest.mock('./discovery-catalog', () => ({
  ...jest.requireActual('./discovery-catalog'),
  getDiscoveryEvents: jest.fn(),
  getDiscoveryContext: jest.fn(),
}));
const scope: DiscoveryScope = {
  areaId: 'coacalco',
  context: 'generation',
  date: 'default',
};
function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}
beforeEach(() => jest.clearAllMocks());
test('preview-to-list starts at first event and pagination failure preserves rows for retry', async () => {
  jest
    .mocked(getDiscoveryEvents)
    .mockImplementation(async (s, cursor) =>
      page(s, cursor ? 'two' : 'one', cursor ? null : 'next'),
    );
  const { client, wrapper } = setup();
  const preview = renderHook(() => useDiscoveryPreview(scope), { wrapper });
  await waitFor(() =>
    expect(preview.result.current.data?.items[0]?.id).toBe('one'),
  );
  const list = renderHook(() => useDiscoveryList(scope), { wrapper });
  await waitFor(() => expect(list.result.current.items[0]?.id).toBe('one'));
  expect(getDiscoveryEvents).toHaveBeenCalledWith(
    scope,
    null,
    6,
    expect.anything(),
  );
  jest
    .mocked(getDiscoveryEvents)
    .mockRejectedValueOnce(new Error('Network interrupted'));
  await act(async () => {
    await list.result.current.fetchNextPage();
  });
  await waitFor(() =>
    expect(list.result.current.isFetchNextPageError).toBe(true),
  );
  expect(list.result.current.items.map((item) => item.id)).toEqual(['one']);
  await act(async () => {
    await list.result.current.fetchNextPage();
  });
  await waitFor(() =>
    expect(list.result.current.items.map((item) => item.id)).toEqual([
      'one',
      'two',
    ]),
  );
  preview.unmount();
  list.unmount();
  client.clear();
});
test('a failed new-generation section retains old content and identifies its stale snapshot', async () => {
  jest.mocked(getDiscoveryEvents).mockImplementation(async (s) => page(s));
  const { client, wrapper } = setup();
  const view = renderHook(
    (props: DiscoveryScope) => useDiscoveryPreview(props),
    { wrapper, initialProps: scope },
  );
  await waitFor(() => expect(view.result.current.data?.items).toHaveLength(1));
  jest
    .mocked(getDiscoveryEvents)
    .mockRejectedValueOnce(new Error('Section unavailable'));
  view.rerender({ ...scope, context: 'fresh' });
  await waitFor(() =>
    expect(view.result.current.message).toBe('Section unavailable'),
  );
  expect(view.result.current.data?.context.token).toBe('generation');
  expect(view.result.current.stale).toBe(true);
  await act(async () => {
    await view.result.current.refetch();
  });
  await waitFor(() =>
    expect(view.result.current.data?.context.token).toBe('fresh'),
  );
  expect(view.result.current.stale).toBe(false);
  view.unmount();
  client.clear();
});
test('changing filter while a request is pending never borrows old filter content', async () => {
  jest
    .mocked(getDiscoveryEvents)
    .mockImplementation(async (s) => page(s, 'old-filter'));
  const { client, wrapper } = setup();
  const view = renderHook((props: DiscoveryScope) => useDiscoveryList(props), {
    wrapper,
    initialProps: scope,
  });
  await waitFor(() => expect(view.result.current.items).toHaveLength(1));
  jest
    .mocked(getDiscoveryEvents)
    .mockImplementation(() => new Promise(() => {}));
  view.rerender({ ...scope, date: 'tomorrow' });
  expect(view.result.current.items).toHaveLength(0);
  expect(view.result.current.isPending).toBe(true);
  view.unmount();
  client.clear();
});

test('child refresh renews the shared parent generation, and a failure retains the prior context', async () => {
  const { client, wrapper } = setup();
  client.setQueryData(['discovery-context', 'coacalco'], context());
  jest
    .mocked(getDiscoveryContext)
    .mockResolvedValueOnce(context('coacalco', 'renewed'));
  const view = renderHook(() => useDiscoveryRefresh('coacalco'), { wrapper });
  await act(async () => {
    await view.result.current.refresh();
  });
  expect(client.getQueryData(['discovery-context', 'coacalco'])).toMatchObject({
    context: { token: 'renewed' },
  });
  jest
    .mocked(getDiscoveryContext)
    .mockRejectedValueOnce(new Error('Interrupted'));
  await act(async () => {
    await view.result.current.refresh();
  });
  expect(view.result.current.error).toBe('Interrupted');
  expect(client.getQueryData(['discovery-context', 'coacalco'])).toMatchObject({
    context: { token: 'renewed' },
  });
  view.unmount();
  client.clear();
});
