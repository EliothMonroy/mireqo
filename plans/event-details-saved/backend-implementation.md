# Backend and contracts implementation handoff

Implemented and relevant verification passed; parent integrates and performs combined required verification before independent tester. No feature-success verdict, commit, push, service startup, development migration or reseed was performed by this helper.

## Ownership and integration

- Owner: backend implementation helper; source scope only packages/contracts and apps/backend.
- Base: main dee988f521e0fb6dc80b6257c003276abab10f1c.
- Branch: codex/event-details-backend.
- Worktree: /Users/eliothmonroy/Documents/Github/mireqo/.worktrees/event-details-backend.
- Authoritative feature plan remains /Users/eliothmonroy/Documents/Github/mireqo/.worktrees/event-details-saved/plans/event-details-saved; copied local plan files are references only and must not overwrite authoritative records.
- Parent should review/copy only manifest source files and this note. No dependency or lockfile change. Existing applied migrations remain immutable.

## Implemented behavior

Strict additive EventDetailsResponse has event, area, demo and details with endsAt/description/address/externalUrl nullable. Exported EventDetailsResponse, EventDetailsResponseSchema, parseEventDetailsResponse, EventIdParamsSchema, plus EventDetails and EventDetailsSchema. Existing list and summary wire shapes remain unchanged. validInstant is additionally exported for shared validation.

Frozen ID amendment agreed with lead: pattern ^[a-zA-Z0-9][a-zA-Z0-9_:-]{0,159}$ preserves actual demo:<area>:<index> stable IDs. No IDs were changed. Path consumers must encode IDs. Router parameter length permits schema validation of 160-character IDs and rejection of over-limit inputs.

An end requires an exact schedule and must be strictly later than its start. Invalid calendar instants, blank/oversized text, extras, invalid identity/area/price data, unsafe URLs and every demo URL except exactly https://example.org/ are rejected. Demo external action stays an example page, with mobile responsible for its label and launch behavior.

GET /v1/events/:eventId uses a single joined database statement to read global ID, its supported area and metadata consistently. Past/status/discovery context does not constrain lookup. Unknown ID is 404 EVENT_NOT_FOUND; invalid input is 400 INVALID_REQUEST; missing catalog, disabled demo catalog, malformed stored data or database failure is 503 CATALOG_UNAVAILABLE. Error envelopes do not expose SQL or credentials. OpenAPI documents params and 200/400/404/503.

Migration 004_event_details adds nullable JSONB details plus null-or-object constraint; pre-existing summaries/source references/import history remain untouched. Readiness requires the details column. Old rows produce 200 with all-null detail fields. Apply migration explicitly before running the updated API. Reads and startup never seed.

Explicit seedDemo now uses demo-v3:<referenceDate>, preserving every existing ID, summary, order key and count (198 across 3 areas). Version bump deliberately invalidates old cursors upon reseed. Fixtures include synthetic descriptions/address, null fields, known/missing ends and https://example.org/ or null. Per area: :03 has known end, :04 has missing end, :07 long cancelled description, :08 postponed overnight end, :09 missing address/image, :10 undated and all-null details. Source ownership/collision protections and transactional rollback remain intact. No worker/live-provider changes.

## Verification evidence (2026-09-18)

All commands used /Users/eliothmonroy/.local/bin/mise exec -- with pinned pnpm; cached frozen offline dependency installation succeeded. Existing local dev54329/test54330 services were used; service lifecycle remains coordinator-owned.

- pnpm build: passed contracts and backend compilation.
- pnpm lint and pnpm typecheck: passed across baseline workspace; final backend lint/typecheck passed after the last test adjustment.
- pnpm test: passed 7 repository tooling tests, 6 contracts tests (3 new details tests), 3 backend unit tests and baseline mobile 13 suites/40 tests. The helper worktree contains baseline mobile; these are not evidence for the lead's new mobile implementation.
- pnpm exec prettier --check packages/contracts/src apps/backend/src apps/backend/test: passed final source formatting.
- git diff --check: passed.
- pnpm test:integration: passed final actual PostgreSQL/PostGIS run (5.615 seconds test body, 5.947 seconds total). The suite resets only the allowlisted test schema. It verifies migration003→004 with exact preservation of old summary/order/source/area/fixture state, readiness failure before004 and success afterward, repeat migrations and null metadata read, JSON object constraint; all198 details responses across past/status/areas; max160/unsafe/encoded IDs; missing/outage/disabled catalog separation; strict legacy list shape; OpenAPI; corrupted metadata503; existing DB identity constraint; repeated seed full equality, unrelated preservation and details/source rollback on collision; legacy discovery/filter/pagination checks; spatial queries; worker repeat/failure/retry/parallel exclusion/crash recovery. Development fixture/catalog/source rows were compared before and after with exact equality.
- Initial integration attempt in sandbox hit loopback EPERM; authorized elevated retry reached PostgreSQL. One initial assertion tried to insert an ID mismatch that the existing DB constraint correctly forbids; corrected to assert rejection and reran the full passing suite.
- Full pnpm check was attempted and stops at formatting of pre-existing plans/discover-collections/helper-archive/{plan,tasks,decisions}.md plus copied authoritative stage3 planning files. Source checks above passed independently. Parent has been notified to resolve whole-worktree formatting in its authorized integration scope; no full-check pass is claimed here.

## Limits and parent work

Native/mobile behavior, full integrated pnpm check, current API/native runtime, development migration/reseed, independent testing and review remain parent workflow work. No provider/network compatibility claim. Existing Fastify disableRequestLogging deprecation warning remains pre-existing and unrelated. No dev data was modified by integration.

## Source manifest

- `apps/backend/src/app.ts` — SHA-256 `71f276b4e97880a57fa524bec4be3384343a3f43ce73934e4efd8499a1a9b85d`
- `apps/backend/src/catalog.ts` — SHA-256 `989d560865fa9ae911ab73975594bb9d813b53779dce195be0e16392e52db184`
- `apps/backend/src/db/database.ts` — SHA-256 `03df0595cc4c0973e2bb3ea20838be0b04afbff14bb596e71b63865511e42199`
- `apps/backend/src/db/demo.ts` — SHA-256 `8af4986ff5f1fb47a12b464056f4797ece78c0cd2dc08d0f73bf58a40b97c30b`
- `apps/backend/src/db/event-details-migration.ts` — SHA-256 `0859cabaf477c69b78d902945d9adf57b2cbda805d82af30177877fee9759ee2`
- `apps/backend/src/db/migrations.ts` — SHA-256 `4768356b4df55a608bde0b410c0bc28bd11a9f5b4347186d9f9a7fc680f2e320`
- `apps/backend/test/catalog-integration.ts` — SHA-256 `75b88c0c74aec47edef739d028660aebf759d3b711f2260c80fedb1fd264b149`
- `apps/backend/test/event-details-integration.ts` — SHA-256 `2557017f09537e7dfe1b71fdf1e8f84d4997908b4395214e1db9b1c983caaadd`
- `apps/backend/test/integration.test.ts` — SHA-256 `3a2c8549b946e925c3933d53394e66f2728632f291fd9451745fa96b12a4a3be`
- `packages/contracts/src/catalog.ts` — SHA-256 `8d14d928c934be7ef15bbb3fe8cd7c62331d5e7ba574fbac6c9986f8fc60e0a7`
- `packages/contracts/src/event-details.test.ts` — SHA-256 `e0f84a08886fcce801bb24c4d222de193d9a66418c3a9af6aaa5b91660254f8c`
- `packages/contracts/src/event-details.ts` — SHA-256 `6b663e68ade29356145f517cb108350039b09de66af7496fefb1f6d5c9ce053e`
- `packages/contracts/src/index.ts` — SHA-256 `d766285d585c69743a5029cabf24f12cdc00b3f6803a84234b24f55ae05f0920`
