import { Kysely, PostgresDialect, sql, type Generated } from 'kysely';
import pg from 'pg';
export interface Database {
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
  await sql`select postgis_version()`.execute(db);
}
