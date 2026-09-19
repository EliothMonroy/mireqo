import { parseSnapshot, type EventSnapshot } from '../domain/saved-event';
export interface SavedStorage {
  initialize(): Promise<void>;
  read(): Promise<{ id: string; snapshot: string }[]>;
  write(id: string, value: EventSnapshot | null): Promise<void>;
}
export type SavedState = {
  ready: boolean;
  entries: Readonly<Record<string, EventSnapshot>>;
  error: string | null;
};
export function createSavedStore(storage: SavedStorage) {
  // Catalog IDs are data, including strings that match Object.prototype keys.
  const emptyEntries = () =>
    Object.create(null) as Record<string, EventSnapshot>;
  let state: SavedState = {
    ready: false,
    entries: emptyEntries(),
    error: null,
  };
  const listeners = new Set<() => void>();
  const revisions = new Map<string, number>();
  const confirmed = new Map<string, EventSnapshot>();
  // Membership removal must not downgrade known details if the user saves again.
  const known = new Map<string, EventSnapshot>();
  const remember = (snapshot: EventSnapshot) => {
    const previous = known.get(snapshot.event.id);
    const best =
      previous?.details &&
      (!snapshot.details || previous.refreshedAt! > snapshot.refreshedAt!)
        ? previous
        : snapshot;
    known.set(snapshot.event.id, best);
    return best;
  };
  const failed = new Map<string, EventSnapshot | null>();
  let chain = Promise.resolve();
  let hydration: Promise<void> | undefined;
  const publish = (next: SavedState) => {
    state = next;
    listeners.forEach((fn) => fn());
  };
  const replace = (id: string, value: EventSnapshot | null) => {
    const entries = Object.assign(emptyEntries(), state.entries);
    if (value) entries[id] = value;
    else delete entries[id];
    return entries;
  };
  function enqueue(id: string, value: EventSnapshot | null, version: number) {
    chain = chain.then(async () => {
      try {
        await storage.write(id, value);
        if (value) confirmed.set(id, value);
        else confirmed.delete(id);
        if (revisions.get(id) === version) {
          failed.delete(id);
          publish({
            ...state,
            error: failed.size
              ? 'Some saved changes could not be stored. Retry saving.'
              : null,
          });
        }
      } catch {
        if (revisions.get(id) === version) {
          failed.set(id, value);
          publish({
            ...state,
            entries: replace(id, confirmed.get(id) ?? null),
            error: 'Your saved change could not be stored. Retry saving.',
          });
        }
      }
    });
  }
  const store = {
    getSnapshot: () => state,
    subscribe: (fn: () => void) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    hydrate() {
      if (hydration) return hydration;
      hydration = (async () => {
        try {
          await storage.initialize();
          const rows = await storage.read();
          const entries = emptyEntries();
          for (const row of rows) {
            const snapshot = parseSnapshot(row.snapshot);
            if (snapshot.event.id !== row.id)
              throw new Error('Identity mismatch');
            entries[row.id] = remember(snapshot);
          }
          confirmed.clear();
          Object.entries(entries).forEach(([id, s]) => confirmed.set(id, s));
          publish({ ready: true, entries, error: null });
        } catch {
          publish({
            ...state,
            ready: false,
            error: 'Saved events could not be restored. Retry loading.',
          });
        } finally {
          hydration = undefined;
        }
      })();
      return hydration;
    },
    toggle(snapshot: EventSnapshot) {
      if (!state.ready) return;
      const id = snapshot.event.id;
      const value = state.entries[id] ? null : remember(snapshot);
      const version = (revisions.get(id) ?? 0) + 1;
      revisions.set(id, version);
      failed.delete(id);
      publish({
        ...state,
        entries: replace(id, value),
        error: failed.size ? state.error : null,
      });
      enqueue(id, value, version);
    },
    revision: (id: string) => revisions.get(id) ?? 0,
    enrich(snapshot: EventSnapshot, expectedRevision: number) {
      const id = snapshot.event.id;
      const current = state.entries[id];
      if (
        !current ||
        (revisions.get(id) !== undefined &&
          revisions.get(id) !== expectedRevision) ||
        !snapshot.details
      )
        return;
      if (current.refreshedAt && snapshot.refreshedAt! <= current.refreshedAt)
        return;
      const version = (revisions.get(id) ?? 0) + 1;
      revisions.set(id, version);
      remember(snapshot);
      publish({ ...state, entries: replace(id, snapshot) });
      enqueue(id, snapshot, version);
    },
    retry() {
      if (!state.ready) {
        void store.hydrate();
        return;
      }
      for (const [id, value] of failed) {
        const version = (revisions.get(id) ?? 0) + 1;
        revisions.set(id, version);
        publish({ ...state, entries: replace(id, value) });
        enqueue(id, value, version);
      }
    },
    settled: () => chain,
  };
  return store;
}
export type SavedStore = ReturnType<typeof createSavedStore>;
