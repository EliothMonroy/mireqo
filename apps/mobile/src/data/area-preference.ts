export interface AreaPreferenceStorage {
  initialize(): Promise<void>;
  read(): Promise<string | null>;
  write(areaId: string): Promise<void>;
}
export interface AreaPreferenceState {
  areaId: string | null;
  hydrating: boolean;
  error: string | null;
}

/** Serializes disk writes while keeping the newest user intent visible. */
export function createAreaPreference(storage: AreaPreferenceStorage) {
  let state: AreaPreferenceState = {
    areaId: null,
    hydrating: true,
    error: null,
  };
  let hydrated = false;
  let hydration: Promise<void> | undefined;
  let revision = 0;
  let writes = Promise.resolve();
  const listeners = new Set<() => void>();
  function publish(next: AreaPreferenceState) {
    state = next;
    listeners.forEach((listener) => listener());
  }
  async function hydrate() {
    if (hydrated) return;
    if (hydration) return hydration;
    publish({ ...state, hydrating: true, error: null });
    hydration = (async () => {
      try {
        await storage.initialize();
        const areaId = await storage.read();
        hydrated = true;
        publish({ areaId, hydrating: false, error: null });
      } catch {
        publish({
          ...state,
          hydrating: false,
          error:
            'Your area could not be restored. Try again to open local preferences.',
        });
      } finally {
        hydration = undefined;
      }
    })();
    return hydration;
  }
  function select(areaId: string) {
    if (!hydrated) return;
    const intent = ++revision;
    publish({ areaId, hydrating: false, error: null });
    writes = writes.then(async () => {
      try {
        await storage.write(areaId);
        if (intent === revision) publish({ ...state, error: null });
      } catch {
        if (intent === revision)
          publish({
            ...state,
            error:
              'Your area changed, but could not be saved for next time. Retry saving.',
          });
      }
    });
  }
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    hydrate,
    select,
    retry() {
      if (!hydrated) void hydrate();
      else if (state.areaId) select(state.areaId);
    },
    // Useful for lifecycle coordination and deterministic persistence verification.
    settled: () => writes,
  };
}
export type AreaPreference = ReturnType<typeof createAreaPreference>;
