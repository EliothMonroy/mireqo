import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseEventsResponse,
  parseAreasResponse,
  validDate,
} from './catalog.ts';
const area = {
  id: 'coacalco',
  name: 'Coacalco',
  administrativeContext: 'Estado de México',
  kind: 'municipality',
  country: 'MX',
  timezone: 'America/Mexico_City',
};
const event = {
  id: 'a',
  title: 'Demo',
  areaId: 'coacalco',
  image: null,
  venue: null,
  neighborhood: null,
  category: null,
  schedule: {
    kind: 'date-only',
    date: '2026-09-07',
    timezone: 'America/Mexico_City',
  },
  price: { kind: 'unknown' },
  status: 'scheduled',
  updatedAt: '2026-09-07T12:00:00Z',
};
const response = {
  area,
  items: [event],
  nextCursor: null,
  demo: { isDemo: true, referenceDate: '2026-09-07', datasetVersion: 'v1' },
};
test('catalog parsers reject impossible dates, dishonest price ranges, membership and unexpected fields', () => {
  assert.equal(validDate('2026-02-29'), false);
  assert.equal(validDate('2028-02-29'), true);
  assert.deepEqual(parseEventsResponse(response), response);
  assert.deepEqual(parseAreasResponse({ items: [area] }), { items: [area] });
  for (const bad of [
    { ...event, areaId: 'other' },
    { ...event, schedule: { ...event.schedule, date: '2026-02-30' } },
    {
      ...event,
      price: { kind: 'range', minMinor: 2, maxMinor: 1, currency: 'MXN' },
    },
    { ...event, price: { kind: 'fixed', amountMinor: -1, currency: 'MXN' } },
    { ...event, updatedAt: '2026-09-07T24:00:00Z' },
    { ...event, popularity: 1 },
  ])
    assert.throws(() => parseEventsResponse({ ...response, items: [bad] }));
});
