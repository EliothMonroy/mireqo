> Final outcome (2026-09-18): Successful and delivered in [PR #4](https://github.com/EliothMonroy/mireqo/pull/4). See [review.md](review.md) for commit and cleanup results. The handoff below records the verified pre-delivery state.

# Discover collections — current reviewer handoff

Independent testing passed on 2026-09-18. Review must determine the feature verdict before reviewer-owned delivery. This document is self-contained current review input; no earlier execution records are needed to understand scope or evidence. Read the repository guidance/persona and inspect the actual current modified and untracked implementation.

## Goal and agreed requirements

Implement authorized Discover stage 2 so users can find demo events in Coacalco, Tultitlán and the whole of Mexico City using date shortcuts, categories, collections and paginated lists. User accepted the stage and date rules, then authorized implementation with “implement it.” Existing editorial cards, area persistence and light/dark appearance remain the basis.

- Today and Tomorrow cover their full selected-area calendar day. This Week is today through Sunday. This Weekend is next Saturday/Sunday on weekdays, both days on Saturday, Sunday only on Sunday. The selected area's timezone governs all ranges, currently America/Mexico_City.
- Default includes exact events whose start is at or after the backend browsing instant, date-only events through their local date, then undated events. Explicit calendar filters include earlier starts in the selected day/range and exclude undated events. Do not invent duration, ongoing/completed status, times, availability or prices.
- One date shortcut is active; Upcoming resets it. Discover date is session state and survives area change/back navigation; only area persists across process restart.
- Initial categories are Music, Market, Art, Outdoors and open lists combined with the current date. Free matches explicit free only; unknown or fixed-zero prices are not reclassified. Music matches Music metadata.
- Default collections: Happening Today, This Weekend, Free Events and Music. An active date hides the two temporal collections and filters Free/Music. General all-category results remain reachable.
- Initial loading uses structured placeholders resembling event cards with accessible loading/busy labels; incremental pagination stays compact and refresh retains usable cards.
- Omit successful empty collections. Failed sections keep scoped retry and successful sections visible. Show See All only when additional results exist. Lists start with preview events, inherit full context, paginate deterministically and retain loaded content/recovery on failures.
- Parent date and browsing position survive Android Back/iOS gesture. Area/date changes reset incompatible paging; older responses cannot be shown as a newer context. Refresh/foreground/local midnight renew the backend time generation coherently and label retained old snapshots truthfully.
- Strict legacy `/v1/events` behavior and response shape stay compatible. Validate new request/response semantics and OpenAPI; filter in real PostgreSQL before pagination. Reject mismatched/stale cursors safely and preserve operational/migration/seed safeguards.

Scope excludes details/saving (stage 3), Search, unrelated tabs, accounts, payments, GPS/radius, onboarding/interests, popularity/personalization, advanced filters/custom dates/new sorting, live ingestion, hosting and broad redesign. No new dependency or native configuration is added. Existing cards have no dead detail/save controls.

## Implementation summary

Backend exposes additive `GET /v1/discovery/context?areaId=...` and `GET /v1/discovery/events?areaId=...&context=...&date=...`, optional category OR collection, limit 1–30 and cursor. Strict shared TypeBox schemas/runtime semantic parsers and generated OpenAPI describe both operations; legacy endpoints remain unchanged.

Context is HMAC signed and binds area, demo dataset, effective instant/local date, 24-hour expiry. API restart or dataset change invalidates it. Cursor binds the complete context, date/category/collection, ordering version and exact boundary key/ID; the boundary must still belong to the filtered query. Database failures remain 503; invalid contexts/cursors/combinations 400; unknown area 404.

SQL applies exact-time or selected-area calendar eligibility, category and Free discriminant before limit. Existing JSONB/order index supports the scoped catalog; no migration added. Explicit transactional fixture seed expands to 66 stable records/area (198 total), version `demo-v2:<referenceDate>`, preserving existing IDs, owner checks, unrelated rows and missing/status examples. API reads never move demo dates.

Mobile uses a shared Discover session provider plus independent preview/list Query hooks. Query identity includes area, generation, date and category/collection; same-scope old results survive generation failures with stale messaging. Backend time renews on refresh, foreground and local-day change; child renewal updates the parent generation. Two-event previews open six-event native stack lists from their first page. Thin route validation, reusable cards, accessible selected date controls, scoped recovery, and existing SQLite area preferences preserve architecture boundaries. Replaced the former single discovery hook with focused session/results/catalog modules. Architecture/build state descriptions updated.

Initial context, preview and full-list loading share two themed event-card placeholders with image/title/metadata shapes, one accessible loading/busy region and hidden decorative blocks. Pagination retains a compact indicator; refresh preserves real cards. Three focused rendering tests cover these pending and retained states. Tester also added the focused midnight-renewal host test; no application changes were made by the tester.

## Passing acceptance evidence

| ID   | Required outcome                                                                            | Passing evidence                                                                                                                                                                                              |
| ---- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC01 | Area selection/persistence for all 3areas and whole Mexico City                             | Independent iOS all 3selections; independent Android Coacalco flow; SQLite/preference tests; successful native relaunch restores Tultitlán and default date; live API confirms all areas.                     |
| AC02 | Exact local date ranges, undated exclusion, selected/reset UI                               | Deterministic calendar/SQL boundary tests;111 independent live result-set comparisons; independent iOS all 4date choices/reset; Android Tomorrow selected state; tester midnight host assertion.              |
| AC03 | Upcoming exact cutoff, date-only/undated ordering and truthful metadata                     | Real SQL inclusive cutoff/midnight fixtures, complete expected-ID comparisons, existing display-format tests and native presentation inspection.                                                              |
| AC04 | Combined category+date, explicit Free, Music, general access                                | Real SQL and live comparisons for all dates/categories/collections; independent native Music+Tomorrow and general See All.                                                                                    |
| AC05 | Four default collections, active-date composition, empty/scoped recovery/See All            | Host composition/section tests, native iOS active-date assertions and successful controlled partial/empty/retry tests.                                                                                        |
| AC06 | Correct list scope/preview continuity, no skipped/duplicate pages, safe cursor rejection    | Real PostgreSQL query/cursor suite, full live expected-ID comparisons using page size 2, independent iOS actual page append/context.                                                                          |
| AC07 | Parent back/gesture position, area/date retention, old response isolation                   | Independent Android exact See All bounds restored; iOS within 3points after gesture; all 3area Tomorrow retention; host delayed old area/filter tests.                                                        |
| AC08 | Loading/empty/first/partial/cached-refresh/pagination/offline recovery and coherent renewal | Host states/renewal/races, added local-midnight test, real SQL empty/outage; native scoped partial, empty, cached Discover refresh and pagination retry; Android actual connectivity-off with cached content. |
| AC09 | Legacy compatibility, strict contracts/OpenAPI, operational safeguards                      | Independent real integration and host suites: legacy shape, invalid requests/responses, OpenAPI, seed/migration/import safeguards.                                                                            |
| AC10 | Actual Android/iOS changed flow and light/dark/enlarged text                                | Independent core native repeats; inspected current runtime dark/enlarged screenshots and successful native results, with source/device identity below.                                                        |

## Independently executed checks

Toolchain: repository-pinned mise Node 24.20.0 / pnpm 12.3.4. Commands from the authoritative checkout, using `/Users/eliothmonroy/.local/bin/mise` on this host.

- `mise exec -- pnpm check`: PASS on the current structured-loading source. Build/lint/typecheck/format, tooling tests,3 contract tests,3 backend unit/HTTP tests,13 mobile suites / 40 tests. Durable output: `evidence/tester-loading-host-check.txt`.
- `mise exec -- pnpm test:integration`: PASS against real isolated PostgreSQL 17.5 / PostGIS 3.5.2 on 54330. Resets only allowlisted test schema; read-only dev 54329 preservation assertion. Covers fresh/repeated/prior-schema migrations, catalog/seed repeatability/rollback/ownership, SQL exact/day/undated/calendar/filter behavior, cursor generation/filter/boundary/reseed/expiry/restart validity, legacy/OpenAPI/errors, PostGIS and import concurrency/process-loss. Durable output: `evidence/tester-integration.txt`.
- Independent read-only HTTP probe:111 exact ordered-result comparisons (37 each area) against independently calculated calendar/instant/category/price expectations derived from the 66 legacy records/area. Discovery page size 2, uniqueness asserted, all date/category/collection modes. Durable output: `evidence/tester-api.txt`; script `/tmp/mireqo-tester-api.py`. No dev mutations.
- New host regression: crosses selected-area midnight, observes one fresh server context, retained Weekend choice, updated local date, no repeated same-day renewal. Existing foreground/failure/race/shared-parent renewal tests also pass. `evidence/tester-rollover.txt`.
- `git diff --check` and current 91-file source manifest verification: PASS. Actual modified/untracked source inspected for unintended scope/debug code/secrets; no finding.

## Current initial-loading evidence

Independent full `pnpm check` passed on the current 91-file source: 40 mobile tests across 13 suites, plus build/lint/type/format, contracts/backend/tooling checks. The focused rendering tests prove pending context/preview/list card structure, real-content transitions, compact incremental loading and retained refresh cards.

Independent native delayed-response checks passed all three initial entry points on both platforms, in light/default text and dark/enlarged text. A read-only relay held real context, preview and first-list HTTP responses separately, then released the unchanged payloads. Native loading labels/busy regions were observed and disappeared on release; full lists resolved to the real Sounds in the garden event. No database mutation or fabricated event response was involved.

- iOS iPhone 17 Pro/iOS 26.5: `Check.testLoadingAppearance`, one passed/zero failed in each appearance configuration, dark/accessibility-extra-large run 44.096 s. Actual result bundles: `/tmp/mireqo-ios-verification/tester-loading-light-verified.xcresult` and `tester-loading-dark-large-verified.xcresult`. Eight `evidence/tester-ios-loading-*.png` images, two `tester-ios-loading-*-summary.json` summaries and `tester-ios-loading.txt` preserve observations.
- Android Medium Phone/emulator-5554/Android 17: all three states passed in light / font 1.0 and dark / font 1.3, including native accessibility labels with busy suffix and real-content resolution. Eight `evidence/tester-android-loading-*.png` images and `tester-android-loading.txt` preserve observations.

Tester visually inspected representative native captures across entry points and both themes/platforms: rounded cards contain image/title/metadata structure, controls and enlarged text remain readable and scrollable. Existing physical-device/audio/native-build coverage limits below remain. The relay and alternate API are stopped; both devices restored to light/default text.

## Native evidence and limits

Installed existing `com.mireqo.app` development shells run current feature JavaScript from Metro 8081. No native dependency/configuration changes; no new native application compilation is claimed.

**Independent Android:** Medium Phone emulator-5554, Android 17 / API 37.1. Actual UI hierarchy/touch/system Back verified Today See All context, parent See All bounds restored exactly `[651,199][1017,330]`, Tomorrow selected state, Music+Tomorrow context/event, Back. `evidence/tester-android.txt` and five `tester-android-*.png` screenshots. Android implementation verification additionally observed full pagination, area/date changes, dark/font-scale 1.3 use and actual Wi-Fi/data-off cached/offline state; tester inspected representative dark/list/offline images.

**Independent iOS:** iPhone 17 Pro simulator, iOS 26.5 / build 23F77, UUID `C588ADDD-FC8A-48E8-BA7D-B14D9093962D`; Xcode 27.0. User-authorized temporary XCUITest runner passed `Check.testDiscovery`, 1 test / 0 failures, 55.256 s. All 4date choices/reset, all 3areas retaining Tomorrow, Music+Tomorrow, native edge-swipe preserving date, See All Load more, parent position within 3points. Tester inspected page-two screenshot showing additional Art card beyond page-one Market boundary. `evidence/tester-ios.txt`, 11 `tester-ios-*.png` screenshots; full `/tmp/mireqo-ios-verification/tester-flow-pass.xcresult`.

Native repeat command:

```sh
xcodebuild test-without-building \
  -project /tmp/mireqo-ios-verification/MireqoCheck.xcodeproj \
  -scheme MireqoCheck \
  -destination 'platform=iOS Simulator,id=C588ADDD-FC8A-48E8-BA7D-B14D9093962D' \
  -derivedDataPath /tmp/mireqo-ios-verification/build \
  -resultBundlePath /tmp/mireqo-ios-verification/reviewer-replay.xcresult \
  -parallel-testing-enabled NO \
  -only-testing:MireqoCheck/Check/testDiscovery
```

Use a new result path for any repeat and only one Xcode test at a time.

**Additional current implementation evidence assessed independently:** actual xcresult summaries show `recovery-pass` 2/2 passed, `dark-large` 1/1 passed, `relaunch` 1/1 passed. Tester read runner assertions and representative screenshots. Controlled iOS HTTP consumer tests establish scoped Free 503/retry with other content retained, all-empty guidance/recovery, pagination failure/retry with existing cards retained, cached Discover refresh failure/retry with the same event retained. SQL semantics are established by the real independent database suite, not the controlled responses. iOS dark/accessibility-extra-large controls and category list were usable; relaunch retained area and reset date. Native result extracts reside in `evidence/ios-xctest-results.txt`.

Coverage is bounded: physical devices, screen-reader audio, release signing, new native app compilation and iOS-wide connectivity loss were not exercised. Android supplies native connectivity-off evidence. The list-footer-specific refresh retry interaction is outside the claimed native observations; cached-refresh recovery is verified through native Discover plus the shared child/parent renewal host test. Pagination retry has separate native/host evidence. Live provider compatibility and production scale are excluded from this stage.

## Current source and workspace inventory

Base and current HEAD: `b3ef0fa6c9867fb50010b165246f35c02cad3365`. Feature source is uncommitted, including21 new source/test files and the new plan/evidence directory. Review must include untracked files rather than only the committed branch diff.

Current 91-file manifest `plans/discover-collections/code-state.sha256` SHA-256: `1a205be5c7df30331a7703472c49af617a16e2a3223fe26fc011ad98a8b98a1b`. Current source includes the shared structured initial-loading UI, three focused rendering regressions and the tester midnight regression. New independent native pending-state observations and the final 40-test mobile check cover the current presentation. Backend/contracts and other interaction/data behavior are unchanged; prior independent SQL/API/core navigation results remain applicable.

| Resource                                                                              | Current ownership/state                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/Users/eliothmonroy/Documents/Github/mireqo`                                         | main at base; original planning records preserved. Do not overwrite unsaved work.                                                                                                                                       |
| `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/discover-collections`         | Authoritative complete implementation/docs/evidence, branch `codex/discover-collections`, same base. Reviewer owns successful delivery from here.                                                                       |
| `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/discover-collections-backend` | Backend helper branch `codex/discover-collections-backend`, same base. Its implementation was integrated into authoritative checkout; preserve until reviewer verifies safe cleanup.                                    |
| API 3000                                                                              | PID 43096, root-owned session 85606; `/tmp/mireqo-collections-api-final.log`; same authoritative source. Temporary loading relay and API 3002 stopped.                                                                  |
| Metro 8081                                                                            | Session 33459; `/tmp/mireqo-collections-metro.log`; authoritative source.                                                                                                                                               |
| Databases                                                                             | Existing dev 54329 persistent and isolated test 54330; Docker context `colima-mireqo`; development seed 2026-09-18. Preserve development data.                                                                          |
| Native environments                                                                   | Android emulator 5554 and iOS UUID above remain; standard connectivity/reverse and light/default text restored. No active fault proxy or alternate API listener.                                                        |
| Temporary verification                                                                | `/tmp/mireqo-ios-verification` runner/results/logs; `/tmp/mireqo-tester-*` probes/logs/exports; `/tmp/mireqo-discover-collections-backend.patch` integrated helper patch. Durable evidence copied into feature records. |

T01 current verification complete. R01 re-review is ready; R02 delivery remains unstarted. No implementer/tester commit or push. After Successful, reviewer follows reviewer.md: dated changelog, useful future ideas if warranted, focused `feat - ...` commit, push/PR, safe cleanup preserving PR branch and unpreserved work. No merge, release or deployment authorized by this workflow.
