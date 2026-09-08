import { getAreas, getEvents } from './catalog';
const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});
test('passes AbortSignal and rejects invalid remote responses instead of synthesizing data', async () => {
  const controller = new AbortController();
  globalThis.fetch = jest.fn(async () => ({
    ok: true,
    json: async () => ({ items: [{ id: 'fabricated' }] }),
  })) as unknown as typeof fetch;
  await expect(getAreas(controller.signal)).rejects.toThrow();
  expect(globalThis.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/v1/areas'),
    { signal: controller.signal },
  );
});
test('an outage is recoverable and cannot become a local fake event list', async () => {
  globalThis.fetch = jest.fn(async () => ({
    ok: false,
    status: 503,
  })) as unknown as typeof fetch;
  await expect(getEvents('coacalco', null)).rejects.toThrow('could not reach');
});
test('cursor errors ask for a refresh', async () => {
  globalThis.fetch = jest.fn(async () => ({
    ok: false,
    status: 400,
  })) as unknown as typeof fetch;
  await expect(getEvents('coacalco', 'stale')).rejects.toThrow('Refresh');
});
