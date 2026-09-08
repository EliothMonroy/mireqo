import { fireEvent, render } from '@testing-library/react-native';
import type { DiscoverData } from '../../data/discover';
import { DiscoverScreen } from './DiscoverScreen';
const data: DiscoverData = {
  areas: [],
  areasLoading: false,
  areasError: null,
  retryAreas: jest.fn(),
  selectedArea: {
    id: 'coacalco',
    name: 'Coacalco',
    administrativeContext: 'Estado de México',
    kind: 'municipality',
    country: 'MX',
    timezone: 'America/Mexico_City',
  },
  hydrating: false,
  persistenceError: null,
  selectArea: jest.fn(),
  retryPersistence: jest.fn(),
  events: [],
  demo: undefined,
  initialLoading: false,
  error: null,
  refreshing: false,
  refresh: jest.fn(),
  loadingMore: false,
  loadMore: jest.fn(),
  hasMore: false,
  paginationError: null,
  isOffline: false,
};
test('empty list offers real change-area and refresh actions with visible demo provenance', () => {
  const change = jest.fn();
  const view = render(<DiscoverScreen data={data} onChangeArea={change} />);
  expect(view.getByText('Demo events')).toBeTruthy();
  fireEvent.press(view.getByRole('button', { name: 'Change area' }));
  expect(change).toHaveBeenCalled();
  fireEvent.press(view.getByRole('button', { name: 'Refresh events' }));
  expect(data.refresh).toHaveBeenCalled();
});
test('first-load failure shows retry, never falsely labels backend outage offline', () => {
  const view = render(
    <DiscoverScreen
      data={{ ...data, error: 'Catalog unavailable' }}
      onChangeArea={jest.fn()}
    />,
  );
  expect(view.getByText('Catalog unavailable')).toBeTruthy();
  expect(view.queryByText(/You’re offline/)).toBeNull();
  fireEvent.press(view.getByRole('button', { name: 'Try again' }));
  expect(data.refresh).toHaveBeenCalled();
});
