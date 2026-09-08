import type { Kysely } from 'kysely';
import { validDate, type Area, type EventSummary } from '@mireqo/contracts';
import type { Database } from './database.ts';
import { isDemoTarget } from '../config.ts';
import { orderKey } from '../catalog.ts';
export const demoAreas: Area[] = [
  {
    id: 'coacalco',
    name: 'Coacalco',
    administrativeContext: 'Municipality · Estado de México',
    kind: 'municipality',
    country: 'MX',
    timezone: 'America/Mexico_City',
  },
  {
    id: 'tultitlan',
    name: 'Tultitlán',
    administrativeContext: 'Municipality · Estado de México',
    kind: 'municipality',
    country: 'MX',
    timezone: 'America/Mexico_City',
  },
  {
    id: 'mexico-city',
    name: 'Mexico City',
    administrativeContext: 'Entire city · All boroughs',
    kind: 'city',
    country: 'MX',
    timezone: 'America/Mexico_City',
  },
];
export function localReferenceDate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
const titles = [
  'Sounds in the garden',
  'A morning at the makers market',
  'Color and clay workshop',
  'An afternoon outdoors',
  'Small stage, big sounds',
  'Stories from the neighborhood',
  'A very long title for a community exhibition of handmade pieces, shared histories and new perspectives',
  'Evening listening room',
  'Weekend sketch club',
  'Community gathering',
];
export async function seedDemo(
  db: Kysely<Database>,
  url: string,
  referenceDate = localReferenceDate(),
  environment = process.env.NODE_ENV,
) {
  if (!isDemoTarget(url, environment))
    throw new Error(
      'Refusing demo seed outside allowlisted local development/test target',
    );
  if (!validDate(referenceDate))
    throw new Error('Reference date must be a valid ISO calendar date');
  const version = `demo-v1:${referenceDate}`;
  await db.transaction().execute(async (trx) => {
    for (const area of demoAreas) {
      const row = {
        id: area.id,
        name: area.name,
        administrative_context: area.administrativeContext,
        kind: area.kind,
        country: area.country,
        timezone: area.timezone,
        reference_date: referenceDate,
        dataset_version: version,
      };
      await trx
        .insertInto('browse_areas')
        .values(row)
        .onConflict((oc) => oc.column('id').doUpdateSet(row))
        .execute();
      for (let index = 0; index < titles.length; index++) {
        const day = new Date(`${referenceDate}T00:00:00Z`);
        day.setUTCDate(day.getUTCDate() + Math.floor(index / 2));
        const date = day.toISOString().slice(0, 10);
        const id = `demo:${area.id}:${String(index + 1).padStart(2, '0')}`;
        const prices: EventSummary['price'][] = [
          { kind: 'free' },
          { kind: 'fixed', amountMinor: 15000, currency: 'MXN' },
          { kind: 'starting-at', amountMinor: 9000, currency: 'MXN' },
          { kind: 'range', minMinor: 10000, maxMinor: 25000, currency: 'MXN' },
          { kind: 'unknown' },
        ];
        const event: EventSummary = {
          id,
          title: titles[index]!,
          areaId: area.id,
          image:
            index === 8
              ? null
              : index === 9
                ? {
                    kind: 'remote',
                    url: 'https://images.invalid/mireqo-demo-missing.jpg',
                  }
                : {
                    kind: 'artwork',
                    key:
                      index % 4 === 0
                        ? 'music'
                        : index % 4 === 1
                          ? 'market'
                          : index % 4 === 2
                            ? 'art'
                            : 'outdoors',
                  },
          venue: index === 9 ? null : 'Demo community space',
          neighborhood:
            area.id === 'mexico-city'
              ? [
                  'Cuauhtémoc',
                  'Coyoacán',
                  'Iztapalapa',
                  'Tlalpan',
                  'Miguel Hidalgo',
                ][index % 5]!
              : index === 8
                ? null
                : area.name,
          category:
            index === 9
              ? null
              : ['Music', 'Market', 'Art', 'Outdoors'][index % 4]!,
          schedule:
            index === 9
              ? { kind: 'unannounced' }
              : index === 0 || index === 1
                ? { kind: 'date-only', date, timezone: area.timezone }
                : {
                    kind: 'exact',
                    startsAt: `${date}T18:00:00Z`,
                    timezone: area.timezone,
                  },
          price: prices[index % 5]!,
          status:
            index === 6 ? 'cancelled' : index === 7 ? 'postponed' : 'scheduled',
          updatedAt: `${referenceDate}T12:00:00Z`,
        };
        // Never take ownership of an unrelated event that happens to collide.
        const existing = await trx
          .selectFrom('catalog_events')
          .select('id')
          .where('id', '=', id)
          .executeTakeFirst();
        if (
          existing &&
          !(await trx
            .selectFrom('catalog_source_records')
            .select('event_id')
            .where('event_id', '=', id)
            .where('source', '=', 'demo:local')
            .where('source_record_id', '=', id)
            .where('is_demo', '=', true)
            .executeTakeFirst())
        )
          throw new Error('Demo identity collision');
        const record = {
          id,
          area_id: area.id,
          summary: event,
          order_key: orderKey(event),
        };
        await trx
          .insertInto('catalog_events')
          .values(record)
          .onConflict((oc) => oc.column('id').doUpdateSet(record))
          .execute();
        await trx
          .insertInto('catalog_source_records')
          .values({
            source: 'demo:local',
            source_record_id: id,
            event_id: id,
            is_demo: true,
          })
          .onConflict((oc) =>
            oc.columns(['source', 'source_record_id']).doNothing(),
          )
          .execute();
      }
    }
  });
}
