import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Value } from '@sinclair/typebox/value';
import {
  EventIdParamsSchema,
  parseEventDetailsResponse,
  type EventDetailsResponse,
} from './event-details.ts';
import { parseEventsResponse } from './catalog.ts';
const response: EventDetailsResponse = {
  area: {
    id: 'coacalco',
    name: 'Coacalco',
    administrativeContext: 'Estado de México',
    kind: 'municipality',
    country: 'MX',
    timezone: 'America/Mexico_City',
  },
  event: {
    id: 'demo:coacalco:01',
    areaId: 'coacalco',
    title: 'Demo',
    image: null,
    venue: null,
    neighborhood: null,
    category: null,
    schedule: {
      kind: 'exact',
      startsAt: '2026-09-18T22:00:00Z',
      timezone: 'America/Mexico_City',
    },
    price: { kind: 'unknown' },
    status: 'scheduled',
    updatedAt: '2026-09-18T12:00:00Z',
  },
  demo: {
    isDemo: true,
    referenceDate: '2026-09-18',
    datasetVersion: 'demo-v3:2026-09-18',
  },
  details: {
    endsAt: '2026-09-19T08:00:00Z',
    description: 'A fictional example.',
    address: 'Fictional example address',
    externalUrl: 'https://example.org/',
  },
};
test('details are additive, strict and truthful for known, unknown and overnight schedules', () => {
  assert.deepEqual(parseEventDetailsResponse(response), response);
  for (const schedule of [
    response.event.schedule,
    { kind: 'date-only', date: '2026-09-18', timezone: 'America/Mexico_City' },
    { kind: 'unannounced' },
  ]) {
    for (const status of ['scheduled', 'cancelled', 'postponed']) {
      const value = {
        ...response,
        event: { ...response.event, schedule, status },
        details: {
          endsAt: null,
          description: null,
          address: null,
          externalUrl: null,
        },
      };
      assert.deepEqual(parseEventDetailsResponse(value), value);
    }
  }
  const legacy = {
    area: response.area,
    items: [response.event],
    demo: response.demo,
    nextCursor: null,
  };
  assert.deepEqual(parseEventsResponse(legacy), legacy);
  assert.throws(() =>
    parseEventsResponse({
      ...legacy,
      items: [{ ...response.event, details: response.details }],
    }),
  );
  for (const bad of [
    { ...response, extra: true },
    { ...response, event: { ...response.event, id: 'bad/id' } },
    { ...response, event: { ...response.event, areaId: 'tultitlan' } },
    {
      ...response,
      event: { ...response.event, updatedAt: '2026-02-30T12:00:00Z' },
    },
    {
      ...response,
      event: {
        ...response.event,
        price: { kind: 'range', minMinor: 2, maxMinor: 1, currency: 'MXN' },
      },
    },
    { ...response, demo: { ...response.demo, referenceDate: '2026-02-30' } },
    { ...response, details: { ...response.details, extra: true } },
  ])
    assert.throws(() => parseEventDetailsResponse(bad));
});
test('details reject unsafe links, malformed or nonexact ends and blank/bounded text', () => {
  for (const externalUrl of [
    'http://example.org/',
    'javascript:alert(1)',
    'https://user:secret@example.org/',
    'https://example.org/other',
    'https://example.org.evil/',
    'https://example.org/\n',
    'https://example.org/\\',
    'https://[',
    '',
    'https://' + 'a'.repeat(2049),
  ]) {
    assert.throws(
      () =>
        parseEventDetailsResponse({
          ...response,
          details: { ...response.details, externalUrl },
        }),
      externalUrl,
    );
  }
  for (const endsAt of [
    '2026-09-18T22:00:00Z',
    '2026-09-18T21:59:59Z',
    '2026-02-30T23:00:00Z',
    '2026-09-18T24:00:00Z',
    '2026-09-19T25:00:00Z',
    '2026-09-19',
    '2026-09-19T12:00:00+01:00',
  ]) {
    assert.throws(
      () =>
        parseEventDetailsResponse({
          ...response,
          details: { ...response.details, endsAt },
        }),
      endsAt,
    );
  }
  for (const schedule of [
    { kind: 'date-only', date: '2026-09-18', timezone: 'America/Mexico_City' },
    { kind: 'unannounced' },
  ])
    assert.throws(() =>
      parseEventDetailsResponse({
        ...response,
        event: { ...response.event, schedule },
      }),
    );
  for (const details of [
    { ...response.details, description: '' },
    { ...response.details, address: ' ' },
    { ...response.details, description: '\n\t' },
    { ...response.details, description: 'a'.repeat(20001) },
    { ...response.details, address: 'a'.repeat(1001) },
  ])
    assert.throws(() => parseEventDetailsResponse({ ...response, details }));
});
test('event ID parameters preserve established IDs and bound unsafe input', () => {
  for (const eventId of [
    'demo:coacalco:01',
    'demo:mexico-city:66',
    'A_1-2:3',
    'a'.repeat(160),
  ])
    assert.ok(Value.Check(EventIdParamsSchema, { eventId }));
  for (const eventId of [
    '',
    '-a',
    ':a',
    '../a',
    'a/b',
    'a\\b',
    'a b',
    'a?b',
    'a#b',
    'a\u0000b',
    'a'.repeat(161),
  ])
    assert.equal(Value.Check(EventIdParamsSchema, { eventId }), false);
  assert.equal(
    Value.Check(EventIdParamsSchema, { eventId: 'a', extra: 1 }),
    false,
  );
});
