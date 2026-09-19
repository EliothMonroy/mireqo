# Stage-3 native readiness and planned verification

Coordinator-owned record. Readiness was inspected on 2026-09-18; completed platform evidence is in android-native.md and ios-native.md.

## Existing environment

- Android emulator-5554 is online. Android Studio Running Devices window is accessible through the computer-control tool. The additional emulator-5562 is offline and unrelated to this feature; do not change it.
- iPhone 17 Pro, iOS 26.5, UUID C588ADDD-FC8A-48E8-BA7D-B14D9093962D is booted. Preserve the separate user's booted iPhone 16 Pro on iOS 18.6.
- Existing com.mireqo.app development shells contain the current project's native dependencies. Rebuild only if native configuration/dependencies change, per build.md. No stage-3 native build is claimed.
- Repository-pinned JavaScript prerequisite check passes. Main checkout has no local CocoaPods bundle; that matters for a fresh build, not loading JavaScript into the existing compatible shell.
- Colima context colima-mireqo has healthy persistent dev PostgreSQL54329 and isolated test54330. Preserve development data; only explicit migrations/owned demo seeding are authorized by this implementation.
- Prior temporary Apple UI-test project is /tmp/mireqo-ios-verification. Preserve its stage-2 results; create a new stage-3 runner/results directory if reusing the harness. User explicitly authorized Apple native UI-test tooling earlier in this conversation.
- Coordinator owns API/Metro lifecycle after integrated source is ready so services survive subagent handoffs. Metro runs on8081 (PID51776, session31214); restored API runs on3000 (session67769, log /tmp/mireqo-details-api-final.log). These are task-owned and must be stopped only after verification/delivery no longer needs them.
- Read-only pre-feature SQLite inspection confirms Android selected area coacalco and iOS tultitlan; existing preference tables are intact. Android database copy is /tmp/mireqo-details-android-before.db. No existing Saved table/feature exists in this baseline. Preserve these preferences through the migration and restore them after temporary test selections.
- Separate stage-3 Apple runner is /tmp/mireqo-details-ios/MireqoCheck.xcodeproj. Its temporary Check.swift and results are verification artifacts, not app source or a new native dependency.

## Planned native checks

Inspect real current source against the local API/DB on Android and iOS. Record screenshot/actions, runtime, source identity, actual results and any untested limits. Use a bounded core journey plus focused risk cases; do not repeat broad completed runs without a relevant source change or unresolved finding.

1. Open existing Discover/category/list event into Details; inspect long/missing metadata and known/unknown end examples. Back/gesture restores parent date/position.
2. Save directly from a card; verify it is saved in details and Saved. Unsave from a different surface and verify shared state. Confirm no accidental navigation from save button.
3. Switch area and primary destinations; retain saves and Discover browsing state. Confirm Upcoming/Past and undated grouping using suitable deterministic fixtures.
4. Cold restart with service/connectivity unavailable; open Saved and saved details, verify actual SQLite persistence and truthful last-known/partial snapshot presentation. Restore services/connectivity and verify refresh without membership changes.
5. Open native share sheet and inspect identifying text; dismiss without choosing a recipient or sending. Open the explicitly labeled demo external page and location action, then return to Mireqo. No purchase or account action.
6. Inspect relevant loading/error/empty and light/dark/enlarged text states, independent accessible card actions and image fallback. Use controlled faults only when clearly recorded as consumer tests, not actual database results.

Restore temporary appearance/connectivity changes after checks. Do not delete unrelated saved entries or clear app data to simplify tests. Capture and preserve original area and any preexisting Saved membership where possible; remove only test-created membership deliberately when cleanup is needed.
