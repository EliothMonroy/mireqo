# Discover collections backend implementation

Backend helper owns I01–I03. Branch `codex/discover-collections-backend`, worktree `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/discover-collections-backend`, base `b3ef0fa6c9867fb50010b165246f35c02cad3365`. Authoritative full feature remains parent `.worktrees/discover-collections`; this helper changes only apps/backend and packages/contracts. No commits or pushes. Integrate the uncommitted patch `/tmp/mireqo-discover-collections-backend.patch`, then this note into parent records.

## Additive API

- `GET /v1/discovery/context?areaId=coacalco` returns `{area,context:{token,asOf,localDate,expiresAt},demo}`. Context is backend-issued, HMAC signed with process-local secret, bound to area/dataset/effective instant and local date. Clock injection belongs to createCatalog's optional third argument; server always uses real current time.
- `GET /v1/discovery/events?areaId=coacalco&context=<token>&date=default` accepts `date` default/today/tomorrow/weekend/week, optional category music/market/art/outdoors OR collection today/weekend/free/music, limit1–30 (default6), cursor. Category+collection is invalid. Temporal collections require default date. All filters and paging are performed in SQL before limiting.
- Response extends only this new endpoint: legacy event shape plus `context` and `filters:{date,category:null|id,collection:null|id}`. Strict TypeBox schemas and semantic parsers exported from contracts and registered in generated OpenAPI. Context timestamps are normalized ISO with milliseconds.
- `/v1/events` and `/v1/areas` retain existing response shapes and all-demo-dates behavior; old clients do not receive additive fields. Old cursor semantics remain unchanged, including invalidation when demo version changes.
- Previews/list first pages share context but can use different limits. See All must start at first page; cursors are not a replacement for preview items.

## Generation and errors

A context lasts24hours from issuance; any API restart invalidates its signature and any changed datasetVersion invalidates its generation. Same-reference-date idempotent reseeding does not invalidate unchanged data. Reads never advance fixture dates. The mobile owner renews context on explicit refresh, relevant focus and local-day rollover, retaining truthful stale content on failure. Old issued contexts can continue paging across midnight until expired; response asOf/localDate remain frozen, avoiding temporal drift.

Signed cursors bind complete context token, normalized date/category/collection, ordering version and exact boundary key+ID. They reject cross-area/filter/generation reuse and altered signatures. Boundary membership is checked against the full filtered query; deleting/changing it cannot silently skip content. Database lookup failures remain503, not400. Malformed/expired/outdated context/cursor/combinations return400 INVALID_REQUEST with safe refresh guidance. Unknown areas404; disabled or unavailable demo catalog503. Existing guards remain unchanged.

## Query and fixtures

SQL distinguishes unannounced/date-only/exact schedules. Explicit ranges use selected-area local calendar dates, converting exact starts with PostgreSQL timestamptz AT TIME ZONE. Default uses exact starts >=asOf, date-only >=localDate and undated last. Whole-day shortcuts and temporal collections include earlier starts in their calendar range. Free uses only explicit free; fixed zero/unknown do not match. Category identities map to exact existing truthful labels. Status metadata remains untouched.

Current `(area_id,order_key,id)` index supports ordered area scans; modest development catalog does not justify a new migration or duplicate filter columns. Applied migrations remain immutable and all migration/upgrade tests still run.

Demo format `demo-v2:<referenceDate>` contains66 stable records per area (198 total): original10 plus four category events per day over14days, including multiple Free/Music and temporal pages. Original identity ownership, missing data/status examples and explicit seeding guards preserved. Seed is transactional, repeatable and collision-safe; unrelated rows remain intact. Date offsets never move on API reads. This is development data, not evidence of production query scale.

## Verification

Using pinned mise Node/pnpm and actual allowlisted test PostgreSQL/PostGIS on localhost54330:

- `mise exec -- pnpm build`: passed.
- `mise exec -- pnpm --filter @mireqo/contracts test`:3passed (legacy, new discovery schemas/semantics, health).
- `mise exec -- pnpm --filter @mireqo/backend test`:3passed (HTTP/config and pure calendar boundaries).
- `mise exec -- pnpm --filter @mireqo/backend lint`:passed.
- `mise exec -- pnpm --filter @mireqo/backend typecheck`:passed.
- `mise exec -- pnpm test:integration`:passed, including fresh/repeated/upgrade migration preservation, unchanged development operational rows, PostGIS, worker locks/process-loss safeguards, legacy catalog, new discovery. Repeated after final shared-model extraction.

New tests use explicit2026-09-18T20:00Z clock and independent expected row sets. They verify exact cutoff inclusive millisecond, date-only eligibility, MexicoCity/UTC midnight divergence, whole-day past starts, week/weekend ranges incl Sunday/year/leap transitions, every date/category combination, Free/Music equivalence, combined filtering before small pages, complete ordered IDs/no duplication, unknown price/null category, preview/list continuity, midnight-stable paging, wrong area/date/category/collection/new-generation/signature cursor rejection, boundary no longer matching filter, availability503 with cursor, unknown/extra/malformed request fields, OpenAPI, reseed/restart/24h invalidation and genuinely empty future date. Shared parser tests reject wrong local date, impossible instants, impossible combinations, mismatched area and legacy-added fields.

Helper has no native ownership or native verification claim. Parent must integrate and run combined checks, actual API/mobile flow and Android+iOS required verification before tester handoff.
