import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { sql, type Kysely } from 'kysely';
import {
  isValidDiscoveryFilters,
  parseDiscoveryContextResponse,
  parseDiscoveryEventsResponse,
  type DiscoveryContext,
  type DiscoveryContextResponse,
  type DiscoveryEventsQuery,
  type DiscoveryEventsResponse,
} from '@mireqo/contracts';
import type { Database } from './db/database.ts';
import { CatalogError, toArea } from './catalog-model.ts';
import { dateRange, localDate } from './discovery-date.ts';
export interface Discovery {
  discoveryContext(areaId: string): Promise<DiscoveryContextResponse>;
  discoveryEvents(
    query: DiscoveryEventsQuery,
  ): Promise<DiscoveryEventsResponse>;
}
const categories = {
  music: 'Music',
  market: 'Market',
  art: 'Art',
  outdoors: 'Outdoors',
};
const invalid = () =>
  new CatalogError(
    400,
    'INVALID_REQUEST',
    'Invalid or outdated discovery context; refresh the catalog',
  );
// An opaque signed generation is shared by previews and lists. Restart deliberately
// expires existing generations; clients retain their content while obtaining a new one.
export function createDiscovery(
  db: Kysely<Database>,
  enabled: boolean,
  clock: () => Date = () => new Date(),
): Discovery {
  const secret = randomBytes(32);
  function sign(data: unknown): string {
    const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
    return `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
  }
  function read(token: string): Record<string, unknown> {
    try {
      const [payload, signature, ...rest] = token.split('.');
      if (
        !payload ||
        !signature ||
        rest.length ||
        !/^[A-Za-z0-9_-]+$/.test(payload)
      )
        throw invalid();
      const expected = createHmac('sha256', secret).update(payload).digest();
      const actual = Buffer.from(signature, 'base64url');
      if (
        expected.length !== actual.length ||
        !timingSafeEqual(expected, actual)
      )
        throw invalid();
      const result: unknown = JSON.parse(
        Buffer.from(payload, 'base64url').toString('utf8'),
      );
      if (!result || typeof result !== 'object' || Array.isArray(result))
        throw invalid();
      return result as Record<string, unknown>;
    } catch {
      throw invalid();
    }
  }
  function guard() {
    if (!enabled)
      throw new CatalogError(
        503,
        'CATALOG_UNAVAILABLE',
        'Demo catalog is available only in local development',
      );
  }
  async function areaRow(trx: Kysely<Database>, id: string) {
    const row = await trx
      .selectFrom('browse_areas')
      .selectAll()
      .where('id', '=', id)
      .where('id', 'in', ['coacalco', 'tultitlan', 'mexico-city'])
      .executeTakeFirst();
    if (!row) throw new CatalogError(404, 'AREA_NOT_FOUND', 'Area not found');
    return row;
  }
  function demo(row: Database['browse_areas']) {
    return {
      isDemo: true as const,
      referenceDate: row.reference_date,
      datasetVersion: row.dataset_version,
    };
  }
  return {
    async discoveryContext(areaId) {
      guard();
      const row = await areaRow(db, areaId);
      const now = clock();
      const context: DiscoveryContext = {
        token: '',
        asOf: now.toISOString(),
        localDate: localDate(now, row.timezone),
        expiresAt: new Date(now.getTime() + 86400000).toISOString(),
      };
      context.token = sign({
        type: 'context',
        areaId,
        version: row.dataset_version,
        ...context,
        token: undefined,
      });
      return parseDiscoveryContextResponse({
        area: toArea(row),
        context,
        demo: demo(row),
      });
    },
    async discoveryEvents(query) {
      guard();
      if (!isValidDiscoveryFilters(query)) throw invalid();
      return db
        .transaction()
        .setIsolationLevel('repeatable read')
        .execute(async (trx) => {
          const row = await areaRow(trx, query.areaId);
          const raw = read(query.context);
          if (
            raw.type !== 'context' ||
            raw.areaId !== row.id ||
            raw.version !== row.dataset_version ||
            typeof raw.asOf !== 'string' ||
            typeof raw.localDate !== 'string' ||
            typeof raw.expiresAt !== 'string' ||
            Date.parse(raw.expiresAt) <= clock().getTime()
          )
            throw invalid();
          const context: DiscoveryContext = {
            token: query.context,
            asOf: raw.asOf,
            localDate: raw.localDate,
            expiresAt: raw.expiresAt,
          };
          const filters = {
            date: query.date,
            category: query.category ?? null,
            collection: query.collection ?? null,
          };
          const mode =
            query.collection === 'today' || query.collection === 'weekend'
              ? query.collection
              : query.date;
          const range = dateRange(context.localDate, mode);
          let filtered = trx
            .selectFrom('catalog_events')
            .selectAll()
            .where('area_id', '=', row.id);
          // Calendar membership is computed in the selected area's timezone. Date-only
          // schedules never become instants, and unannounced dates cannot match ranges.
          const eventDate = sql<string>`case when summary->'schedule'->>'kind' = 'date-only' then summary->'schedule'->>'date' when summary->'schedule'->>'kind' = 'exact' then to_char((summary->'schedule'->>'startsAt')::timestamptz at time zone ${row.timezone}, 'YYYY-MM-DD') else null end`;
          if (range)
            filtered = filtered
              .where(eventDate, '>=', range.start)
              .where(eventDate, '<=', range.end);
          else
            filtered = filtered.where(
              sql<boolean>`case summary->'schedule'->>'kind' when 'unannounced' then true when 'date-only' then summary->'schedule'->>'date' >= ${context.localDate} when 'exact' then (summary->'schedule'->>'startsAt')::timestamptz >= ${context.asOf}::timestamptz else false end`,
            );
          const category =
            query.category ??
            (query.collection === 'music' ? 'music' : undefined);
          if (category)
            filtered = filtered.where(
              sql<string>`summary->>'category'`,
              '=',
              categories[category],
            );
          if (query.collection === 'free')
            filtered = filtered.where(
              sql<string>`summary->'price'->>'kind'`,
              '=',
              'free',
            );
          const identity = JSON.stringify({
            context: query.context,
            filters,
            order: 'local-date-id-v1',
          });
          if (query.cursor) {
            const cursor = read(query.cursor);
            if (
              cursor.type !== 'cursor' ||
              cursor.identity !== identity ||
              typeof cursor.key !== 'string' ||
              typeof cursor.id !== 'string'
            )
              throw invalid();
            const boundary = await filtered
              .where('id', '=', cursor.id)
              .where('order_key', '=', cursor.key)
              .executeTakeFirst();
            if (!boundary) throw invalid();
            filtered = filtered.where(
              sql<boolean>`(order_key,id)>(${cursor.key},${cursor.id})`,
            );
          }
          const limit = query.limit ?? 6;
          const rows = await filtered
            .orderBy('order_key')
            .orderBy('id')
            .limit(limit + 1)
            .execute();
          const page = rows.slice(0, limit);
          const last = page.at(-1);
          return parseDiscoveryEventsResponse({
            area: toArea(row),
            items: page.map((r) => r.summary),
            nextCursor:
              rows.length > limit && last
                ? sign({
                    type: 'cursor',
                    identity,
                    key: last.order_key,
                    id: last.id,
                  })
                : null,
            demo: demo(row),
            context,
            filters,
          });
        });
    },
  };
}
