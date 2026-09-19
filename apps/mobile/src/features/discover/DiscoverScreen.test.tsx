import { fireEvent, render } from '@testing-library/react-native';
import type { DiscoverySession } from '../../data/discovery-session';
import { context } from '../../test/discovery-fixtures';
import { DiscoverScreen } from './DiscoverScreen';
jest.mock('./DiscoverySection', () => ({
  DiscoverySection: ({ title }: { title: string }) => {
    const { Text } = jest.requireActual('react-native');
    return <Text>{title}</Text>;
  },
}));
const data: DiscoverySession = {
  areas: [],
  areasLoading: false,
  areasError: null,
  retryAreas: jest.fn(),
  selectedArea: context().area,
  hydrating: false,
  persistenceError: null,
  selectArea: jest.fn(),
  retryPersistence: jest.fn(),
  date: 'default',
  setDate: jest.fn(),
  context: context(),
  contextError: null,
  contextLoading: false,
  refreshing: false,
  refresh: jest.fn(),
  isOffline: false,
};
test('default includes temporal collections and category route inherits full date/area/generation', () => {
  const open = jest.fn();
  const view = render(
    <DiscoverScreen data={data} onChangeArea={jest.fn()} onOpen={open} />,
  );
  expect(view.getByText('Happening Today')).toBeTruthy();
  expect(view.getByText('Demo events')).toBeTruthy();
  fireEvent.press(view.getByRole('button', { name: 'Browse Art' }));
  expect(open).toHaveBeenCalledWith({
    areaId: 'coacalco',
    date: 'default',
    context: 'generation',
    category: 'art',
  });
});
test('active date hides temporal collections, keeps general results and resets without changing area', () => {
  const view = render(
    <DiscoverScreen
      data={{ ...data, date: 'today' }}
      onChangeArea={jest.fn()}
      onOpen={jest.fn()}
    />,
  );
  expect(view.queryByText('Happening Today')).toBeNull();
  expect(view.getAllByText('This Weekend')).toHaveLength(1); // date chip only
  expect(view.getByText('All events')).toBeTruthy();
  expect(view.getByText('Free Events')).toBeTruthy();
  expect(
    view.getByRole('button', { name: 'Date: Today' }).props.accessibilityState
      .selected,
  ).toBe(true);
  fireEvent.press(view.getByRole('button', { name: 'Reset date to upcoming' }));
  expect(data.setDate).toHaveBeenCalledWith('default');
  expect(data.selectArea).not.toHaveBeenCalled();
});
test('context outage is recoverable and not mislabeled offline', () => {
  const view = render(
    <DiscoverScreen
      data={{
        ...data,
        context: undefined,
        contextError: 'Catalog unavailable',
      }}
      onChangeArea={jest.fn()}
      onOpen={jest.fn()}
    />,
  );
  expect(view.getByText('Catalog unavailable')).toBeTruthy();
  expect(view.queryByText(/You’re offline/)).toBeNull();
  fireEvent.press(view.getByRole('button', { name: 'Try again' }));
  expect(data.refresh).toHaveBeenCalled();
});
test('initial context loading preserves event-card structure and announces one busy region', () => {
  const view = render(
    <DiscoverScreen
      data={{ ...data, context: undefined, contextLoading: true }}
      onChangeArea={jest.fn()}
      onOpen={jest.fn()}
    />,
  );
  expect(
    view.getByRole('progressbar', { name: 'Preparing discovery' }).props
      .accessibilityState.busy,
  ).toBe(true);
  expect(
    view.getAllByTestId('event-card-placeholder', {
      includeHiddenElements: true,
    }),
  ).toHaveLength(2);
  expect(
    view.getAllByTestId('event-image-placeholder', {
      includeHiddenElements: true,
    }),
  ).toHaveLength(2);
  expect(
    view.getAllByTestId('event-title-placeholder', {
      includeHiddenElements: true,
    }),
  ).toHaveLength(2);
  expect(
    view.getAllByTestId('event-metadata-placeholder', {
      includeHiddenElements: true,
    }),
  ).toHaveLength(2);
  expect(view.queryByText(/No events match/)).toBeNull();
});
