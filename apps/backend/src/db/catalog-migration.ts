import { sql, type Kysely } from 'kysely';
export async function up(db: Kysely<unknown>) {
  await sql`create table browse_areas (
    id text primary key, name text not null, administrative_context text not null,
    kind text not null check(kind in ('municipality','city')), country text not null check(country='MX'), timezone text not null,
    reference_date text not null, dataset_version text not null
  )`.execute(db);
  await sql`create table catalog_events (
    id text primary key, area_id text not null references browse_areas(id),
    summary jsonb not null, order_key text not null,
    check((summary->>'id'=id) is true), check((summary->>'areaId'=area_id) is true),
    check((summary->>'status' in ('scheduled','cancelled','postponed')) is true),
    check((summary->'schedule'->>'kind' in ('exact','date-only','unannounced')) is true),
    check((summary->'price'->>'kind' in ('free','fixed','starting-at','range','unknown')) is true)
  )`.execute(db);
  await sql`create index catalog_area_order on catalog_events(area_id, order_key, id)`.execute(
    db,
  );
  await sql`create table catalog_source_records (
    source text not null, source_record_id text not null, event_id text not null unique references catalog_events(id),
    is_demo boolean not null, primary key(source,source_record_id)
  )`.execute(db);
}
