# Discover collections implementation

Status: review finding R01-F01 corrected and host-verified; ready for independent tester correction verification. Initial-loading native appearance remains for the tester’s focused reassessment. Current source is identified in the correction record below. This is not a final feature-success verdict. User authorized implementation on 2026-09-18.

Base main `b3ef0fa6c9867fb50010b165246f35c02cad3365`; branch `codex/discover-collections`; authoritative worktree `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/discover-collections`. Helper backend branch/worktree: `codex/discover-collections-backend`, `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/discover-collections-backend`. Lead owns mobile/integration; helper owns contracts/backend; coordinator assists native verification. No commits or pushes permitted from implementers.

## Implemented behavior

- Shared additive discovery context/events contracts with runtime semantic validation and generated OpenAPI. Legacy `/v1/events` keeps its exact old response and all-demo-dates semantics.
- Backend clock supplies one signed24-hour browsing generation shared by sections and pages. Full area/date/category/collection predicates run in PostgreSQL before cursor boundary/limit. Date-only/exact/unannounced rules follow the approved decisions, with stable ID ordering and scoped boundary validation. No migration required.
- Demo dataset v2 preserves original identities and adds four categories over14 days:198 total,66 per area. Explicit seed only; no read-time date rolling, live providers or invented metadata.
- Mobile session provider retains the date shortcut across area changes. Manual refresh, app foreground and local midnight renew backend time. Existing SQLite area flow remains the only persistent preference.
- Discover shows date chips, four category routes, general results and four independent collection previews (two events each); temporal sections only under default. Successful empty collections disappear, failures get their own retry, existing success stays visible.
- Full lists inherit validated identifiers and reference token, start at the first event with six-event pages, and retain rows on pagination/refresh errors. Native stack leaves the parent mounted for back/gesture restoration. Invalid route inputs offer recovery. Current scope identity includes area, date, category, collection, generation and preview/list mode.
- Previous successful data is retained only for the same area/filter scope while a new generation fails, with explicit previous-snapshot messaging. No old-area/date rows are relabeled under a new selection. API restart/dataset/expiry errors offer context restart.
- Reused editorial theme, local artwork and EventCard. No new dependencies/assets, unavailable feature buttons or native configuration changes.

## Integration and evidence

Backend helper files were copied deliberately from its uncommitted apps/backend and packages/contracts changes; copied contracts were reviewed against mobile adapters before integration. Helper notes: [backend-notes.md](backend-notes.md). Source output patch `/tmp/mireqo-discover-collections-backend.patch` is preserved; helper did not commit/push.

Current integrated `mise exec -- pnpm check` passed with build, lint including architecture boundaries, strict types, formatting, 7 tooling tests, 3 contract tests, 3 backend unit tests and 36 mobile tests. Log: `/tmp/mireqo-collections-check.log`. Integrated `mise exec -- pnpm test:integration` passed against isolated PostgreSQL/PostGIS; log: `/tmp/mireqo-collections-integration.log`. This includes migration/import/process safeguards plus discovery eligibility, pages, context mismatch, seed and availability checks.

Current native verification uses both existing platform binaries with current feature JavaScript; no native dependency or configuration changed, and no new application compilation is claimed. Passed Android observations are recorded in [android-native.md](android-native.md). Passed iOS core, accessibility, restart and controlled failure/empty observations are recorded in [ios-native.md](ios-native.md). Native notes preserve verification history and limits. No physical-device or screen-reader audio verification is claimed.

## Initial implementation source and host checks (before review correction)

As of the final source edits on 2026-09-18, `mise exec -- pnpm check` passed exit 0 with 36 mobile tests in 12 suites, 3 contracts, 3 backend unit tests and 7 tooling tests, plus build/lint/typecheck/formatting. `/tmp/mireqo-collections-check.log` is the current full-check log. The only backend changes were already covered by the integrated real PostgreSQL pass; subsequent changes affect mobile behavior/tests/docs only. `git diff --check` passed.

The initial implementation fingerprint covered 90 application/config/asset files, manifest SHA-256 `3632868b18dacfe33167967847dc55aac5cd00334397427186974bc27450d74a`. The native implementation evidence below applies to that initial feature state. The current manifest is superseded by the correction record at the end; its unchanged data/navigation behavior retains the earlier evidence while initial-loading appearance requires the focused correction verification.

Final refinements verified: same-scope retention refuses cross-filter placeholders; foreground renews effective server time without resetting date; child refresh uses the same context Query as the parent (deduplicating overlapping renewals), so parent sections and child list share the new generation; temporal list copy identifies Today/This Weekend correctly; general results use the action label “See all events.”

## Native results and tester handoff

The implementer assessed the completed native evidence against AC01–AC10 and the verification expectations. Required feature behavior has passing host, real-database and current-source native evidence; implementation is ready for independent testing.

- Android17/API37.1, Medium Phone emulator5554: selected date/category flows, Mexico City/Coacalco area switching with date retained, Upcoming process-restart reset with area persisted, general full-list pagination, system Back, nonzero parent-scroll restoration, dark appearance/font scale1.3 and actual Wi-Fi/mobile-data-off messaging with loaded events retained. Actions used CUA through Android Studio Running Devices. Details/screenshots: [android-native.md](android-native.md).
- iOS26.5 iPhone17Pro, UUID `C588ADDD-FC8A-48E8-BA7D-B14D9093962D`: all date choices/reset, all three areas with selected date retained, Music+Tomorrow and Outdoors category context, See All pagination, native edge-swipe Back, parent position restored within3points, dark/accessibility-extra-large and restart area persistence/date reset. Apple XCUITest core passed53.85s, dark/large13.83s and restart9.27s.
- iOS controlled consumer recovery: successful sections survived a Free-only503, scoped retry recovered; empty collections were omitted and general recovery worked; pagination503 retained rows and retry appended results; cached Discover refresh503 retained the same event and retry recovered. Clean recovery suite passed2tests/0failures59.264s. These temporary proxy responses verify native consumer behavior; real PostgreSQL behavior is covered separately by integration tests. Results: [ios-native.md](ios-native.md), [XCTest result extracts](evidence/ios-xctest-results.txt).

The narrower iOS list-footer-specific retry interaction was not established by its earlier XCTest attempt; the required cached-refresh/error/retry behavior was established through Discover and the host test of the shared renewal path. No claim of that unobserved footer-specific native interaction is made. Screen-reader audio, physical devices, fresh native app compilation and iOS-wide connectivity loss remain outside the performed coverage. Android supplies the observed native connectivity-off case. No checks were waived or application changes made to obtain these results.

Temporary fault proxy and alternate API3002 were stopped. Normal API3000 was restored (PID37756/session48146, `/tmp/mireqo-collections-api-restored.log`), and its areas endpoint returned all three areas. Metro8081 remains session33459. Android Wi-Fi/data,3000 reverse mapping, light/font scale1.0 and iOS light/large text were restored. Development catalog remains explicitly seeded2026-09-18; native fault tests did not modify PostgreSQL data. `/tmp/mireqo-ios-verification` retains the temporary runner, logs and result bundles for independent replay.

Source manifest was rechecked after native completion:90files match, manifest SHA-256 `3632868b18dacfe33167967847dc55aac5cd00334397427186974bc27450d74a`. Only Markdown/evidence records changed after the final host checks. `git diff --check` passed.

Tester input: authoritative plan.md/decisions.md/tasks.md, this implementation.md, backend-notes.md, both native notes and evidence, current source manifest, base/branch/worktree inventory above. Tester independently verifies the actual uncommitted/untracked implementation against AC01–AC10; defects return to implementer, unavailable required verification returns through planner. No tester/reviewer verdict, commit, push or PR has been produced.

## R01-F01 correction → independent tester

The reviewer requested restoring structured initial-loading placeholders from SPEC1 Loading State and UI specification58. The correction reuses the established card silhouette and semantic theme: two 200px image blocks plus title/metadata lines, grouped behind one accessible progressbar with busy state. Decorative placeholders are hidden from accessibility and do not represent invented events.

`EventCardPlaceholders` in DiscoveryParts is shared by initial Discover context, independently pending collection/general previews, and the first full-list page. Pagination retains the existing compact indicator. Refresh and additional-page pending states keep loaded cards; no data, API, routing, persistence, dependency or native configuration behavior changed.

Three focused rendering regressions cover context/preview/list placeholders and their transition to real cards, and assert that incremental pagination/refresh keep actual cards without replacing them with placeholders. The independent tester’s local-midnight regression remains intact. `mise exec -- pnpm check` passed exit0, including 40 mobile tests across13suites plus existing3contract/3backend/7tooling tests, build, lint, strict types and formatting. Logs: `/tmp/mireqo-collections-loading-check.log` and `/tmp/mireqo-collections-loading-tests.log`. `git diff --check` passed. Backend source is unchanged, so the passing real-PostgreSQL evidence remains applicable.

Current corrected source: [code-state.sha256](code-state.sha256), 91files; manifest SHA-256 `1a205be5c7df30331a7703472c49af617a16e2a3223fe26fc011ad98a8b98a1b`. Verify with `shasum -a 256 -c plans/discover-collections/code-state.sha256`. No service/device state was changed by this correction. No commits or pushes.

Handoff: tester independently reruns affected checks and inspects pending appearance on both Android/iOS, including light/dark and enlarged text, using the prepared delayed-response tooling. Earlier native evidence establishes the unchanged interaction paths; it does not claim the corrected pending appearance. Reviewer’s Changes required verdict remains until current passing tester evidence and re-review.
