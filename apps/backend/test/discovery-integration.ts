import assert from 'node:assert/strict';
import { sql, type Kysely } from 'kysely';
import {
  parseDiscoveryContextResponse,
  parseDiscoveryEventsResponse,
  type DiscoveryDate,
  type DiscoveryEventsQuery,
  type EventSummary,
} from '@mireqo/contracts';
import type { Database } from '../src/db/database.ts';
import { seedDemo } from '../src/db/demo.ts';
import { createCatalog, orderKey } from '../src/catalog.ts';
import { createApp } from '../src/app.ts';
export async function verifyDiscovery(db: Kysely<Database>, url: string) {
  await seedDemo(db, url, '2026-09-18');
  let now = new Date('2026-09-18T20:00:00.000Z'); // Friday,14:00 Mexico City
  const catalog = createCatalog(db, true, () => now);
  const app = await createApp(async () => {}, false, catalog);
  try {
    const context = parseDiscoveryContextResponse(
      (await app.inject('/v1/discovery/context?areaId=coacalco')).json(),
    );
    assert.equal(context.context.localDate, '2026-09-18');
    assert.equal(context.context.asOf, now.toISOString());
    const base: DiscoveryEventsQuery = {
      areaId: 'coacalco',
      context: context.context.token,
      date: 'default',
    };
    const sample = (
      await db
        .selectFrom('catalog_events')
        .select('summary')
        .where('id', '=', 'demo:coacalco:01')
        .executeTakeFirstOrThrow()
    ).summary;
    const fixtures: EventSummary[] = [
      {
        ...sample,
        id: 'boundary:past',
        schedule: {
          kind: 'exact',
          startsAt: '2026-09-18T19:59:59.999Z',
          timezone: 'America/Mexico_City',
        },
        category: null,
        price: { kind: 'unknown' },
      },
      {
        ...sample,
        id: 'boundary:now',
        schedule: {
          kind: 'exact',
          startsAt: now.toISOString(),
          timezone: 'America/Mexico_City',
        },
        category: 'Music',
        price: { kind: 'fixed', amountMinor: 0, currency: 'MXN' },
      },
      {
        ...sample,
        id: 'boundary:utc-next-day',
        schedule: {
          kind: 'exact',
          startsAt: '2026-09-19T05:59:59.999Z',
          timezone: 'America/Mexico_City',
        },
      },
      {
        ...sample,
        id: 'boundary:tomorrow',
        schedule: {
          kind: 'exact',
          startsAt: '2026-09-19T06:00:00.000Z',
          timezone: 'America/Mexico_City',
        },
      },
      {
        ...sample,
        id: 'boundary:undated',
        schedule: { kind: 'unannounced' },
        category: 'Music',
      },
      {
        ...sample,
        id: 'boundary:yesterday',
        schedule: {
          kind: 'date-only',
          date: '2026-09-17',
          timezone: 'America/Mexico_City',
        },
      },
    ];
    for (const summary of fixtures)
      await db
        .insertInto('catalog_events')
        .values({
          id: summary.id,
          area_id: summary.areaId,
          summary,
          order_key: orderKey(summary),
        })
        .execute();
    const allRows = await db
      .selectFrom('catalog_events')
      .selectAll()
      .where('area_id', '=', 'coacalco')
      .orderBy('order_key')
      .orderBy('id')
      .execute();
    async function all(query: DiscoveryEventsQuery) {
      let cursor: string | null = null;
      const ids: string[] = [];
      do {
        const page = await catalog.discoveryEvents({
          ...query,
          limit: 2,
          ...(cursor ? { cursor } : {}),
        });
        ids.push(...page.items.map((e) => e.id));
        cursor = page.nextCursor;
      } while (cursor);
      assert.equal(new Set(ids).size, ids.length);
      return ids;
    }
    const upcoming = await all(base);
    assert.ok(!upcoming.includes('boundary:past'));
    assert.ok(!upcoming.includes('boundary:yesterday'));
    assert.ok(upcoming.includes('boundary:now'));
    assert.ok(upcoming.includes('demo:coacalco:01'));
    assert.equal(upcoming.at(-1), 'demo:coacalco:10');
    const today = await all({ ...base, date: 'today' });
    assert.ok(today.includes('boundary:past'));
    assert.ok(today.includes('boundary:utc-next-day'));
    assert.ok(!today.includes('boundary:tomorrow'));
    assert.ok(!today.includes('boundary:undated'));
    const tomorrow = await all({ ...base, date: 'tomorrow' });
    assert.ok(tomorrow.includes('boundary:tomorrow'));
    assert.ok(!tomorrow.includes('boundary:utc-next-day'));
    for (const date of [
      'default',
      'today',
      'tomorrow',
      'week',
      'weekend',
    ] as DiscoveryDate[]) {
      for (const category of ['music', 'market', 'art', 'outdoors'] as const) {
        const ids = await all({ ...base, date, category });
        const allowed = new Set(await all({ ...base, date }));
        assert.deepEqual(
          ids,
          allRows
            .filter(
              (r) =>
                allowed.has(r.id) &&
                r.summary.category ===
                  {
                    music: 'Music',
                    market: 'Market',
                    art: 'Art',
                    outdoors: 'Outdoors',
                  }[category],
            )
            .map((r) => r.id),
        );
      }
      const free = await all({ ...base, date, collection: 'free' });
      const allowed = new Set(await all({ ...base, date }));
      assert.deepEqual(
        free,
        allRows
          .filter((r) => allowed.has(r.id) && r.summary.price.kind === 'free')
          .map((r) => r.id),
      );
      assert.ok(!free.includes('boundary:now'));
      assert.ok(!free.includes('boundary:past'));
      assert.deepEqual(
        await all({ ...base, date, collection: 'music' }),
        await all({ ...base, date, category: 'music' }),
      );
    }
    assert.deepEqual(await all({ ...base, collection: 'today' }), today);
    assert.deepEqual(
      await all({ ...base, collection: 'weekend' }),
      await all({ ...base, date: 'weekend' }),
    );
    const first = await catalog.discoveryEvents({ ...base, limit: 2 });
    assert.ok(first.nextCursor);
    const firstSix = await catalog.discoveryEvents({ ...base, limit: 6 });
    assert.deepEqual(first.items, firstSix.items.slice(0, 2));
    // Clock moves across midnight; already-issued generation and paging stay consistent.
    now = new Date('2026-09-19T07:00:00.000Z');
    assert.deepEqual(await all(base), upcoming);
    const newer = await catalog.discoveryContext('coacalco');
    assert.equal(newer.context.localDate, '2026-09-19');
    const badQueries: Record<string, string>[] = [
      { date: 'weekend' },
      { category: 'music' },
      { collection: 'free' },
      { areaId: 'tultitlan' },
      { context: newer.context.token },
      { cursor: first.nextCursor!.slice(0, -3) + 'abc' },
    ];
    for (const changes of badQueries) {
      const params = new URLSearchParams({
        ...base,
        cursor: first.nextCursor!,
        ...changes,
      });
      assert.equal(
        (await app.inject('/v1/discovery/events?' + params)).statusCode,
        400,
      );
    }
    // A once-valid boundary must still satisfy the complete filtered result.
    const freePage = await catalog.discoveryEvents({
      ...base,
      collection: 'free',
      limit: 2,
    });
    assert.ok(freePage.nextCursor);
    const boundary = freePage.items.at(-1)!;
    await db
      .updateTable('catalog_events')
      .set({ summary: { ...boundary, price: { kind: 'unknown' } } })
      .where('id', '=', boundary.id)
      .execute();
    await assert.rejects(
      () =>
        catalog.discoveryEvents({
          ...base,
          collection: 'free',
          cursor: freePage.nextCursor!,
        }),
      { statusCode: 400 },
    );
    await db
      .updateTable('catalog_events')
      .set({ summary: boundary })
      .where('id', '=', boundary.id)
      .execute();
    for (const suffix of [
      '&date=no',
      '&category=no',
      '&collection=no',
      '&collection=today&date=today',
      '&category=music&collection=free',
      '&extra=x',
      '&limit=0',
      '&limit=31',
    ]) {
      const params = new URLSearchParams({ ...base });
      const extra = new URLSearchParams(suffix);
      for (const [key, value] of extra) params.set(key, value);
      assert.equal(
        (await app.inject('/v1/discovery/events?' + params)).statusCode,
        400,
        suffix,
      );
    }
    assert.equal(
      (await app.inject('/v1/discovery/context?areaId=missing')).statusCode,
      404,
    );
    assert.equal(
      (await app.inject('/v1/discovery/context?areaId=coacalco&extra=1'))
        .statusCode,
      400,
    );
    const response = await app.inject(
      '/v1/discovery/events?' + new URLSearchParams({ ...base }),
    );
    assert.equal(response.statusCode, 200);
    parseDiscoveryEventsResponse(response.json());
    const spec = (await app.inject('/v1/openapi.json')).json();
    assert.ok(spec.paths['/v1/discovery/events'].get.responses['400']);
    assert.ok(spec.paths['/v1/discovery/context'].get.responses['200']);
    await sql`alter table catalog_events rename to catalog_events_unavailable`.execute(
      db,
    );
    try {
      assert.equal(
        (
          await app.inject(
            '/v1/discovery/events?' +
              new URLSearchParams({ ...base, cursor: first.nextCursor! }),
          )
        ).statusCode,
        503,
      );
    } finally {
      await sql`alter table catalog_events_unavailable rename to catalog_events`.execute(
        db,
      );
    }
    await seedDemo(db, url, '2026-09-19');
    await assert.rejects(() => catalog.discoveryEvents(base), {
      statusCode: 400,
    });
    const current = await catalog.discoveryContext('coacalco');
    now = new Date('2026-09-20T07:00:00.000Z');
    await assert.rejects(
      () =>
        catalog.discoveryEvents({ ...base, context: current.context.token }),
      { statusCode: 400 },
    );
    const emptyContext = await catalog.discoveryContext('coacalco');
    now = new Date('2026-12-01T12:00:00.000Z');
    const december = await catalog.discoveryContext('coacalco');
    assert.deepEqual(
      (
        await catalog.discoveryEvents({
          ...base,
          context: december.context.token,
          date: 'today',
        })
      ).items,
      [],
    );
    assert.notEqual(emptyContext.context.token, december.context.token);
    await assert.rejects(
      () =>
        createCatalog(db, true, () => now).discoveryEvents({
          ...base,
          context: december.context.token,
        }),
      { statusCode: 400 },
    );
    await assert.rejects(
      () => createCatalog(db, false).discoveryContext('coacalco'),
      { statusCode: 503 },
    );
  } finally {
    await app.close();
    await db
      .deleteFrom('catalog_events')
      .where('id', 'like', 'boundary:%')
      .execute();
  }
}
