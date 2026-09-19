import {
  getDiscoveryContext,
  getDiscoveryEvents,
  discoveryKey,
} from './discovery-catalog';
import { context, page } from '../test/discovery-fixtures';
const originalFetch = globalThis.fetch;
const scope = {
  areaId: 'coacalco',
  context: 'generation',
  date: 'today' as const,
  category: 'art' as const,
};
afterEach(() => {
  globalThis.fetch = originalFetch;
});
function response(value: unknown) {
  globalThis.fetch = jest.fn(async () => ({
    ok: true,
    json: async () => value,
  })) as unknown as typeof fetch;
}
test('validates effective context and area instead of accepting malformed responses', async () => {
  response(context('tultitlan'));
  await expect(getDiscoveryContext('coacalco')).rejects.toThrow(
    'area mismatch',
  );
  response({
    ...context(),
    context: { ...context().context, localDate: '2026-09-19' },
  });
  await expect(getDiscoveryContext('coacalco')).rejects.toThrow('context');
});
test('passes full filter context and cancellation, rejecting mismatched response identities', async () => {
  const signal = new AbortController().signal;
  response(page(scope));
  await expect(
    getDiscoveryEvents(scope, null, 2, signal),
  ).resolves.toMatchObject({ filters: { category: 'art', date: 'today' } });
  expect(globalThis.fetch).toHaveBeenCalledWith(
    expect.stringContaining(
      'context=generation&date=today&category=art&limit=2',
    ),
    { signal },
  );
  for (const override of [
    { context: 'other' },
    { date: 'tomorrow' as const },
    { category: 'music' as const },
  ]) {
    response(page({ ...scope, ...override }));
    await expect(getDiscoveryEvents(scope, null, 2)).rejects.toThrow(
      'context mismatch',
    );
  }
});
test('query identities include every scope and distinguish preview from full list', () => {
  const baseline = discoveryKey(scope, 'preview');
  for (const override of [
    { areaId: 'tultitlan' },
    { context: 'next' },
    { date: 'week' as const },
    { category: 'market' as const },
    { collection: 'free' as const },
  ])
    expect(discoveryKey({ ...scope, ...override }, 'preview')).not.toEqual(
      baseline,
    );
  expect(discoveryKey(scope, 'list')).not.toEqual(baseline);
});
