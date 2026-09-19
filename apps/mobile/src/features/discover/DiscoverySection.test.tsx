import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View } from 'react-native';
import { DiscoverySection } from './DiscoverySection';
import {
  getDiscoveryEvents,
  type DiscoveryScope,
} from '../../data/discovery-catalog';
import { page } from '../../test/discovery-fixtures';
jest.mock('../../data/discovery-catalog', () => ({
  ...jest.requireActual('../../data/discovery-catalog'),
  getDiscoveryEvents: jest.fn(),
}));
const scope: DiscoveryScope = {
  areaId: 'coacalco',
  context: 'generation',
  date: 'today',
};
test('partial failure keeps successful section visible with scoped retry; empty success is omitted', async () => {
  jest.mocked(getDiscoveryEvents).mockImplementation(async (s) => {
    if (s.collection === 'music')
      throw new Error('Music temporarily unavailable');
    return page(s, 'Free concert', 'more');
  });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const open = jest.fn();
  const view = render(
    <QueryClientProvider client={client}>
      <View>
        {(['free', 'music'] as const).map((collection) => (
          <DiscoverySection
            key={collection}
            scope={{ ...scope, collection }}
            title={collection === 'free' ? 'Free Events' : 'Music'}
            onOpen={open}
            onRestart={jest.fn()}
            onEmptyRecovery={jest.fn()}
          />
        ))}
      </View>
    </QueryClientProvider>,
  );
  await waitFor(() => expect(view.getByText('Free concert')).toBeTruthy());
  expect(view.getByText('Music temporarily unavailable')).toBeTruthy();
  fireEvent.press(view.getByRole('button', { name: 'See all free events' }));
  expect(open).toHaveBeenCalledWith({ ...scope, collection: 'free' });
  jest.mocked(getDiscoveryEvents).mockImplementation(async (s) => ({
    ...page(s),
    items: [],
    nextCursor: null,
  }));
  fireEvent.press(view.getByRole('button', { name: 'Retry music' }));
  await waitFor(() => expect(view.queryByText('Music')).toBeNull());
  expect(view.getByText('Free concert')).toBeTruthy();
  expect(view.queryByRole('button', { name: 'See all music' })).toBeNull();
  view.unmount();
  client.clear();
});
test('pending preview uses event placeholders that are replaced by loaded cards', async () => {
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
      <DiscoverySection
        scope={scope}
        title="Free Events"
        onOpen={jest.fn()}
        onRestart={jest.fn()}
        onEmptyRecovery={jest.fn()}
      />
    </QueryClientProvider>,
  );
  expect(
    view.getByRole('progressbar', { name: 'Loading free events' }),
  ).toBeTruthy();
  expect(
    view.getAllByTestId('event-card-placeholder', {
      includeHiddenElements: true,
    }),
  ).toHaveLength(2);
  finish(page(scope, 'Loaded event'));
  await waitFor(() => expect(view.getByText('Loaded event')).toBeTruthy());
  expect(
    view.queryByTestId('event-card-placeholder', {
      includeHiddenElements: true,
    }),
  ).toBeNull();
  expect(view.queryByRole('progressbar')).toBeNull();
  view.unmount();
  client.clear();
});
