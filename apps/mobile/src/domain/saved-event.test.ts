import {
  summarySnapshot,
  newestEventSnapshot,
  temporalState,
  sortSnapshots,
  sortPastSnapshots,
  parseSnapshot,
  validEventId,
} from './saved-event';
const base = summarySnapshot(
  {
    id: 'one',
    title: 'One',
    areaId: 'coacalco',
    image: null,
    venue: null,
    neighborhood: null,
    category: null,
    schedule: { kind: 'unannounced' },
    price: { kind: 'unknown' },
    status: 'scheduled',
    updatedAt: '2026-09-18T12:00:00Z',
  },
  {
    id: 'coacalco',
    name: 'Coacalco',
    administrativeContext: 'Estado de México',
    kind: 'municipality',
    country: 'MX',
    timezone: 'America/Mexico_City',
  },
  { isDemo: true, referenceDate: '2026-09-18', datasetVersion: 'v3' },
);
const exact = {
  ...base,
  event: {
    ...base.event,
    schedule: {
      kind: 'exact' as const,
      startsAt: '2026-12-31T22:00:00Z',
      timezone: 'America/Mexico_City' as const,
    },
  },
};
test('end equality and status independent classification', () => {
  const s = {
    ...exact,
    details: {
      endsAt: '2027-01-01T04:00:00Z',
      address: null,
      description: null,
      externalUrl: null,
    },
  };
  expect(temporalState(s, Date.parse('2027-01-01T03:59:59Z'))).toBe('upcoming');
  expect(temporalState(s, Date.parse(s.details.endsAt))).toBe('ended');
  expect(
    temporalState(
      { ...s, event: { ...s.event, status: 'cancelled' } },
      Date.parse('2027-01-01T03:00:00Z'),
    ),
  ).toBe('upcoming');
});
test('unknown end stays on event local day, including new year boundary', () => {
  expect(temporalState(exact, Date.parse('2027-01-01T05:59:59Z'))).toBe(
    'upcoming',
  );
  expect(temporalState(exact, Date.parse('2027-01-01T06:00:00Z'))).toBe(
    'date-passed',
  );
});
test('leap date-only boundary and undated', () => {
  const s = {
    ...base,
    event: {
      ...base.event,
      schedule: {
        kind: 'date-only' as const,
        date: '2028-02-29',
        timezone: 'America/Mexico_City' as const,
      },
    },
  };
  expect(temporalState(s, Date.parse('2028-03-01T05:59:59Z'))).toBe('upcoming');
  expect(temporalState(s, Date.parse('2028-03-01T06:00:00Z'))).toBe(
    'date-passed',
  );
  expect(temporalState(base, Date.now())).toBe('undated');
});
test('snapshot semantic validation, IDs and stable tie order', () => {
  expect(parseSnapshot(JSON.stringify(base))).toEqual(base);
  expect(() =>
    parseSnapshot(JSON.stringify({ ...base, refreshedAt: '2026-01-01' })),
  ).toThrow();
  expect(validEventId('demo:coacalco:1')).toBe(true);
  expect(validEventId('../bad')).toBe(false);
  expect(
    sortSnapshots(
      { ...base, event: { ...base.event, id: 'a' } },
      { ...base, event: { ...base.event, id: 'b' } },
    ),
  ).toBeLessThan(0);
  expect(sortSnapshots(exact, base)).toBeLessThan(0);
});

test('Past known-end ordering uses completion even when start ordering differs', () => {
  const laterEnd = {
    ...exact,
    details: {
      endsAt: '2027-01-02T06:00:00Z',
      description: null,
      address: null,
      externalUrl: null,
    },
  };
  const earlierEnd = {
    ...exact,
    event: {
      ...exact.event,
      id: 'two',
      schedule: { ...exact.event.schedule, startsAt: '2027-01-01T22:00:00Z' },
    },
    details: { ...laterEnd.details, endsAt: '2027-01-02T04:00:00Z' },
  };
  expect(sortPastSnapshots(laterEnd, earlierEnd)).toBeLessThan(0);
});

test('snapshot selection uses successful detail freshness without relabeling or losing full information', () => {
  const details = {
    endsAt: null,
    address: null,
    description: 'Earlier',
    externalUrl: null,
  };
  const older = {
    ...base,
    details,
    refreshedAt: '2026-09-18T12:00:00Z',
    capturedAt: '2026-09-18T13:00:00Z',
  };
  const newer = {
    ...older,
    details: { ...details, description: 'Latest' },
    refreshedAt: '2026-09-18T12:00:20.000Z',
    capturedAt: '2026-09-18T12:00:20.000Z',
  };
  const summary = { ...base, capturedAt: '2026-09-19T12:00:00Z' };
  expect(newestEventSnapshot(base.event.id, older, newer, summary)).toBe(newer);
  expect(newestEventSnapshot(base.event.id, newer, older)).toBe(newer);
  expect(newestEventSnapshot(base.event.id, summary, older)).toBe(older);
  expect(older.refreshedAt).toBe('2026-09-18T12:00:00Z');
  expect(
    newestEventSnapshot(
      base.event.id,
      { ...base, capturedAt: '2026-09-18T12:00:00Z' },
      summary,
    ),
  ).toBe(summary);
  expect(newestEventSnapshot('other', newer)).toBeUndefined();
  expect(newestEventSnapshot(base.event.id, undefined)).toBeUndefined();
});
