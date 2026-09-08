# Independent testing — Discover area browsing

Testing passed on 2026-09-08 for stage 1 and the nine acceptance criteria below. This is tester verification, not reviewer approval. No application or test code was changed by the tester.

## Tested state

Authoritative worktree: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/discover-area-browsing`, branch `codex/discover-area-browsing`, base `37c8077b7e09edaa155858ef8b280e3d11ec0780`. Inspected the actual modified and untracked files, not just the committed diff. All 73 entries in `code-state.sha256` verified before and after testing; aggregate `fbe7d9ce3b03a66d4a41c0c6f527e48ff784b101b55b248a09d5b66a4db83a12`. Native-build documentation and tester evidence are documentation-only additions outside that code fingerprint.

## Independent automated and API verification

Commands ran from the authoritative worktree with `/opt/homebrew/bin` and `$HOME/.local/bin` on PATH, through the pinned mise toolchain.

- `mise exec -- pnpm check`: passed build, lint, strict types, formatting, 7 tooling tests, 2 contracts tests, 2 backend HTTP/config tests and 24 mobile tests in 8 suites. Log `/tmp/mireqo-tester-check.log`. Existing React autodetection and Fastify deprecation warnings did not fail checks.
- `mise exec -- pnpm test:integration`: passed the real database suite, including catalog verification, in 1.56 seconds. Log `/tmp/mireqo-tester-integration.log`. Executed with host network access. The harness resets only allowlisted test schema on port 54330 and reads development fixture state before/after to verify preservation.
- `git diff --check`: passed. No test expectations were weakened.

Independently inspected the integration harness and catalog assertions. Real PostgreSQL 17.5 / PostGIS 3.5.2 were verified using `psql` in `mireqo-test-db-1`, Docker context `colima-mireqo`. Both containers are healthy and use the repository-pinned image. Tests cover empty schema, previous migrations 001/002 and upgrade to 003, repeated migrations, operational sentinel preservation, spatial/worker regression, repeatable same-date demo seed, unrelated row preservation, transactional rollback, exact membership before pagination, tied ordering, invalid/cross-area/stale/forged cursors, empty catalogs and initial/paginated database outage 503.

A separate Python `urllib` HTTP probe against the running development API paged all three areas with limit 3: each returned exactly 10 unique events across 4 pages, all matching requested area. Mexico City returned Coyoacán, Cuauhtémoc, Iztapalapa, Miguel Hidalgo and Tlalpan labels. Every page identified `isDemo: true`, reference `2026-09-07`, dataset `demo-v1:2026-09-07`. Unknown area returned 404/AREA_NOT_FOUND; limit 31 and malformed cursor returned 400/INVALID_REQUEST; OpenAPI advertises 200/400/404/503 for events. Health and readiness both returned `status: ok`.

Mobile host checks include actual hook/UI recovery actions, delayed old-area response isolation, refresh retention, pagination retry, invalid saved area, serialized writes and latest intent, hydration/restart, SQLite initialization/write failure recovery, response validation, exact event timezone conversion across a UTC day boundary, date-only/unannounced schedules and all monetary discriminants. SQLite host tests use a mocked native driver; actual native SQLite persistence is separately supported by device evidence below. API outage tests use controlled faults, not a live provider.

## Native builds and source correspondence

The coordinator's completed build commands and logs are recorded in [native-builds.md](native-builds.md). Tester inspected both log endings showing successful build/install/launch. Native dependencies have not changed since those builds, so no redundant native rebuild was needed.

- Android: Medium_Phone, emulator-5554, Android 17/API 37; `mise exec -- pnpm android --device Medium_Phone --no-bundler`. Installed base.apk and current worktree app-debug.apk both SHA256 `3dc5b80d3a3cfaf4639631cf32b0a6fcb3437019cf76611fb8cf08f2d68be60f`.
- iOS: iPhone 17 Pro, iOS 26.5, simulator `C588ADDD-FC8A-48E8-BA7D-B14D9093962D`; `mise exec -- pnpm ios --device C588ADDD-FC8A-48E8-BA7D-B14D9093962D --no-bundler`. Installed and DerivedData `Mireqo.debug.dylib` both SHA256 `174f56330e37b4d442964d2f9a9c151b1a90594a1ccfa643c54e53affed14e0c`. Podfile.lock includes ExpoSQLite 57.0.2 and ExpoNetwork 57.0.1.
- `lsof` verified Metro PID 91597 cwd is this worktree's `apps/mobile`, and API PID 93414 cwd is its `apps/backend`. Metro listens on 8081; API uses 127.0.0.1:3000, with Android reverse mappings. Both clients were freshly launched using the Metro development-client URL. These are development builds running current JavaScript, not embedded release bundles.

## Fresh tester observations and assessed native evidence

Fresh Android accessibility inspection exposed the named Change area button, all three accurate area descriptions and Coacalco's native selected state. Tester selected Mexico City, observed Cuauhtémoc card membership, then force-stopped/relaunched after selection completed. The fresh accessibility tree and [Android relaunch screenshot](evidence/tester-android-relaunch.png) confirmed Mexico City restored with the correct catalog and visible demo reference. Immediate termination before the asynchronous selection completed was not used as a persistence assertion.

Fresh iOS `simctl terminate`, development-client `openurl` and screenshot independently demonstrated cold launch, restored Tultitlán, real API content, demo/date disclosure, truthful date-only text and a usable light layout: [iOS relaunch screenshot](evidence/tester-ios-relaunch.png). Tester did not repeat the iOS selector/fault interactions; those are implementation-stage device evidence assessed below, not fresh tester actions.

Tester visually inspected the distinct platform screenshots and checked their meaning against current source, host tests and native records:

- iOS: `ios-dark-large.png` demonstrates dark appearance and accessibility-extra-large text with wrapping/scrollable card content; `ios-first-error.png` shows area retry with no fabricated events; `ios-empty.png` shows Tultitlán and real Change area/Refresh events controls; `ios-refresh-error.png` retains Mexico City content with a retry banner; `ios-fallback.png` shows missing imagery, unknown date and omitted unknown price plus end-of-list/refresh. The [iOS native record](ios-native.md) documents actual all-area selection/dismissal, pagination, controlled fault recovery and restored normal settings.
- Android: `android-dark-large.png` demonstrates dark/font-scale 1.3 layout; `android-selector.png` shows a checkmark beyond color and precise area contexts; `android-offline.png` retains same-area content with confirmed offline disclosure; `android-pagination-error.png` retains a page and offers Retry loading more; `android-long-title.png` demonstrates wrapping and explicit timezone. The [Android native record](android-native.md) documents additional first-load/empty/refresh recovery, all fixture variants and native Back dismissal.

The combined device evidence supplies major states on each platform, with confirmed-device offline and incremental failure specifically exercised on Android and backend outage/refresh recovery exercised on both. Screenshots are not claims that the tester repeated every historical interaction. Fresh lifecycle/API observations, installed-artifact correspondence, unchanged source fingerprint and independently rerun domain/data/UI tests make those recorded interactions applicable to this tested implementation.

## Acceptance mapping

| AC  | Result and evidence                                                                                                                                                                                            |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Pass: three-area live API response; recorded first-launch/manual selection on both platforms; fresh Android selection and restart, fresh iOS restored launch; persisted/unknown-area host checks.              |
| 2   | Pass: real SQL tied cursor coverage plus independent live HTTP pagination for all areas and borough labels.                                                                                                    |
| 3   | Pass: explicit backend demo metadata and visible native disclosure; fault screenshots contain no fallback catalog.                                                                                             |
| 4   | Pass: formatting/contract tests, native missing image/unknown date/price/status/long-title evidence, event timezone explicit in formatted exact times.                                                         |
| 5   | Pass: loading/empty/retry UI checks; independent hook refresh/pagination regressions; distinct platform failure and retained-content evidence.                                                                 |
| 6   | Pass: delayed old-response and serialized preference/latest-intent tests, hydration/write failure recovery; native restart evidence.                                                                           |
| 7   | Pass: real migration/seed/idempotence/rollback and operational preservation assertions.                                                                                                                        |
| 8   | Pass: contract parsing and real SQL HTTP tests, independent live API errors/OpenAPI/health/readiness probe; worker regressions pass.                                                                           |
| 9   | Pass: both native builds and real API-connected UI evidence, fresh native launch observations, current artifact/source correspondence, platform appearance/text/accessibility evidence as distinguished above. |

Live provider integration, physical devices, VoiceOver audio navigation, store signing/release, production hosting and persistence of event catalogs across app restarts are not claimed and remain outside this slice. Current testing found no implementation defect or missing required stage-1 verification. DAB-08 is complete; DAB-09 remains reviewer-owned.
