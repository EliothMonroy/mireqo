import { sql, type Kysely } from 'kysely';
import {
  parseEventsResponse,
  type Area,
  type EventsQuery,
  type EventsResponse,
} from '@mireqo/contracts';
import type { Database } from './db/database.ts';
export class CatalogError extends Error {
  statusCode: number;
  code: string;
  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
export interface Catalog {
  areas(): Promise<{ items: Area[] }>;
  events(query: EventsQuery): Promise<EventsResponse>;
}
function area(row: Database['browse_areas']): Area {
  return {
    id: row.id,
    name: row.name,
    administrativeContext: row.administrative_context,
    kind: row.kind,
    country: row.country,
    timezone: row.timezone,
  };
}
// Lexicographic keys: local calendar date, then date-only before exact local time;
// unannounced follows all dated entries. No fabricated instant for date-only.
export function orderKey(event: Database['catalog_events']['summary']): string {
  const schedule = event.schedule;
  if (schedule.kind === 'unannounced') return '1';
  if (schedule.kind === 'date-only') return `0:${schedule.date}:0`;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: schedule.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(schedule.startsAt));
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `0:${get('year')}-${get('month')}-${get('day')}:1:${get('hour')}:${get('minute')}:${get('second')}.${String(new Date(schedule.startsAt).getUTCMilliseconds()).padStart(3, '0')}`;
}
export function createCatalog(db: Kysely<Database>, enabled: boolean): Catalog {
  function guard() {
    if (!enabled)
      throw new CatalogError(
        503,
        'CATALOG_UNAVAILABLE',
        'Demo catalog is available only in local development',
      );
  }
  return {
    async areas() {
      guard();
      return {
        items: (
          await db
            .selectFrom('browse_areas')
            .selectAll()
            .where('id', 'in', ['coacalco', 'tultitlan', 'mexico-city'])
            .orderBy('name')
            .execute()
        ).map(area),
      };
    },
    async events(query) {
      guard();
      // A single repeatable-read snapshot prevents reseeding between metadata and rows.
      return db
        .transaction()
        .setIsolationLevel('repeatable read')
        .execute(async (trx) => {
          const row = await trx
            .selectFrom('browse_areas')
            .selectAll()
            .where('id', '=', query.areaId)
            .where('id', 'in', ['coacalco', 'tultitlan', 'mexico-city'])
            .executeTakeFirst();
          if (!row)
            throw new CatalogError(404, 'AREA_NOT_FOUND', 'Area not found');
          let last:
            | { areaId: string; version: string; key: string; id: string }
            | undefined;
          if (query.cursor) {
            try {
              if (!/^[A-Za-z0-9_-]+$/.test(query.cursor)) throw new Error();
              const raw: unknown = JSON.parse(
                Buffer.from(query.cursor, 'base64url').toString('utf8'),
              );
              if (!raw || typeof raw !== 'object' || Array.isArray(raw))
                throw new Error();
              const value = raw as Record<string, unknown>;
              if (
                Object.keys(value).sort().join(',') !==
                  'areaId,id,key,version' ||
                !['areaId', 'id', 'key', 'version'].every(
                  (key) => typeof value[key] === 'string',
                ) ||
                value.areaId !== row.id ||
                value.version !== row.dataset_version
              )
                throw new Error();
              last = value as typeof last;
            } catch {
              throw new CatalogError(
                400,
                'INVALID_REQUEST',
                'Invalid or outdated cursor; refresh the catalog',
              );
            }
          }
          if (last) {
            // Database failures are availability errors, not malformed cursors.
            const boundary = await trx
              .selectFrom('catalog_events')
              .select('id')
              .where('area_id', '=', row.id)
              .where('id', '=', last.id)
              .where('order_key', '=', last.key)
              .executeTakeFirst();
            if (!boundary)
              throw new CatalogError(
                400,
                'INVALID_REQUEST',
                'Invalid or outdated cursor; refresh the catalog',
              );
          }
          const limit = query.limit ?? 6;
          let statement = trx
            .selectFrom('catalog_events')
            .selectAll()
            .where('area_id', '=', row.id);
          if (last)
            statement = statement.where(
              sql<boolean>`(order_key, id) > (${last.key}, ${last.id})`,
            );
          const records = await statement
            .orderBy('order_key')
            .orderBy('id')
            .limit(limit + 1)
            .execute();
          const page = records.slice(0, limit);
          const boundary = page.at(-1);
          return parseEventsResponse({
            area: area(row),
            items: page.map((r) => r.summary),
            nextCursor:
              records.length > limit && boundary
                ? Buffer.from(
                    JSON.stringify({
                      areaId: row.id,
                      version: row.dataset_version,
                      key: boundary.order_key,
                      id: boundary.id,
                    }),
                  ).toString('base64url')
                : null,
            demo: {
              isDemo: true,
              referenceDate: row.reference_date,
              datasetVersion: row.dataset_version,
            },
          });
        });
    },
  };
}
