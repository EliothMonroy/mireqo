import { getAreas, getEvents, request } from './catalog';
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

test('native transport and response-body errors become friendly recoverable failures', async () => {
  const native = new Error(
    'java.io.IOException: unexpected end of stream on http://127.0.0.1:3000/private',
  );
  globalThis.fetch = jest.fn(async () => {
    throw native;
  }) as unknown as typeof fetch;
  await expect(getAreas()).rejects.toMatchObject({
    code: 'UNAVAILABLE',
    message: 'We could not reach the event catalog. Please try again.',
  });
  globalThis.fetch = jest.fn(async () => ({
    ok: true,
    json: async () => {
      throw native;
    },
  })) as unknown as typeof fetch;
  await expect(request('/v1/areas')).rejects.toMatchObject({
    code: 'UNAVAILABLE',
    message: 'We could not reach the event catalog. Please try again.',
  });
});
test('normalization preserves HTTP distinctions and cancellation identity', async () => {
  for (const [status, code] of [
    [400, 'INVALID_REQUEST'],
    [404, 'NOT_FOUND'],
    [503, 'UNAVAILABLE'],
  ] as const) {
    globalThis.fetch = jest.fn(async () => ({
      ok: false,
      status,
    })) as unknown as typeof fetch;
    await expect(request('/v1/events/missing')).rejects.toMatchObject({ code });
  }
  const abort = new Error('Aborted');
  abort.name = 'AbortError';
  globalThis.fetch = jest.fn(async () => {
    throw abort;
  }) as unknown as typeof fetch;
  await expect(getAreas()).rejects.toBe(abort);
  const controller = new AbortController();
  controller.abort();
  const native = new Error('native cancelled');
  globalThis.fetch = jest.fn(async () => {
    throw native;
  }) as unknown as typeof fetch;
  await expect(getAreas(controller.signal)).rejects.toBe(native);
});
