import { sql, type Kysely } from 'kysely';

// Existing summaries and provenance remain untouched; missing details are unknown.
export async function up(db: Kysely<unknown>) {
  await db.schema
    .alterTable('catalog_events')
    .addColumn('details', 'jsonb')
    .execute();
  await db.schema
    .alterTable('catalog_events')
    .addCheckConstraint(
      'catalog_event_details_object',
      sql`details is null or jsonb_typeof(details) = 'object'`,
    )
    .execute();
}
