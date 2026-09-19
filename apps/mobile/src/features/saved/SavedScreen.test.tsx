import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { SavedScreen } from './SavedScreen';
import { SavedContext } from '../../data/saved-context';
import { createSavedStore } from '../../data/saved-store';
import { summarySnapshot } from '../../domain/saved-event';
import { context, page } from '../../test/discovery-fixtures';
import { getEventDetails } from '../../data/event-details';
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn() }),
}));
jest.mock('../../data/event-details', () => ({
  ...jest.requireActual('../../data/event-details'),
  getEventDetails: jest.fn(),
}));
const ctx = context();
const base = summarySnapshot(
  page({ areaId: 'coacalco', context: 'x', date: 'default' }, 'Undated')
    .items[0]!,
  ctx.area,
  ctx.demo,
);
const old = {
  ...base,
  event: {
    ...base.event,
    id: 'old',
    title: 'Older event',
    schedule: {
      kind: 'date-only' as const,
      date: '2020-01-01',
      timezone: 'America/Mexico_City' as const,
    },
  },
};
const recent = {
  ...old,
  event: {
    ...old.event,
    id: 'recent',
    title: 'Recent past event',
    schedule: { ...old.event.schedule, date: '2020-02-01' },
  },
};
test('cold hydrated Saved groups undated Upcoming and recent-first Past without area/API dependency', async () => {
  const store = createSavedStore({
    initialize: async () => {},
    read: async () =>
      [base, old, recent].map((s) => ({
        id: s.event.id,
        snapshot: JSON.stringify(s),
      })),
    write: async () => {},
  });
  await store.hydrate();
  const view = render(
    <SavedContext.Provider value={store}>
      <SavedScreen />
    </SavedContext.Provider>,
  );
  expect(
    view.getByRole('header', { name: 'Date to be announced' }),
  ).toBeTruthy();
  expect(view.getByText('Undated')).toBeTruthy();
  expect(view.queryByText('Older event')).toBeNull();
  expect(getEventDetails).not.toHaveBeenCalled();
  fireEvent.press(view.getByRole('button', { name: 'Past' }));
  expect(view.queryByText('Undated')).toBeNull();
  const cards = view.getAllByRole('button', { name: /^Open / });
  expect(cards.map((c) => c.props.accessibilityLabel)).toEqual([
    'Open Recent past event',
    'Open Older event',
  ]);
  fireEvent.press(
    view.getByRole('button', { name: 'Remove Recent past event from Saved' }),
  );
  expect(view.queryByText('Recent past event')).toBeNull();
  await act(() => store.settled());
  view.unmount();
});
test('refresh in flight cannot restore an event removed from Saved', async () => {
  const store = createSavedStore({
    initialize: async () => {},
    read: async () => [{ id: base.event.id, snapshot: JSON.stringify(base) }],
    write: async () => {},
  });
  await store.hydrate();
  let resolve!: (value: Awaited<ReturnType<typeof getEventDetails>>) => void;
  jest.mocked(getEventDetails).mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const view = render(
    <SavedContext.Provider value={store}>
      <SavedScreen />
    </SavedContext.Provider>,
  );
  fireEvent.press(view.getByRole('button', { name: 'Refresh saved details' }));
  await waitFor(() => expect(getEventDetails).toHaveBeenCalled());
  fireEvent.press(
    view.getByRole('button', { name: 'Remove Undated from Saved' }),
  );
  await act(async () =>
    resolve({
      event: base.event,
      area: base.area,
      demo: base.demo,
      details: {
        endsAt: null,
        description: 'Fresh',
        address: null,
        externalUrl: null,
      },
    }),
  );
  expect(
    view.getByText(
      'Keep something to look forward to. Save events as you explore.',
    ),
  ).toBeTruthy();
  expect(store.getSnapshot().entries[base.event.id]).toBeUndefined();
  view.unmount();
});
