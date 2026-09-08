import type { EventSummary } from '@mireqo/contracts';
import { Kysely, PostgresDialect, sql, type Generated } from 'kysely';
import pg from 'pg';
export interface Database {
  browse_areas: {
    id: string;
    name: string;
    administrative_context: string;
    kind: 'municipality' | 'city';
    country: 'MX';
    timezone: 'America/Mexico_City';
    reference_date: string;
    dataset_version: string;
  };
  catalog_events: {
    id: string;
    area_id: string;
    summary: EventSummary;
    order_key: string;
  };
  catalog_source_records: {
    source: string;
    source_record_id: string;
    event_id: string;
    is_demo: boolean;
  };
  import_runs: {
    id: Generated<number>;
    source: string;
    status: 'running' | 'succeeded' | 'failed' | 'interrupted';
    started_at: Generated<Date>;
    finished_at: Date | null;
    error_code: string | null;
  };
  fixture_state: { source: string; executions: number };
}
export function connect(url: string) {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        connectionString: url,
        max: 5,
        connectionTimeoutMillis: 1500,
        statement_timeout: 2000,
        query_timeout: 2500,
      }),
    }),
  });
}
export async function ready(db: Kysely<Database>) {
  await db.selectFrom('import_runs').select('id').limit(1).execute();
  await db.selectFrom('fixture_state').select('source').limit(1).execute();
  await db.selectFrom('browse_areas').select('id').limit(1).execute();
  await db.selectFrom('catalog_events').select('id').limit(1).execute();
  await db
    .selectFrom('catalog_source_records')
    .select('event_id')
    .limit(1)
    .execute();
  await sql`select postgis_version()`.execute(db);
}
