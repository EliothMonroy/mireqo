# Event Details and Saved implementation

Status: implemented and verified; ready for independent tester. Current combined host checks, real database integration and bounded Android/iOS native journeys passed. This is not the final feature-success verdict. No commits or pushes.

## Authoritative state and ownership

- Base main: dee988f521e0fb6dc80b6257c003276abab10f1c.
- Authoritative branch/worktree: codex/event-details-saved at /Users/eliothmonroy/Documents/Github/mireqo/.worktrees/event-details-saved. Planning documents were copied here before source changes; this is the current durable record.
- Lead implementer owns mobile, integration, architecture/build updates and this record.
- Backend helper branch/worktree: codex/event-details-backend at /Users/eliothmonroy/Documents/Github/mireqo/.worktrees/event-details-backend, same base; no commits. Its reviewed13-file manifest was copied into the authoritative worktree. See [backend integration evidence](backend-implementation.md). Source patch remains /tmp/mireqo-event-details-backend.patch.
- Coordinator owns native devices/API/Metro and [native readiness/evidence](native-readiness.md). No native dependency/configuration change; existing installed native shells are reused, not freshly compiled app binaries.

## Implemented behavior

Additive strict details response preserves the old summary contract and exposes nullable description/address/end/external URL with area/demo provenance. Stable IDs allow existing colons and max160 characters. Migration004 adds nullable JSONB; explicit v3 seed preserves198 IDs and old summaries. Global ID lookup distinguishes404, invalid400 and outage503, including cancelled/past/cross-area IDs; no live source or saved backend table. OpenAPI and real SQL verification were integrated together.

Discover/category/collection cards open one shared ID route and save independently. Discover and Saved are real primary tabs; Discover retains its own index/list stack and `/events` URL while details lives above tabs. Thin routes have invalid/direct-entry recovery. Details displays known metadata, nullable fields truthfully, expandable description, native share, safe venue lookup and labeled external demo example page. Cancelled/past events omit the external page action. Native action failures remain recoverable. Fetch and interrupted-response-body failures normalize to a friendly catalog-unavailable message; typed HTTP400/404/503 and request cancellation retain their original semantics.

One reactive SQLite store coordinates all saved membership and snapshots. Initial hydration gates controls. Optimistic changes publish immediately; queued atomic writes confirm or reconcile latest failure against disk-confirmed membership, with retry. Per-ID revisions prevent stale refreshes resurrecting removed/resaved entries. Summary resaves preserve richer known details and refresh time. Saved records use null prototypes so valid IDs cannot collide with inherited JavaScript properties. Persisted snapshots validate IDs and contracts and distinguish summary capture from successfully refreshed details. A failed refresh does not advance freshness or remove saved entries.

Both area and saved adapters share a local-I/O queue. This prevents exclusive native transactions from racing across separate connections while keeping Saved independent of remote area/context hydration. Namespaced additive migrations preserve selected-area/unrelated data. This was added after the first Android upgrade observation showed a recoverable initial saved-hydration error; repeat process-absent cold native validation passed on Android; iOS hydration and restart also passed.

Saved defaults Upcoming, separates undated entries, and sorts dated events chronologically. Past sorts by known completion where available, otherwise calendar date without inventing an end instant. Known ends enter Past at equality; absent ends enter Date passed after the event-local day. A foreground listener and one-second clock update boundaries. Manual refresh processes current saved IDs serially, guarded against newer membership intent. Offline snapshots include local artwork/fallback and remain usable without remote area loading.

## Source areas

- Shared contracts: packages/contracts/src/event-details.ts and exports, semantic/unit tests.
- Backend: app/catalog/database/demo/migrations and event-details migration; additive HTTP and PostgreSQL integration coverage.
- Mobile persistence/rules: data/{saved-store,saved-sqlite,saved-context,local-io,event-details,event-actions}, domain/saved-event, area-sqlite queue integration and tests.
- Mobile presentation: EventDetailsScreen, SavedScreen, EventCard callbacks/accessibility, EventStates placeholders/notices, Discover card composition, persistent tab/Discover stack routes.
- Bootstrap: shared saved provider alongside Query/area/session providers.
- Documentation: architecture.md and build.md distinguish implemented stage3 from deferred work. Historical helper-archive Markdown is preserved byte-for-byte and excluded from formatting; current source/records remain checked.

## Verification to date

Commands use /Users/eliothmonroy/.local/bin/mise exec -- and pinned pnpm. Frozen offline installation succeeded with no dependency/lockfile changes.

- Integrated pnpm check passed after main implementation: build, lint/import boundaries, strict typecheck, formatting,7 tooling tests,6 contracts tests,3 backend HTTP/domain tests and21 mobile suites/69 tests, including local-I/O concurrency, transport normalization and route recovery checks.
- Integrated pnpm test:integration passed (5.545seconds total) against allowlisted test54330, comparing development54329 data unchanged. Includes all198 ID detail lookups, additive migration003→004 and repeat migration preservation, null old-row detail reads, strict legacy list/discovery compatibility, malformed/status/404/503 cases, seed rollback/ownership, spatial checks and worker/process recovery.
- Host tests cover end equality, event-local midnight/year/leap-day, undated/status independence, completed-order sorting, snapshot validation, rapid save/remove/save and restart, older/latest write failure/retry, stale refresh after removal, richness preservation, unsafe URL/real native adapter contracts, offline summary details, missing direct details, Saved default groups/order and card action independence. These are controlled host tests, not native persistence proof.
- The current transport boundary passed actual Android API-off cold launch with a friendly recovery message; Android and iOS refresh recovery retained membership and advanced only successful refresh timestamps.
- git diff --check passed at integration review. Current source SHA-256 fingerprint: 4cc4e87a46cd8badf5d923c20a5d25899e15ccb8e8cd11887ac8f72249b35d56; full file hashes are in source-manifest.json. Native verification must match this state or a superseding manifest.

## Native and remaining workflow

Coordinator completed bounded verification on Android emulator5554 and iOS26.5 iPhone17Pro C588ADDD-FC8A-48E8-BA7D-B14D9093962D against the actual local API/database. UI testing uses the separate /tmp/mireqo-details-ios runner; unrelated simulator state is preserved. See coordinator-owned native records for observations and exact coverage.

Implementation verification is complete. Detailed passing coverage and honest limits are recorded in [Android native evidence](android-native.md) and [iOS native evidence](ios-native.md). Native runtime source 1382b46a1a24d5f26e6587109f53c80384739d345be17718902841e0e20a6efe covers unchanged navigation, presentation, persistence and platform adapters. Subsequent isolated snapshot-selection and description truncation/control consistency corrections were verified with focused host tests; no platform integration changed. Android radio-off/API-off cold restart and iOS API-unavailable cold restart retained SQLite snapshots/preferences. Native share and location handoffs passed both platforms; Example Domain rendered on iOS, while Android launched Chrome first-run without accepting terms. Dark/enlarged content was inspected on both. Summary-only offline, exact clock edges, unsafe URLs and injected write failures have host evidence rather than identical native repetitions. Tester/reviewer remain separate roles. Release/physical-device distribution, live provider behavior and public link hosting remain outside scope.

## Handoff to independent tester

Use the actual authoritative working tree including untracked files. Read plan.md, decisions.md, tasks.md, this implementation record, backend-implementation.md, platform-native records and source-manifest.json. Next owner is the independent tester. No application changes remain pending; no observed current defect remains. Services/device inventory is in native-readiness.md and workspace-current.md. Preserve snapshots and unrelated devices; no implementer commits/pushes were made.

For later reviewer input, use implementation-current.md and tester-curated passing evidence rather than historical execution sections.

## Tester-return AC07 correction

Independent tester reproduced reopening Details within Query’s60-second freshness window after Saved refreshed newer information: fixed query-first precedence displayed the older description. The screen now uses domain newestEventSnapshot, selecting only same-ID candidates, complete details by successful refreshedAt, and summary-only candidates by capturedAt. Full snapshots retain priority over summaries to preserve available metadata. It returns the original object without mutating freshness, query identity or membership.

Tester regression passes. Additional focused tests establish both candidate orders, summary completeness, timestamp preservation, other-ID exclusion and failed404/503 refreshes retaining newer saved content alongside the correct notice. Pinned full check passed21 mobile suites/67tests plus existing tooling/contracts/backend checks; git diff --check passed. Backend/SQLite/native adapters unchanged, so prior real SQL and representative native evidence remains applicable to those paths. Application/test source frozen for the same tester’s independent recheck. No commit/push.

## Reviewer-return R1 correction

Review R1 identified accepted short multiline descriptions capped at five lines without a Show more control. EventDetailsScreen now uses the same canExpandDescription condition for truncation and control visibility: descriptions of200 or fewer characters have no line limit; longer ones retain five-line collapse and Show more/Show less. No overflow measurement or new dependency is introduced.

The reviewer’s57-character six-line description is covered by a screen regression that confirms the text has no line cap and the final line remains available. A companion test exercises long-description expansion and collapse. Focused screen suite passed7 tests; pinned full check passed21 mobile suites/69tests plus7 tooling,6 contracts and3 backend tests. Formatting and diff checks passed. Existing native expanded-description evidence remains relevant; this narrow condition has explicit host coverage rather than an additional blanket native run. Source is frozen and handed back to the same independent tester. No commit/push.
