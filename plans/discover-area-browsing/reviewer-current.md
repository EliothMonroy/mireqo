# Current reviewer handoff — Discover area browsing

Independent testing passed. Review feature success independently, then follow reviewer.md for delivery. No application changes, commits or pushes were made by the tester.

## Goal and clarified requirements

Stage 1 provides manual selection of Coacalco and Tultitlán municipalities in Estado de México and Mexico City as the entire city/all boroughs; a single backend-served demonstration event list; SQLite selected-area persistence; truthful cards; loading, empty, retry, refresh, pagination and retained-session recovery. Exact assigned catalog membership defines inclusion. Demo disclosure must be visible. Full Discover remains incomplete: collections/date/category filters, details/save, tabs, GPS, search, accounts, live sources and production hosting are excluded.

First launch has no automatic selection. Warm neutral/charcoal native StyleSheet presentation and system fonts are approved. Demo dates change only through explicit backend seeding; current reference is 2026-09-07. Architecture-selected Query/SQLite additions and compatible connectivity dependencies are exactly pinned. Unknown price is omitted and device timezone never changes event-local dates.

## Implementation and state

Worktree `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/discover-area-browsing`, branch `codex/discover-area-browsing`, base `37c8077b7e09edaa155858ef8b280e3d11ec0780`. Actual code is uncommitted, including untracked files. Inspect the working tree, not only committed history. `code-state.sha256` has 73 verified files, aggregate `fbe7d9ce3b03a66d4a41c0c6f527e48ff784b101b55b248a09d5b66a4db83a12`; subsequent testing/native-build notes and screenshots are documentation-only.

Shared TypeBox contracts describe areas/event summaries, validated calendar/money/status unions, demo metadata and cursor pages. Migration003 adds catalog/source identities without changing applied migrations. Exact indexed membership/order queries bind cursors to area, ordering boundary and dataset. Explicit repeatable transactional seeds and serving are limited to local development/test. Existing worker has no live source adapters.

Mobile bootstrap owns Query lifecycle/connectivity and SQLite preference storage. Response validation precedes cache insertion, query keys isolate areas, cancellation avoids stale work and preference writes serialize. Shared cards format truthful event information and original illustrative art/fallbacks. Location and Discover features remain independent; routes compose them. Native TypeBox resolution is scoped to its published CommonJS export for Metro compatibility.

## Passing evidence

Read [testing.md](testing.md) as the self-contained independent verification record and [native-builds.md](native-builds.md) for exact native commands/logs. Plan acceptance criteria 1–9 passed with explicit evidence provenance.

- Independent `mise exec -- pnpm check`: build/lint/types/format plus 7 tooling, 2 contract, 2 backend and 24 mobile tests in 8 suites pass.
- Independent `mise exec -- pnpm test:integration`: real PostgreSQL17.5/PostGIS3.5.2 isolated database migrations, seed repeatability/rollback, exact membership/tied pages/cursors, HTTP/OpenAPI errors and worker/operational preservation pass.
- Independent live HTTP probe: 10 unique events per area across 4 pages at limit3; Mexico City five borough labels; explicit demo version/date; invalid requests400, unknown area404, documented503, healthy readiness/liveness.
- Android/iOS native compilation succeeded with new native dependencies. Tester verified installed Android APK and iOS dylib match build artifacts and running Metro/API paths match this worktree.
- Fresh Android area selection/restart and iOS cold launch show current API-backed catalogs and SQLite persistence. Tester assessed recorded native states separately: both platform light/dark/enlarged text, loading/empty/first failure/refresh recovery, truthful cards/fallback, accessible selection and pagination. Offline/incremental failure evidence is Android-specific; iOS has actual backend-outage recovery and successful pagination. Fresh iOS selector/fault interactions were not repeated by tester. See the precise distinctions and screenshot links in testing.md.

No live provider, physical device, VoiceOver audio, production distribution or complete Discover acceptance is implied.

## Delivery and cleanup inventory

Authoritative feature branch/worktree above owns integrated source and records. Related helper worktrees are `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/discover-backend` on `codex/discover-backend` (integrated backend work), and `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/discover-mobile-ui` on `codex/discover-mobile-ui` (unused). Verify preservation before cleanup. Main checkout has original planning records; this feature worktree has authoritative current records.

API PID93414/session16023 on3000, Metro PID91597/session90651 on8081, simulator UUID above in testing.md and emulator5554 remain available. Dedicated Colima profile and development54329/test54330 databases predate tester work; do not delete development data. `/tmp/mireqo-tester-check.log` and `/tmp/mireqo-tester-integration.log` hold independent run output; build logs are identified in native-builds.md. Screenshot evidence is in this feature's evidence directory. All task source remains uncommitted for reviewer-owned verdict/delivery; no release or merge is authorized by this handoff.
