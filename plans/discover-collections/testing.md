# Discover collections — independent testing

Tester verdict: **Required verification passed**, including the structured initial-loading correction, 2026-09-18. Current source is the 91-file manifest `1a205be5c7df30331a7703472c49af617a16e2a3223fe26fc011ad98a8b98a1b`; current correction evidence is recorded below. T01 is complete; the reviewer owns the feature verdict and delivery. No application fixes, commits, pushes or delegation were performed by the tester. The tester added one focused host regression test for selected-area midnight renewal.

## Initial tested state (preserved evidence)

Authoritative checkout: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/discover-collections`, branch `codex/discover-collections`, base/HEAD `b3ef0fa6c9867fb50010b165246f35c02cad3365`. Inspected actual tracked modifications, deleted old discovery hook/tests and all 20 new application/contract/test files, including untracked files. No new dependencies, native configuration or database migration were introduced.

Current 90-file `code-state.sha256` manifest SHA-256: `e22eac084621ca39ee7c50f02ac2c2e2e691c6df6ddfd15fef40ac4d646ffc78`. The only source-manifest change from implementation verification (`3632868b18dacfe33167967847dc55aac5cd00334397427186974bc27450d74a`) is `apps/mobile/src/data/discovery-session.test.tsx`; application/runtime source is identical. Native and backend evidence therefore applies to the current application. Final full host check includes the added test.

## Independently executed checks

All commands ran from the authoritative checkout using `/Users/eliothmonroy/.local/bin/mise` (Node 24.20.0, pnpm12.3.4).

- `mise exec -- pnpm check`: passed initially and again after the new test; build, lint, typecheck, formatting, tooling tests,3 contract tests,3 backend unit/HTTP tests,12 mobile suites /37 mobile tests. Evidence: `evidence/tester-host-check.txt`.
- `mise exec -- pnpm test:integration`: passed against real isolated PostgreSQL 17.5 / PostGIS 3.5.2 on 54330, with development54329 used only for preservation assertions. Runtime 4.996s; fixture clock 2026-09-18T20:00Z. Covers fresh/repeated migrations, prior-schema upgrade preservation, SQL filtering before small pages, boundary membership, same-time ordering, preview/list continuity, default and calendar eligibility, Free versus fixed-zero/unknown, category identity, malformed/context-mismatched cursors, expiry/reseed/restart, legacy routes, outage503, generated OpenAPI, seed ownership/rollback, import locks and process-loss recovery. Evidence: `evidence/tester-integration.txt`.
- Read-only live API probe `/tmp/mireqo-tester-api.py`:111 independent expected-result comparisons (37 per area). Paginated legacy66-record catalog supplied input records; an independent Python calendar/instant/category/price predicate computed the expected IDs for every date mode, each category, Free/Music, and default temporal collections. Compared complete ordered IDs from discovery pages of size 2 and asserted uniqueness. All passed for Coacalco, Mexico City and Tultitlán; no development database mutations. Evidence: `evidence/tester-api.txt`.
- Added and passed `selected-area midnight renews relative dates without clearing the date choice`: fake clock crosses Mexico City midnight from05:59:50Z, confirms exactly one new context after 15 seconds, retained Weekend selection, updated local date, and no repeated renewal on the next same-day tick. Existing tests also prove foreground refresh, failure retention, query identity races and shared list/parent generation renewal. Evidence: `evidence/tester-rollover.txt`.
- `git diff --check`: passed. Source manifest checked after test edit;90 files match. Reviewed changes for unrelated scope, debug code and secrets; no finding.

## Native verification and provenance

Both platforms run the existing installed `com.mireqo.app` development shell with current feature JavaScript from Metro 8081. There are no native dependency/configuration changes; this evidence is launch/interaction verification, not a fresh application compilation.

**Independent Android repeat:** Medium Phone emulator-5554, Android 17 / API 37.1. Read native UI hierarchy and executed actual touch/Back events. From nonzero Discover scroll position, opened See All and asserted `Coacalco · Today`; system Back restored the exact See All bounds `[651,199][1017,330]`. Selected Tomorrow and asserted selected accessibility state, opened Music and asserted `Coacalco · Tomorrow` plus the corresponding Music event, then returned using system Back. Five screenshots `evidence/tester-android-*.png` and `evidence/tester-android.txt` capture these observations. Independently visually inspected the Tomorrow/Music screenshot: correct September19 local time, truthful demo label, no invented unknown price, readable wrapping.

**Independent iOS repeat:** iPhone 17 Pro simulator, iOS 26.5 / build 23F77, UUID `C588ADDD-FC8A-48E8-BA7D-B14D9093962D`, Xcode 27.0. Replayed the user-authorized temporary XCUITest runner using:

```sh
xcodebuild test-without-building \
  -project /tmp/mireqo-ios-verification/MireqoCheck.xcodeproj \
  -scheme MireqoCheck \
  -destination 'platform=iOS Simulator,id=C588ADDD-FC8A-48E8-BA7D-B14D9093962D' \
  -derivedDataPath /tmp/mireqo-ios-verification/build \
  -resultBundlePath /tmp/mireqo-ios-verification/tester-flow-pass.xcresult \
  -parallel-testing-enabled NO \
  -only-testing:MireqoCheck/Check/testDiscovery
```

Passed 1 test / 0 failures in 55.256 s. Independently observed/asserted all four date controls and reset; all three area selections retaining Tomorrow; Music+Tomorrow context and event; iOS edge-swipe return preserving date; general See All pagination; parent See All vertical position restored within 3points. Exported 11 screenshots as `evidence/tester-ios-*.png`; passing result extract `evidence/tester-ios.txt`. Visually inspected page-two image: additional Art card appears after page-one Market boundary, validating actual appended content alongside the runner's footer assertion.

**Assessed implementation-stage native evidence:** inspected the actual successful `recovery-pass.xcresult`, `dark-large.xcresult`, and `relaunch.xcresult` summaries with xcresulttool. Respectively2/2,1/1 and1/1 passed. Read runner assertions and inspected representative iOS dark/enlarged controls and refresh-error screenshot, Android dark/enlarged list and offline screenshot. iOS controlled native consumer checks establish scoped Free failure/retry with other content retained; all-empty guidance/recovery; pagination failure/retry preserving existing cards; cached Discover refresh failure/retry preserving the event. These controlled HTTP responses establish UI behavior; independent real PostgreSQL tests establish SQL behavior. Android implementation observations establish Wi-Fi/data-disabled offline banner with cached content, actual pagination and dark/font-scale 1.3 usability. iOS uses accessibility-extra-large dark presentation, then restores light/large. Relaunch confirms persisted Tultitlán and session date reset to Upcoming.

No claim is made for the narrower list-footer-specific native refresh retry interaction. The mandatory cached-refresh/retry behavior is established by observed native Discover recovery and the independently rerun shared renewal host test; pagination retry has separate native and host evidence. This distinction does not waive a required check or label an unobserved interaction as passed.

## Acceptance mapping

| Criterion                                   | Evidence and result                                                                                                                                                                |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC01 area selection/persistence             | PASS: independent iOS all 3areas; independent Android Coacalco; existing SQLite/latest-intent tests and iOS relaunch result; whole-city API records and UI selection label.        |
| AC02 date shortcuts/local calendar/reset    | PASS:111 live comparisons, deterministic backend boundary tests, all 4native iOS selections/reset, Android Tomorrow selected state, local-midnight host test.                      |
| AC03 default eligibility/truthful metadata  | PASS: SQL exact inclusive cutoff and date-only/undated boundaries; independent expected IDs; existing event formatting tests; native demo/date/status/price presentation reviewed. |
| AC04 combined categories/Free/Music/general | PASS: SQL and live complete result sets for all date/category combinations; Free discriminant; independent native category/date and general See All.                               |
| AC05 collections/empty/partial/See All      | PASS: host composition and independent section retry/empty tests; iOS controlled consumer recovery result; native date mode hides temporal collections.                            |
| AC06 list scope/paging/cursor validity      | PASS: real SQL context mismatch, generation and boundary tests; independent full-ID/page comparisons and preview continuity; independent iOS page append plus context assertions.  |
| AC07 navigation/area/races                  | PASS: independent Android exact parent bounds and iOS gesture within 3points; all 3areas retain Tomorrow; host delayed-old-area/filter identity tests.                             |
| AC08 lifecycle/loading/empty/errors/offline | PASS: host state/refresh/race tests, newly added midnight test, real SQL empty/outage, successful native recovery bundle and Android offline evidence.                             |
| AC09 compatibility/contracts/operations     | PASS: independent full integration, strict legacy parser/schema tests, OpenAPI and errors, migration/import safeguards; additive API code inspected.                               |
| AC10 native light/dark/enlarged             | PASS: independent Android/iOS core repeats and visual inspection of actual implementation dark/enlarged evidence; runtime/source identified above.                                 |

Physical devices, screen-reader audio traversal, release signing, fresh native compilation and iOS-wide connectivity loss were not exercised. Android supplies native connectivity-off coverage. Live providers and production scale are outside this demo stage. These limits do not substitute host results for native evidence.

## Execution notes and final inventory

Initial shell lacked mise on PATH; using its configured absolute executable resolved that. Sandboxed database/native tooling lacked host access, so authorized escalated calls were used. An initial native repeat encountered a stopped local API; service was restored and the complete core flow passed. The new test's initial React Native subscription mock needed its normal remove handle, after which the unchanged runtime behavior passed. These are not application defect findings.

API 3000 now PID 38859/session 12262, log `/tmp/mireqo-tester-api-service.log`; Metro 8081 session 33459, `/tmp/mireqo-collections-metro.log`. Existing development54329 and isolated test 54330 remain. Development seed 2026-09-18. No fault proxy/alternate API is active. Android connectivity/reverse/default appearance retained; iOS light/large retained. Temporary runner/result bundles, independent API/Android probe scripts and full logs remain under `/tmp/mireqo-*`. Supporting worktree `.worktrees/discover-collections-backend` and original main planning copy are preserved. No branch/worktree cleanup or delivery action performed.

Curated self-contained reviewer input is `reviewer-current.md`. It supplies only current requirements, implementation, passing evidence, source identity and inventory. R01/R02 remain reviewer-owned and unstarted.

## Structured initial-loading correction — independent verification passed

Reviewed R01-F01 against SPEC 1 Loading State and UI specification 58. The implementer restored shared event-shaped placeholders for pending Discover context, section previews and first full-list page. Theme surfaces, image blocks and title/metadata bars match the existing cards. One accessible progress region carries the loading label/busy state; decorative blocks are hidden. Existing compact pagination indicator and retained refresh content remain intact.

Current 91-file manifest SHA-256 is `1a205be5c7df30331a7703472c49af617a16e2a3223fe26fc011ad98a8b98a1b`; every file verified. Independent `mise exec -- pnpm check` passed all build/lint/type/format/tooling/contracts/backend checks and 40 mobile tests across 13 suites. Three focused pending rendering tests cover context/preview/list structure, transition to real cards, compact incremental indicator and retained cards during pagination/refresh. The prior midnight test remains passing. Evidence: `evidence/tester-loading-host-check.txt`. No backend/contracts/data/routing/persistence/native dependencies changed; prior independent SQL, API and core navigation evidence remains applicable.

Native observation used a temporary read-only relay that delayed real API responses separately for context, two-item previews and first six-item lists. Requests were released unchanged after each screenshot; no synthetic events, errors or database writes were introduced. Devices and JavaScript source are the same identified Android 17 and iOS 26.5 environments above, now running the corrected source. This was not a fresh native app compilation.

- iOS: XCUITest `Check.testLoadingAppearance` passed in both light/large text and dark/accessibility-extra-large. Each run asserted Preparing discovery, Loading all upcoming events and Loading events accessibility labels, captured the structured pending cards, then asserted loading regions disappeared after release. Full list resolved to Sounds in the garden and Back remained usable. Result bundles `/tmp/mireqo-ios-verification/tester-loading-light-verified.xcresult` and `tester-loading-dark-large-verified.xcresult` each report 1 passed / 0 failed; dark run 44.096 s. Eight images `evidence/tester-ios-loading-{light,dark-large}-*.png`, two result summary JSON files and `tester-ios-loading.txt` preserve evidence.
- Android: native UI hierarchy and touch/Back checks passed context/preview/list in light / font 1.0 and dark / font 1.3. Observed accessibility descriptions append `, busy`, e.g. Preparing discovery, busy. Each pending region disappeared after the real response was released; list recovery asserted the real Sounds in the garden title. Eight images `evidence/tester-android-loading-{light,dark-large}-*.png` and `tester-android-loading.txt` preserve the passing observations.
- Independently visually inspected representative context, preview and full-list captures across both themes/platforms. Rounded event silhouettes contain image/title/metadata structure; native text remains legible and scrollable at enlarged sizes. No application issue found. Screen-reader audio is still outside performed coverage; labels/busy state were asserted through native accessibility trees.

AC08 loading and AC10 affected native appearance pass on the corrected source. Other ACs retain their prior passing evidence because their behavior is unchanged; relevant mobile regressions were rerun in the full check. Initial harness-only connection/scroll/label selectors were corrected using actual native state; passing results above supersede those attempts and do not claim them as successful.

Temporary relay/API 3002 stopped after verification. Android night mode=no/font_scale=1.0 and iOS light/large text restored. Normal API 3000 restored from the authoritative checkout as PID 43096, root-owned session 85606, log `/tmp/mireqo-collections-api-final.log`. No application edits, commits, pushes, new database mutations or delegation by tester. T01 correction retest complete; R01 re-review is ready using current reviewer-current.md.
