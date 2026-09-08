# Implementation record

Authoritative working copy: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/discover-area-browsing` on `codex/discover-area-browsing`, based on verified `main` revision `37c8077b7e09edaa155858ef8b280e3d11ec0780`. Planner records deliberately copied from root on 2026-09-07; all subsequent implementation records live here. Root has only original planning files. No commits or pushes by implementers.

Bounded backend helper owns `packages/contracts` and `apps/backend`, plus its `backend-notes.md`, in `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/discover-backend` branch `codex/discover-backend` from same base. Parent owns integration, dependencies, mobile bootstrap/data and combined verification. Shared contract must freeze before mobile implementation.

Status: implementing, not yet verified.

## Implemented scope and integration

DAB-03/04 backend helper's disjoint files were reviewed and copied deliberately; [backend notes](backend-notes.md) record inventory and detailed SQL/seed verification. Parent implemented DAB-05/06 locally because runtime refused the additional UI helper. The unused `codex/discover-mobile-ui` worktree remains unchanged for reviewer cleanup.

- Shared TypeBox area/event/request/response schemas validate values, calendar/instant semantics, money ranges and area membership. SQL uses exact area membership and stable keyset pages; demo metadata includes a fixed reference date/version. All30 fixtures are backend-seeded, with original bundled art, explicit missing/failure images and multiple Mexico City boroughs.
- Migration003 preserves001/002, adds catalog/source identity and indexed browsing; readiness now requires all catalog tables. Demo serving and explicit transactional seeding guard the allowlisted local development/test target and refuse production.
- Mobile bootstrap composes Query lifecycle/connectivity, SQLite preference ownership, Discover and independent location selector. Query identity includes area; responses validate before insertion; cancellation and isolated keys prevent old-area races. Writes serialize and current-intent failure can retry. No event catalog is persisted after restart.
- Native StyleSheet shared tokens provide warm light/charcoal dark appearance. Original illustrated cards show truthful local schedules, nullable metadata, money and cancellation/postponement. Unknown price is omitted. Manual area choice, modal change/close, refresh, paging/retry and empty recovery are real controls; no save/details/tabs are implied.
- [Artwork origins](artwork.md) record the four generated originals. Architecture/build now distinguish this slice from later product scope.

## Dependency and native integration decisions

Exactly pinned `@tanstack/react-query@5.102.8` (queried package registry) and `expo-sqlite@57.0.2` / `expo-network@57.0.1` (verified against Expo57.0.20 bundledNativeModules.json). No existing version upgrade. Lockfile updated and workspace installed through mise/pnpm. Native rebuilds required and coordinator is collecting actual Android/iOS checks.

Native launch exposed TypeBox0.33.24 ESM's exported `Object` shadowing Metro's generated `Object.defineProperty` shim. The focused Metro resolver selects the package's published CommonJS export only for TypeBox, leaving all other resolution/version pins unchanged. Mobile source typechecking explicitly permits `.ts` imports because contracts expose source to Metro while backend build rewrites extensions. Native recheck is required after clearing Metro cache; host tests alone do not close this item.

## Implementer checks as of 2026-09-07

- `mise exec -- pnpm check`: PASS after latest mobile/Metro/readiness changes. Build, strict types, lint, formatting;7 tooling tests,2 contract tests,2 backend HTTP/config tests and24 mobile tests across8 suites.
- Mobile tests include delayed area response isolation, unknown stored area, refresh preserving data/recovery, pagination failure/retry, serialized persistence/latest-intent/restart, local migration/write failure/retry, bound selected-only SQL writes, runtime response validation, date timezone/calendar semantics, all price variants and actual empty/retry UI actions.
- `mise exec -- pnpm test:integration`: PASS on authoritative combined tree after readiness update; real allowlisted PostgreSQL/PostGIS54330, including fresh/repeated/upgrade migrations, operational record preservation, all area pages/ties, stale/cross-area/forged cursor errors, seed identity/idempotence/unrelated-row preservation/transaction rollback, empty catalog/table outage responses, OpenAPI and worker crash recovery. Development operational data unchanged.
- `mise exec -- pnpm db:migrate`, `db:seed`, and `db:seed:demo 2026-09-07`: PASS on local development54329. Running API directly verified Mexico City borough membership and demo metadata.
- `git diff --check`: PASS. No commits/pushes; native generated files remain ignored. Existing Fastify deprecation and React-version lint autodetection warnings are unrelated and checks pass.

## Implemented and verified → tester

Actual platform evidence is recorded in [Android native checks](android-native.md) and [iOS native checks](ios-native.md), with screenshots in evidence/. Both rebuilt native apps loaded the current shared catalog code and exercised area choice/persistence, truthful cards and recovery. Platform coverage is explicitly distinguished in those notes.

Native QA also fixed card intrinsic image scaling/category placement and capped only fixed masthead/title text scaling1.6 so accessibility sizes preserve a usable viewport. Backend cursor-boundary database failures now remain503 rather than being mistaken for invalid cursors; real integration regression and repeated Android native fault/retry pass. API was restarted on this final implementation.

Final combined check passes after the last masthead change. Final real integration pass includes the cursor-outage regression; later change is presentation-only. `code-state.sha256` records the current code/dependency fingerprint for independent tester comparison. Current worktree is uncommitted and unstaged, with all related files available for inspection. No implementation blockers remain; feature success and delivery are still owned by independent tester/reviewer stages.

Runtime inventory: API session16023 (`/tmp/mireqo-discover-api-current.log`), Metro coordinator-owned on8081, dedicated development54329/test54330 databases, iOS simulator above and Android emulator5554. Devices restored to normal appearance/text settings; no active fault. Root planner records were intentionally not overwritten; this worktree is authoritative. Backend helper and unused mobile-helper worktrees remain for reviewer safe cleanup.
