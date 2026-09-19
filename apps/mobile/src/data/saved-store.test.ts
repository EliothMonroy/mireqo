import { createSavedStore, type SavedStorage } from './saved-store';
import { summarySnapshot, type EventSnapshot } from '../domain/saved-event';
import { context, page } from '../test/discovery-fixtures';
const ctx = context();
const snapshot = summarySnapshot(
  page({ areaId: 'coacalco', context: 'x', date: 'default' }).items[0]!,
  ctx.area,
  ctx.demo,
);
const rich: EventSnapshot = {
  ...snapshot,
  details: {
    endsAt: null,
    address: null,
    description: 'Full details',
    externalUrl: null,
  },
  refreshedAt: '2026-09-18T12:00:00Z',
};
function disk() {
  const rows = new Map<string, string>();
  return {
    rows,
    initialize: jest.fn(async () => {}),
    read: jest.fn(async () =>
      [...rows].map(([id, snapshot]) => ({ id, snapshot })),
    ),
    write: jest.fn(async (id: string, value: EventSnapshot | null) => {
      if (value) rows.set(id, JSON.stringify(value));
      else rows.delete(id);
    }),
  } satisfies SavedStorage & { rows: Map<string, string> };
}
test('save/unsave/save synchronizes immediately and survives a restart with one entry', async () => {
  const d = disk();
  const s = createSavedStore(d);
  await s.hydrate();
  s.toggle(snapshot);
  s.toggle(snapshot);
  s.toggle(snapshot);
  expect(Object.keys(s.getSnapshot().entries)).toEqual([snapshot.event.id]);
  await s.settled();
  const restored = createSavedStore(d);
  await restored.hydrate();
  expect(restored.getSnapshot().entries[snapshot.event.id]).toEqual(snapshot);
});
test('failed old write never rolls back newer intent; last failure rolls back then retries', async () => {
  const d = disk();
  const s = createSavedStore(d);
  await s.hydrate();
  d.write.mockRejectedValueOnce(new Error('full'));
  s.toggle(snapshot);
  s.toggle(snapshot);
  s.toggle(snapshot);
  await s.settled();
  expect(s.getSnapshot().entries[snapshot.event.id]).toEqual(snapshot);
  d.write.mockRejectedValueOnce(new Error('full'));
  s.toggle(snapshot);
  expect(s.getSnapshot().entries[snapshot.event.id]).toBeUndefined();
  await s.settled();
  expect(s.getSnapshot().entries[snapshot.event.id]).toEqual(snapshot);
  expect(s.getSnapshot().error).toMatch('could not be stored');
  s.retry();
  await s.settled();
  expect(d.rows.size).toBe(0);
  expect(s.getSnapshot().error).toBeNull();
});
test('stale refresh cannot resurrect removed membership or overwrite a resave', async () => {
  const s = createSavedStore(disk());
  await s.hydrate();
  s.toggle(snapshot);
  const revision = s.revision(snapshot.event.id);
  s.toggle(snapshot);
  s.enrich(rich, revision);
  expect(s.getSnapshot().entries[snapshot.event.id]).toBeUndefined();
  s.toggle(snapshot);
  s.enrich(rich, revision);
  expect(s.getSnapshot().entries[snapshot.event.id]?.details).toBeNull();
  s.enrich(rich, s.revision(snapshot.event.id));
  expect(s.getSnapshot().entries[snapshot.event.id]).toEqual(rich);
  s.enrich(snapshot, s.revision(snapshot.event.id));
  expect(s.getSnapshot().entries[snapshot.event.id]).toEqual(rich);
  await s.settled();
});
test('hydration failure blocks writes and permits recovery; malformed persisted data is honest', async () => {
  const d = disk();
  d.initialize.mockRejectedValueOnce(new Error('locked'));
  const s = createSavedStore(d);
  await s.hydrate();
  s.toggle(snapshot);
  expect(d.write).not.toHaveBeenCalled();
  expect(s.getSnapshot().ready).toBe(false);
  await s.hydrate();
  expect(s.getSnapshot().ready).toBe(true);
  d.rows.set('wrong', JSON.stringify(snapshot));
  const broken = createSavedStore(d);
  await broken.hydrate();
  expect(broken.getSnapshot().error).toMatch('restored');
});

test('a summary resave never downgrades richer last-known details or refresh time', async () => {
  const s = createSavedStore(disk());
  await s.hydrate();
  s.toggle(rich);
  await s.settled();
  s.toggle(snapshot);
  s.toggle(snapshot);
  await s.settled();
  expect(s.getSnapshot().entries[snapshot.event.id]).toEqual(rich);
});

test('valid catalog IDs cannot resolve inherited Object prototype entries', async () => {
  const s = createSavedStore(disk());
  expect(s.getSnapshot().entries['constructor']).toBeUndefined();
  await s.hydrate();
  expect(s.getSnapshot().entries['toString']).toBeUndefined();
  const unusual = {
    ...snapshot,
    event: { ...snapshot.event, id: 'constructor' },
  };
  s.toggle(unusual);
  expect(s.getSnapshot().entries['constructor']).toEqual(unusual);
  await s.settled();
  s.toggle(unusual);
  expect(s.getSnapshot().entries['constructor']).toBeUndefined();
  await s.settled();
});
