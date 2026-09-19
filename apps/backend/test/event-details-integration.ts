import assert from 'node:assert/strict';
import { sql, type Kysely } from 'kysely';
import {
  parseEventDetailsResponse,
  parseEventsResponse,
  type EventSummary,
} from '@mireqo/contracts';
import { type Database, ready } from '../src/db/database.ts';
import { migrate } from '../src/db/migrations.ts';
import { seedDemo } from '../src/db/demo.ts';
import { createCatalog } from '../src/catalog.ts';
import { createApp } from '../src/app.ts';

export async function verifyDetailsUpgrade(db: Kysely<Database>) {
  await migrate(db, '003_catalog');
  const summary: EventSummary = {
    id: 'upgrade-sentinel',
    title: 'Preserved original',
    areaId: 'coacalco',
    image: null,
    venue: null,
    neighborhood: null,
    category: null,
    schedule: { kind: 'unannounced' },
    price: { kind: 'unknown' },
    status: 'postponed',
    updatedAt: '2026-09-01T12:00:00Z',
  };
  await db
    .insertInto('browse_areas')
    .values({
      id: 'coacalco',
      name: 'Coacalco',
      administrative_context: 'Original context',
      kind: 'municipality',
      country: 'MX',
      timezone: 'America/Mexico_City',
      reference_date: '2026-09-01',
      dataset_version: 'original-v1',
    })
    .execute();
  await db
    .insertInto('catalog_events')
    .values({
      id: summary.id,
      area_id: summary.areaId,
      summary,
      order_key: '1',
    })
    .execute();
  await db
    .insertInto('catalog_source_records')
    .values({
      event_id: summary.id,
      source: 'original-source',
      source_record_id: 'original-record',
      is_demo: false,
    })
    .execute();
  await db
    .insertInto('fixture_state')
    .values({ source: 'upgrade-sentinel', executions: 42 })
    .execute();
  const areasBefore = await db.selectFrom('browse_areas').selectAll().execute();
  const eventsBefore = await db
    .selectFrom('catalog_events')
    .selectAll()
    .execute();
  const sourcesBefore = await db
    .selectFrom('catalog_source_records')
    .selectAll()
    .execute();
  await assert.rejects(() => ready(db));
  const app = await createApp(() => ready(db), false, createCatalog(db, true));
  try {
    assert.equal((await app.inject('/v1/ready')).statusCode, 503);
    await migrate(db);
    await migrate(db);
    assert.equal((await app.inject('/v1/ready')).statusCode, 200);
    assert.deepEqual(
      await db.selectFrom('browse_areas').selectAll().execute(),
      areasBefore,
    );
    assert.deepEqual(
      await db.selectFrom('catalog_events').selectAll().execute(),
      eventsBefore.map((row) => ({ ...row, details: null })),
    );
    assert.deepEqual(
      await db.selectFrom('catalog_source_records').selectAll().execute(),
      sourcesBefore,
    );
    assert.equal(
      (
        await db
          .selectFrom('fixture_state')
          .select('executions')
          .where('source', '=', 'upgrade-sentinel')
          .executeTakeFirstOrThrow()
      ).executions,
      42,
    );
    const reply = await app.inject('/v1/events/upgrade-sentinel');
    assert.equal(reply.statusCode, 200);
    const result = parseEventDetailsResponse(reply.json());
    assert.deepEqual(result.event, summary);
    assert.deepEqual(result.details, {
      endsAt: null,
      description: null,
      address: null,
      externalUrl: null,
    });
    await assert.rejects(() =>
      sql`update catalog_events set details = '[]'::jsonb where id = 'upgrade-sentinel'`.execute(
        db,
      ),
    );
  } finally {
    await app.close();
  }
  await db
    .deleteFrom('catalog_source_records')
    .where('event_id', '=', summary.id)
    .execute();
  await db.deleteFrom('catalog_events').where('id', '=', summary.id).execute();
  await db
    .deleteFrom('fixture_state')
    .where('source', '=', 'upgrade-sentinel')
    .execute();
}

export async function verifyEventDetails(db: Kysely<Database>, url: string) {
  await seedDemo(db, url, '2026-09-07');
  const catalog = createCatalog(
    db,
    true,
    () => new Date('2026-12-01T12:00:00Z'),
  );
  const app = await createApp(() => ready(db), false, catalog);
  try {
    const records = await db
      .selectFrom('catalog_events')
      .selectAll()
      .orderBy('id')
      .execute();
    assert.equal(records.length, 198);
    for (const record of records) {
      const reply = await app.inject(
        '/v1/events/' + encodeURIComponent(record.id),
      );
      assert.equal(reply.statusCode, 200, record.id);
      const result = parseEventDetailsResponse(reply.json());
      assert.deepEqual(result.event, record.summary);
      assert.deepEqual(result.details, record.details);
      assert.equal(result.area.id, record.area_id);
      assert.equal(result.demo.datasetVersion, 'demo-v3:2026-09-07');
    }
    assert.ok(records.some((r) => r.summary.status === 'cancelled'));
    assert.ok(records.some((r) => r.summary.status === 'postponed'));
    assert.ok(records.some((r) => r.details?.description === null));
    assert.ok(records.some((r) => r.details?.endsAt === null));
    assert.ok(records.some((r) => r.details?.externalUrl === null));
    assert.ok(
      records.some((r) => (r.details?.description?.length ?? 0) > 1000),
    );
    assert.ok(
      records.some(
        (r) =>
          r.summary.schedule.kind === 'exact' &&
          r.details?.endsAt &&
          Date.parse(r.details.endsAt) -
            Date.parse(r.summary.schedule.startsAt) >
            12 * 3600000,
      ),
    );
    for (const id of ['unknown', 'a'.repeat(160)]) {
      const result = await app.inject('/v1/events/' + id);
      assert.equal(result.statusCode, 404);
      assert.equal(result.json().error.code, 'EVENT_NOT_FOUND');
    }
    for (const id of [
      'a'.repeat(161),
      ':bad',
      'space id',
      'bad/id',
      'bad\\id',
      'bad?query',
      "quote'",
      'bad\u0000',
    ]) {
      const result = await app.inject('/v1/events/' + encodeURIComponent(id));
      assert.equal(result.statusCode, 400, id);
      assert.equal(result.json().error.code, 'INVALID_REQUEST');
    }
    const doc = (await app.inject('/v1/openapi.json')).json();
    const route = doc.paths['/v1/events/{eventId}'].get;
    for (const status of ['200', '400', '404', '503'])
      assert.ok(route.responses[status]);
    assert.equal(route.parameters[0].schema.maxLength, 160);
    const legacy = parseEventsResponse(
      (await app.inject('/v1/events?areaId=coacalco')).json(),
    );
    assert.ok(
      legacy.items.every(
        (event) => !('details' in event) && !('endsAt' in event),
      ),
    );
    const sample = records[0]!;
    for (const bad of [
      { ...sample.details, externalUrl: 'https://evil.test/' },
      { ...sample.details, endsAt: '2026-02-30T22:00:00Z' },
      { ...sample.details, unexpected: true },
    ]) {
      await sql`update catalog_events set details = ${JSON.stringify(bad)}::jsonb where id = ${sample.id}`.execute(
        db,
      );
      const result = await app.inject(
        '/v1/events/' + encodeURIComponent(sample.id),
      );
      assert.equal(result.statusCode, 503);
      assert.equal(result.json().error.code, 'CATALOG_UNAVAILABLE');
      assert.doesNotMatch(result.body, /SQL|select|password|evil/);
    }
    await db
      .updateTable('catalog_events')
      .set({ details: sample.details })
      .where('id', '=', sample.id)
      .execute();
    // Existing database identity constraints reject mismatched summary IDs.
    await assert.rejects(() =>
      db
        .updateTable('catalog_events')
        .set({ summary: { ...sample.summary, id: 'different-event' } })
        .where('id', '=', sample.id)
        .execute(),
    );
    await sql`alter table catalog_events rename to catalog_events_unavailable`.execute(
      db,
    );
    try {
      const result = await app.inject(
        '/v1/events/' + encodeURIComponent(sample.id),
      );
      assert.equal(result.statusCode, 503);
      assert.equal(result.json().error.code, 'CATALOG_UNAVAILABLE');
      assert.doesNotMatch(result.body, /SQL|select|password|catalog_events/);
    } finally {
      await sql`alter table catalog_events_unavailable rename to catalog_events`.execute(
        db,
      );
    }
    const disabled = await createApp(
      async () => {},
      false,
      createCatalog(db, false),
    );
    try {
      assert.equal(
        (await disabled.inject('/v1/events/' + encodeURIComponent(sample.id)))
          .statusCode,
        503,
      );
    } finally {
      await disabled.close();
    }
  } finally {
    await app.close();
  }
}
