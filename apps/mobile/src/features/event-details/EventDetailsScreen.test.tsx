import { act, render, waitFor, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EventDetailsScreen } from './EventDetailsScreen';
import { SavedContext } from '../../data/saved-context';
import { createSavedStore } from '../../data/saved-store';
import { summarySnapshot } from '../../domain/saved-event';
import { context, page } from '../../test/discovery-fixtures';
// Query boundary performs a real runtime-validated request with controlled transport.
const ctx = context();
const snapshot = summarySnapshot(
  page({ areaId: 'coacalco', context: 'x', date: 'default' }).items[0]!,
  ctx.area,
  ctx.demo,
);
const fetchMock = jest.fn();
globalThis.fetch = fetchMock;
test('offline saved summary remains usable, and save failure does not erase it', async () => {
  fetchMock.mockRejectedValue(new Error('offline'));
  const store = createSavedStore({
    initialize: async () => {},
    read: async () => [
      { id: snapshot.event.id, snapshot: JSON.stringify(snapshot) },
    ],
    write: async () => {
      throw new Error('full');
    },
  });
  await store.hydrate();
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <SavedContext.Provider value={store}>
        <EventDetailsScreen id={snapshot.event.id} onBack={jest.fn()} />
      </SavedContext.Provider>
    </QueryClientProvider>,
  );
  await waitFor(() =>
    expect(view.getByText(/Could not refresh event details/)).toBeTruthy(),
  );
  expect(view.getByText(/Summary saved or viewed/)).toBeTruthy();
  expect(view.queryByText('Open demo page')).toBeNull();
  fireEvent.press(view.getByRole('button', { name: 'Remove one from Saved' }));
  await act(() => store.settled());
  expect(
    view.getByRole('button', { name: 'Remove one from Saved' }),
  ).toBeTruthy();
  expect(view.getByText(/could not be stored/)).toBeTruthy();
  view.unmount();
  client.clear();
});
test('unknown unsaved event has distinct recovery and initial structured loading', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 404 });
  const store = createSavedStore({
    initialize: async () => {},
    read: async () => [],
    write: async () => {},
  });
  await store.hydrate();
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const back = jest.fn();
  const view = render(
    <QueryClientProvider client={client}>
      <SavedContext.Provider value={store}>
        <EventDetailsScreen id="unknown" onBack={back} />
      </SavedContext.Provider>
    </QueryClientProvider>,
  );
  expect(
    view.getByRole('progressbar', { name: 'Loading event details' }),
  ).toBeTruthy();
  await waitFor(() =>
    expect(view.getByText(/no longer available in the catalog/)).toBeTruthy(),
  );
  fireEvent.press(view.getByRole('button', { name: 'Back' }));
  expect(back).toHaveBeenCalled();
  view.unmount();
  client.clear();
});

test('reopening details uses the newer Saved snapshot over a still-fresh older query cache', async () => {
  const details = {
    endsAt: null,
    address: null,
    description: 'Earlier event information',
    externalUrl: null,
  };
  const earlier = {
    ...snapshot,
    details,
    refreshedAt: '2026-09-18T12:00:00.000Z',
  };
  const latest = {
    ...earlier,
    details: { ...details, description: 'Latest event information' },
    refreshedAt: '2026-09-18T12:00:20.000Z',
  };
  const store = createSavedStore({
    initialize: async () => {},
    read: async () => [
      { id: snapshot.event.id, snapshot: JSON.stringify(latest) },
    ],
    write: async () => {},
  });
  await store.hydrate();
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  client.setQueryData(['event-details', snapshot.event.id], earlier);
  const view = render(
    <QueryClientProvider client={client}>
      <SavedContext.Provider value={store}>
        <EventDetailsScreen id={snapshot.event.id} onBack={jest.fn()} />
      </SavedContext.Provider>
    </QueryClientProvider>,
  );
  try {
    expect(view.getByText('Latest event information')).toBeTruthy();
    expect(view.queryByText('Earlier event information')).toBeNull();
  } finally {
    view.unmount();
    client.clear();
  }
});

test.each([404, 503])(
  'failed refresh (%i) retains newer Saved content and its truthful freshness',
  async (status) => {
    const details = {
      endsAt: null,
      address: null,
      description: 'Old cached content',
      externalUrl: null,
    };
    const earlier = {
      ...snapshot,
      details,
      refreshedAt: '2026-09-18T12:00:00.000Z',
    };
    const latest = {
      ...earlier,
      details: { ...details, description: 'Newer saved content' },
      refreshedAt: '2026-09-18T12:00:20.000Z',
    };
    const store = createSavedStore({
      initialize: async () => {},
      read: async () => [
        { id: snapshot.event.id, snapshot: JSON.stringify(latest) },
      ],
      write: async () => {},
    });
    await store.hydrate();
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    client.setQueryData(['event-details', snapshot.event.id], earlier, {
      updatedAt: Date.now() - 61_000,
    });
    fetchMock.mockResolvedValue({ ok: false, status });
    const view = render(
      <QueryClientProvider client={client}>
        <SavedContext.Provider value={store}>
          <EventDetailsScreen id={snapshot.event.id} onBack={jest.fn()} />
        </SavedContext.Provider>
      </QueryClientProvider>,
    );
    try {
      await waitFor(() =>
        expect(
          view.getByText(
            status === 404
              ? /Current details are unavailable/
              : /Could not refresh event details/,
          ),
        ).toBeTruthy(),
      );
      expect(view.getByText('Newer saved content')).toBeTruthy();
      expect(view.queryByText('Old cached content')).toBeNull();
      expect(view.getByText(/Last-known details/).props.children).toContain(
        new Date(latest.refreshedAt).toLocaleString(),
      );
      expect(store.getSnapshot().entries[snapshot.event.id]).toEqual(latest);
    } finally {
      view.unmount();
      client.clear();
    }
  },
);

test.each([
  [
    'short multiline',
    'Line one\nLine two\nLine three\nLine four\nLine five\nLine six',
    false,
  ],
  [
    'long',
    'A detailed description with enough useful event information. '.repeat(6),
    true,
  ],
] as const)(
  '%s descriptions are fully reachable and long descriptions still expand/collapse',
  async (_name, description, expandable) => {
    const full = {
      ...snapshot,
      details: { endsAt: null, address: null, description, externalUrl: null },
      refreshedAt: '2026-09-18T12:00:00.000Z',
    };
    const store = createSavedStore({
      initialize: async () => {},
      read: async () => [
        { id: snapshot.event.id, snapshot: JSON.stringify(full) },
      ],
      write: async () => {},
    });
    await store.hydrate();
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    client.setQueryData(['event-details', snapshot.event.id], full);
    const view = render(
      <QueryClientProvider client={client}>
        <SavedContext.Provider value={store}>
          <EventDetailsScreen id={snapshot.event.id} onBack={jest.fn()} />
        </SavedContext.Provider>
      </QueryClientProvider>,
    );
    try {
      expect(view.getByText(description).props.numberOfLines).toBe(
        expandable ? 5 : undefined,
      );
      if (expandable) {
        fireEvent.press(view.getByRole('button', { name: 'Show more' }));
        expect(view.getByText(description).props.numberOfLines).toBeUndefined();
        fireEvent.press(view.getByRole('button', { name: 'Show less' }));
        expect(view.getByText(description).props.numberOfLines).toBe(5);
        expect(view.getByRole('button', { name: 'Show more' })).toBeTruthy();
      } else {
        expect(view.queryByRole('button', { name: 'Show more' })).toBeNull();
        expect(view.getByText(description).props.children).toContain(
          'Line six',
        );
      }
    } finally {
      view.unmount();
      client.clear();
    }
  },
);
