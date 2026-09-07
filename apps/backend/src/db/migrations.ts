import { Migrator } from 'kysely/migration';
import { sql, type Kysely } from 'kysely';
import type { Database } from './database.ts';
export const migrations = {
  '001_import_runs': {
    async up(db: Kysely<unknown>) {
      await sql`create extension if not exists postgis`.execute(db);
      await db.schema
        .createTable('import_runs')
        .addColumn('id', 'serial', (c) => c.primaryKey())
        .addColumn('source', 'text', (c) => c.notNull())
        .addColumn('status', 'text', (c) => c.notNull())
        .addColumn('started_at', 'timestamptz', (c) =>
          c.notNull().defaultTo(sql`now()`),
        )
        .addColumn('finished_at', 'timestamptz')
        .addColumn('error_code', 'text')
        .addCheckConstraint(
          'run_status',
          sql`status in ('running','succeeded','failed','interrupted')`,
        )
        .execute();
    },
  },
  '002_fixture_state': {
    async up(db: Kysely<unknown>) {
      await db.schema
        .createTable('fixture_state')
        .addColumn('source', 'text', (c) => c.primaryKey())
        .addColumn('executions', 'integer', (c) => c.notNull())
        .execute();
    },
  },
};
export async function migrate(db: Kysely<Database>, target?: string) {
  const migrator = new Migrator({
    db,
    provider: { getMigrations: async () => migrations },
  });
  const result = target
    ? await migrator.migrateTo(target)
    : await migrator.migrateToLatest();
  if (result.error) throw result.error;
  return result.results;
}
export async function seed(db: Kysely<Database>) {
  await db
    .insertInto('fixture_state')
    .values({ source: 'fixture:seed', executions: 0 })
    .onConflict((oc) => oc.column('source').doNothing())
    .execute();
}
