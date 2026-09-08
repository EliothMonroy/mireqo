import assert from 'node:assert/strict';
import { sql, type Kysely } from 'kysely';
import { parseAreasResponse, parseEventsResponse } from '@mireqo/contracts';
import type { Database } from '../src/db/database.ts';
import { seedDemo, demoAreas } from '../src/db/demo.ts';
import { createCatalog } from '../src/catalog.ts';
import { createApp } from '../src/app.ts';
export async function verifyCatalog(db: Kysely<Database>, url: string) {
  await assert.rejects(() => seedDemo(db, url, '2026-02-30'));
  await assert.rejects(() => seedDemo(db, url, '2026-09-07', 'production'));
  await assert.rejects(() =>
    seedDemo(db, url.replace('54330', '54329'), '2026-09-07'),
  );
  await seedDemo(db, url, '2026-09-07');
  const before = await db
    .selectFrom('catalog_events')
    .selectAll()
    .orderBy('id')
    .execute();
  await seedDemo(db, url, '2026-09-07');
  assert.deepEqual(
    await db.selectFrom('catalog_events').selectAll().orderBy('id').execute(),
    before,
  );
  assert.equal(before.length, 30);
  assert.equal(
    (await db.selectFrom('catalog_source_records').selectAll().execute())
      .length,
    30,
  );
  const app = await createApp(async () => {}, false, createCatalog(db, true));
  try {
    const areas = await app.inject('/v1/areas');
    assert.equal(areas.statusCode, 200);
    assert.equal(parseAreasResponse(areas.json()).items.length, 3);
    const stale: string[] = [];
    for (const area of demoAreas) {
      let cursor: string | null = null;
      const ids: string[] = [];
      do {
        const reply = await app.inject(
          `/v1/events?areaId=${area.id}&limit=2${cursor ? '&cursor=' + cursor : ''}`,
        );
        assert.equal(reply.statusCode, 200);
        const page = parseEventsResponse(reply.json());
        assert.ok(page.items.every((e) => e.areaId === area.id));
        ids.push(...page.items.map((e) => e.id));
        cursor = page.nextCursor;
        if (cursor) stale.push(cursor);
      } while (cursor);
      assert.equal(ids.length, 10);
      assert.equal(new Set(ids).size, 10);
      assert.deepEqual(
        ids,
        before
          .filter((e) => e.area_id === area.id)
          .sort(
            (a, b) =>
              a.order_key.localeCompare(b.order_key) ||
              a.id.localeCompare(b.id),
          )
          .map((e) => e.id),
      );
    }
    for (const suffix of [
      '',
      '?areaId=coacalco&limit=0',
      '?areaId=coacalco&limit=31',
      '?areaId=coacalco&unexpected=1',
      '?areaId=coacalco&cursor=garbage',
      '?areaId=coacalco&cursor=' + encodeURIComponent('{}'),
      '?areaId=tultitlan&cursor=' + stale[0],
    ])
      assert.equal(
        (await app.inject('/v1/events' + suffix)).statusCode,
        400,
        suffix,
      );
    assert.equal(
      (await app.inject('/v1/events?areaId=missing')).statusCode,
      404,
    );
    const forged = JSON.parse(Buffer.from(stale[0]!, 'base64url').toString());
    forged.key = 'bogus';
    assert.equal(
      (
        await app.inject(
          '/v1/events?areaId=coacalco&cursor=' +
            Buffer.from(JSON.stringify(forged)).toString('base64url'),
        )
      ).statusCode,
      400,
    );
    const doc = (await app.inject('/v1/openapi.json')).json();
    assert.ok(doc.paths['/v1/events'].get.responses['503']);
    assert.ok(doc.paths['/v1/areas'].get.responses['200']);
    const sample = before[0]!;
    await db
      .insertInto('catalog_events')
      .values({
        ...sample,
        id: 'unrelated',
        summary: { ...sample.summary, id: 'unrelated' },
      })
      .execute();
    await seedDemo(db, url, '2026-09-08');
    assert.ok(
      await db
        .selectFrom('catalog_events')
        .select('id')
        .where('id', '=', 'unrelated')
        .executeTakeFirst(),
    );
    assert.equal(
      (await app.inject('/v1/events?areaId=coacalco&cursor=' + stale[0]))
        .statusCode,
      400,
    );
    // Mid-transaction identity collision must roll back earlier areas and rows.
    await db
      .deleteFrom('catalog_source_records')
      .where('event_id', '=', 'demo:tultitlan:01')
      .execute();
    const state = await db
      .selectFrom('browse_areas')
      .selectAll()
      .orderBy('id')
      .execute();
    await assert.rejects(() => seedDemo(db, url, '2026-09-09'));
    assert.deepEqual(
      await db.selectFrom('browse_areas').selectAll().orderBy('id').execute(),
      state,
    );
    await db
      .deleteFrom('catalog_events')
      .where('area_id', '=', 'mexico-city')
      .where(
        'id',
        'not in',
        db.selectFrom('catalog_source_records').select('event_id'),
      )
      .execute();
    await db
      .deleteFrom('catalog_source_records')
      .where('event_id', 'like', 'demo:mexico-city:%')
      .execute();
    await db
      .deleteFrom('catalog_events')
      .where('area_id', '=', 'mexico-city')
      .execute();
    const empty = parseEventsResponse(
      (await app.inject('/v1/events?areaId=mexico-city')).json(),
    );
    assert.deepEqual(empty.items, []);
    assert.equal(empty.nextCursor, null);
    const outageCursor = parseEventsResponse(
      (await app.inject('/v1/events?areaId=coacalco&limit=2')).json(),
    ).nextCursor!;
    await sql`alter table catalog_events rename to catalog_events_unavailable`.execute(
      db,
    );
    try {
      assert.equal(
        (await app.inject('/v1/events?areaId=coacalco')).statusCode,
        503,
      );
      assert.equal(
        (await app.inject(`/v1/events?areaId=coacalco&cursor=${outageCursor}`))
          .statusCode,
        503,
      );
    } finally {
      await sql`alter table catalog_events_unavailable rename to catalog_events`.execute(
        db,
      );
    }
  } finally {
    await app.close();
  }
  const disabled = await createApp(
    async () => {},
    false,
    createCatalog(db, false),
  );
  try {
    assert.equal((await disabled.inject('/v1/areas')).statusCode, 503);
    assert.equal(
      (await disabled.inject('/v1/events?areaId=coacalco')).statusCode,
      503,
    );
  } finally {
    await disabled.close();
  }
}
