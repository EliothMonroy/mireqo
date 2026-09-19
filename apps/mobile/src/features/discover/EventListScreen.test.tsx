import { SavedContext } from '../../data/saved-context';
import { createSavedStore } from '../../data/saved-store';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EventListScreen } from './EventListScreen';
import {
  getDiscoveryEvents,
  getDiscoveryContext,
  type DiscoveryScope,
} from '../../data/discovery-catalog';
import { useDiscoverySession } from '../../data/discovery-session';
import { context, page, areas } from '../../test/discovery-fixtures';
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
const savedStore = createSavedStore({
  initialize: async () => {},
  read: async () => [],
  write: async () => {},
});
jest.mock('../../data/discovery-catalog', () => ({
  ...jest.requireActual('../../data/discovery-catalog'),
  getDiscoveryEvents: jest.fn(),
  getDiscoveryContext: jest.fn(),
}));
jest.mock('../../data/discovery-session', () => ({
  ...jest.requireActual('../../data/discovery-session'),
  useDiscoverySession: jest.fn(),
}));
const scope: DiscoveryScope = {
  areaId: 'coacalco',
  context: 'generation',
  date: 'default',
};
test('first page has structured placeholders; pagination and refresh retain real cards without replacing them', async () => {
  jest
    .mocked(useDiscoverySession)
    .mockReturnValue({ context: context(), areas } as ReturnType<
      typeof useDiscoverySession
    >);
  let finish!: (result: ReturnType<typeof page>) => void;
  jest.mocked(getDiscoveryEvents).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <SavedContext.Provider value={savedStore}>
        <EventListScreen initialScope={scope} onBack={jest.fn()} />
      </SavedContext.Provider>
    </QueryClientProvider>,
  );
  expect(
    view.getByRole('progressbar', { name: 'Loading events' }),
  ).toBeTruthy();
  expect(
    view.getAllByTestId('event-card-placeholder', {
      includeHiddenElements: true,
    }),
  ).toHaveLength(2);
  await act(async () => finish(page(scope, 'First event', 'more')));
  await waitFor(() => expect(view.getByText('First event')).toBeTruthy());
  expect(
    view.queryByTestId('event-card-placeholder', {
      includeHiddenElements: true,
    }),
  ).toBeNull();
  fireEvent.press(view.getByRole('button', { name: 'Load more events' }));
  await waitFor(() =>
    expect(view.getByLabelText('Loading more events')).toBeTruthy(),
  );
  expect(view.getByText('First event')).toBeTruthy();
  expect(
    view.queryByTestId('event-card-placeholder', {
      includeHiddenElements: true,
    }),
  ).toBeNull();
  await act(async () => finish(page(scope, 'Second event')));
  await waitFor(() => expect(view.getByText('Second event')).toBeTruthy());
  jest
    .mocked(getDiscoveryContext)
    .mockImplementation(() => new Promise(() => {}));
  fireEvent.press(view.getByRole('button', { name: 'Refresh events' }));
  await waitFor(() => expect(getDiscoveryContext).toHaveBeenCalled());
  expect(view.getByText('First event')).toBeTruthy();
  expect(view.getByText('Second event')).toBeTruthy();
  expect(
    view.queryByTestId('event-card-placeholder', {
      includeHiddenElements: true,
    }),
  ).toBeNull();
  view.unmount();
  client.clear();
});
