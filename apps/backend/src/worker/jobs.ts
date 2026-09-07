import { sql, type Kysely } from 'kysely';
import type { Database } from '../db/database.ts';
export interface Job {
  source: string;
  run: (db: Kysely<Database>) => Promise<void>;
}
export async function runJob(db: Kysely<Database>, job: Job) {
  // A dedicated connection owns the session lock until finally releases it. Never return a locked session to the pool.
  return db.connection().execute(async (connection) => {
    const lock = await sql<{
      locked: boolean;
    }>`select pg_try_advisory_lock(hashtextextended(${job.source},0)) as locked`.execute(
      connection,
    );
    if (!lock.rows[0]?.locked) return 'skipped';
    try {
      await connection
        .updateTable('import_runs')
        .set({
          status: 'interrupted',
          finished_at: new Date(),
          error_code: 'PROCESS_LOST',
        })
        .where('source', '=', job.source)
        .where('status', '=', 'running')
        .execute();
      const record = await connection
        .insertInto('import_runs')
        .values({
          source: job.source,
          status: 'running',
          finished_at: null,
          error_code: null,
        })
        .returning('id')
        .executeTakeFirstOrThrow();
      try {
        await connection.transaction().execute((tx) => job.run(tx));
        await connection
          .updateTable('import_runs')
          .set({ status: 'succeeded', finished_at: new Date() })
          .where('id', '=', record.id)
          .execute();
        return 'succeeded';
      } catch {
        await connection
          .updateTable('import_runs')
          .set({
            status: 'failed',
            finished_at: new Date(),
            error_code: 'JOB_FAILED',
          })
          .where('id', '=', record.id)
          .execute();
        return 'failed';
      }
    } finally {
      await sql`select pg_advisory_unlock(hashtextextended(${job.source},0))`.execute(
        connection,
      );
    }
  });
}
export function fixtureJob(fail = false, source = 'fixture:worker'): Job {
  return {
    source,
    async run(db) {
      await db
        .insertInto('fixture_state')
        .values({ source, executions: 1 })
        .onConflict((oc) =>
          oc
            .column('source')
            .doUpdateSet({ executions: sql`fixture_state.executions + 1` }),
        )
        .execute();
      if (fail) throw new Error('Intentional fixture failure');
    },
  };
}
