# Backend implementation handoff

DAB-03/04 implemented in `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/discover-backend`, branch `codex/discover-backend`, base `37c8077b7e09edaa155858ef8b280e3d11ec0780`. No commits, pushes, or staged changes. Parent integrates the files below into authoritative `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/discover-area-browsing` and owns complete implementation/tester handoff.

## Integration inventory

Copy these whole files; parent has no competing backend edits:

- packages/contracts/src/catalog.ts (new)
- packages/contracts/src/catalog.test.ts (new)
- packages/contracts/src/index.ts
- apps/backend/package.json (only new db:seed:demo script)
- apps/backend/src/app.ts
- apps/backend/src/catalog.ts (new)
- apps/backend/src/config.ts
- apps/backend/src/server.ts
- apps/backend/src/db/catalog-migration.ts (new)
- apps/backend/src/db/cli.ts
- apps/backend/src/db/database.ts
- apps/backend/src/db/demo.ts (new)
- apps/backend/src/db/migrations.ts
- apps/backend/test/catalog-integration.ts (new)
- apps/backend/test/integration.test.ts

Add root `db:seed:demo` script forwarding to `pnpm --filter @mireqo/backend db:seed:demo`. Invocation accepts an optional positional ISO reference date, e.g. `mise exec -- pnpm db:seed:demo 2026-09-07`. Without a date, explicit invocation uses current Mexico City date. No startup seeding. Run contracts build before standalone backend commands. No dependency or lockfile change required for backend.

## Implemented behavior

Frozen TypeBox exports: Area, AreasResponse, EventSummary, EventsResponse, EventsQuery; response schemas and parsers. Calendar/instant semantics, nonnegative/range money, area membership and strict unknown fields validated. All timezone values are America/Mexico_City. Original bundled mobile artwork keys music/market/art/outdoors and one reserved invalid-domain failure URL supported. API exact fields match earlier freeze.

GET /v1/areas returns bounded three-area SQL catalog. GET /v1/events requires areaId, limit default6 max30, cursor max2048. Unknown area404 AREA_NOT_FOUND; malformed/forged/cross-area/stale cursor400 INVALID_REQUEST; database outage/disabled demo503 CATALOG_UNAVAILABLE. OpenAPI success/error schemas included. Existing liveness/readiness and worker behavior preserved.

New migration003 adds browse_areas, catalog_events JSON summaries plus indexed `(area_id, order_key, id)`, and stable demo source identity table. Summary identity and required discriminants are constrained; explicit foreign keys establish area membership. Applied migrations001/002 unchanged. All dataset dates/versions and rows read in one repeatable-read transaction. SQL filters area before limit+1. Ordering is local calendar date, date-only before exact local time including milliseconds, then stable ID; unannounced last. Date-only never gains an instant. Cursor validates exact current boundary row, area and dataset version.

Demo target allowlist requires loopback 54329/mireqo_dev user mireqo or 54330/mireqo_test user mireqo_test, no URL query/fragment, and NODE_ENV other than production. Both serving and explicit seeding enforce this configuration. No extra environment flag needed. API on any production/other target returns503 for catalog operations. Configured production cannot serve these mocks as real.

Transactional upsert writes30 stable demo IDs,10 per area (two pages at default6), tied dates/exact times, schedules/prices/statuses, long title, missing/failure images, and Mexico City examples across five boroughs. Same reference date gives identical content. Reserved three area IDs updated deliberately; unrelated events and operational fixture rows preserved. Foreign event identity collision aborts/rolls back whole seed. Finite demo-v1 reference-date version rejects stale cursors after deliberate date reseed.

## Verification

All run through mise pinned runtime, 2026-09-07:

- contracts build and tests PASS (2 tests total including existing health)
- backend strict typecheck PASS
- backend existing HTTP/config unit tests PASS (2 tests)
- backend ESLint PASS
- Prettier check of complete apps/backend and packages/contracts PASS
- real isolated integration harness PASS twice; final pass after millisecond ordering/strict DB discriminator fixes (1 suite,1169ms)

Integration explicitly checks fresh/repeated/upgrade migrations preserving sentinel operational record; seeded30 stable identities/content; every page in all areas including tied boundaries and no duplicates; invalid query/unknown/cross-area/forged/stale cursors; response runtime schemas/OpenAPI; unrelated-row preservation; mid-seed collision transaction rollback; empty list; real table outage503; disabled serving and production/target seed rejection; existing PostGIS/worker/crash recovery and unchanged development operational data.

Test DB54330 slot released. Development54329 was only read by harness; parent must migrate/seed development before native/API integration. Required parent full workspace checks and native verification still pending. Existing Fastify disableRequestLogging deprecation warning persists, unrelated to this scope.
