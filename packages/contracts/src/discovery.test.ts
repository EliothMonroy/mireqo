import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Value } from '@sinclair/typebox/value';
import {
  DiscoveryEventsQuerySchema,
  isValidDiscoveryFilters,
  parseDiscoveryContextResponse,
  parseDiscoveryEventsResponse,
} from './discovery.ts';
import { parseEventsResponse } from './catalog.ts';
const area = {
  id: 'coacalco',
  name: 'Coacalco',
  administrativeContext: 'Estado de México',
  kind: 'municipality',
  country: 'MX',
  timezone: 'America/Mexico_City',
};
const context = {
  token: 'opaque',
  asOf: '2026-09-19T05:00:00.000Z',
  localDate: '2026-09-18',
  expiresAt: '2026-09-20T05:00:00.000Z',
};
const demo = {
  isDemo: true,
  referenceDate: '2026-09-18',
  datasetVersion: 'demo-v2:2026-09-18',
};
const event = {
  id: 'a',
  title: 'Demo',
  areaId: 'coacalco',
  image: null,
  venue: null,
  neighborhood: null,
  category: null,
  schedule: { kind: 'unannounced' },
  price: { kind: 'unknown' },
  status: 'scheduled',
  updatedAt: '2026-09-18T12:00:00Z',
};
const response = {
  area,
  context,
  demo,
  items: [event],
  nextCursor: null,
  filters: { date: 'default', category: null, collection: null },
};
test('additive discovery schemas preserve legacy strictness and validate effective context', () => {
  assert.deepEqual(parseDiscoveryContextResponse({ area, context, demo }), {
    area,
    context,
    demo,
  });
  assert.deepEqual(parseDiscoveryEventsResponse(response), response);
  assert.throws(() => parseEventsResponse(response));
  assert.doesNotThrow(() =>
    parseEventsResponse({ area, demo, items: [event], nextCursor: null }),
  );
  for (const change of [
    { localDate: '2026-09-19' },
    { localDate: '2026-02-30' },
    { asOf: '2026-02-30T05:00:00.000Z' },
    { expiresAt: context.asOf },
    { expiresAt: 'garbage' },
    { extra: true },
  ])
    assert.throws(() =>
      parseDiscoveryContextResponse({
        area,
        demo,
        context: { ...context, ...change },
      }),
    );
  for (const filters of [
    { date: 'today', category: null, collection: 'today' },
    { date: 'default', category: 'art', collection: 'free' },
    { date: 'bad', category: null, collection: null },
    { date: 'default', category: 'bad', collection: null },
  ])
    assert.throws(() => parseDiscoveryEventsResponse({ ...response, filters }));
  assert.throws(() =>
    parseDiscoveryEventsResponse({
      ...response,
      items: [{ ...event, areaId: 'other' }],
    }),
  );
  for (const date of ['default', 'today', 'tomorrow', 'weekend', 'week'])
    assert.ok(
      Value.Check(DiscoveryEventsQuerySchema, {
        areaId: 'coacalco',
        context: 'opaque',
        date,
      }),
    );
  for (const bad of [
    { date: 'bad' },
    { category: 'bad' },
    { collection: 'bad' },
    { limit: 31 },
    { limit: 0 },
    { unexpected: 1 },
  ])
    assert.equal(
      Value.Check(DiscoveryEventsQuerySchema, {
        areaId: 'coacalco',
        context: 'opaque',
        date: 'default',
        ...bad,
      }),
      false,
    );
  assert.equal(
    isValidDiscoveryFilters({ date: 'default', collection: 'today' }),
    true,
  );
  assert.equal(
    isValidDiscoveryFilters({ date: 'today', collection: 'music' }),
    true,
  );
  assert.equal(
    isValidDiscoveryFilters({ date: 'today', collection: 'weekend' }),
    false,
  );
});
