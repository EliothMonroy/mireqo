# iOS native verification — Discover collections

Implementation verification on 2026-09-18. This record is not independent tester approval.

## Device and source

- iPhone 17 Pro simulator, iOS 26.5, UUID `C588ADDD-FC8A-48E8-BA7D-B14D9093962D`; Xcode 27.0 (27A266a).
- Existing installed native development application `com.mireqo.app`, with current JavaScript served by Metro on localhost:8081 from the authoritative `.worktrees/discover-collections` checkout. No native dependency changes in this stage; no new application compilation is claimed.
- Real Fastify API on localhost:3000 and development PostgreSQL catalog, explicitly seeded for 2026-09-18. No database modifications were made by the iOS verifier.
- Code fingerprint manifest `code-state.sha256`: SHA-256 `3632868b18dacfe33167967847dc55aac5cd00334397427186974bc27450d74a` when verification ran.
- User explicitly authorized Apple native UI-test tooling after computer-control timeouts. A standalone transient XCUITest project was compiled under `/tmp/mireqo-ios-verification`, without application changes or dependency installation.

## Passing native interaction evidence

`flow-final.xcresult`: `Check.testDiscovery` passed in 53.85 seconds, with XCTest assertions and screenshot attachments. Its actions exercised:

1. Today, Tomorrow, This Weekend, This Week, then Upcoming reset; each accessibility-selected state asserted. Happening Today was absent during active date selections.
2. Coacalco, Mexico City (the entire-city choice), and Tultitlán selection; Tomorrow remained selected after every change.
3. Music category under Tomorrow: list identified `Tultitlán · Tomorrow` and contained the corresponding Music event. Native edge-swipe returned to Discover with Tomorrow preserved.
4. Upcoming general See All: scrolled to page-one footer and tapped Load more events. The footer was replaced with additional cards. Native edge-swipe returned to the parent; See All's viewport y-position matched the pre-navigation position within 3 points.

`dark-large.xcresult`: `Check.testDarkLarge` passed in 13.83 seconds. Simulator appearance was dark with `accessibility-extra-large` preferred text. Today selection, scrolling to Outdoors, category context, and explicit Back to Discover worked with the date preserved. Screenshots were visually inspected: text wraps and the controls remain readable and scrollable. Light appearance and normal `large` preferred text were restored after the run.

Evidence images live in `evidence/ios-*.png`: date choices, area retention, Music+Tomorrow, page-one/page-two list states, parent before/after navigation, and dark/enlarged date/category controls. `ios-start-light-this-week.png` records the actual initial This Week state; default Upcoming is shown in the parent navigation evidence.

`relaunch.xcresult`: `Check.testRelaunch` passed in 9.27 seconds. Chose Tomorrow, terminated and launched the installed app; Tultitlán persisted and Upcoming was selected. Evidence: `ios-relaunch-default-area.png`.

## Reproduction and runner notes

Temporary runner: `/tmp/mireqo-ios-verification/MireqoCheck.xcodeproj`; tests: `/tmp/mireqo-ios-verification/Check.swift`. Result bundles and full logs are in that directory. Example:

```sh
xcodebuild test-without-building \
  -project /tmp/mireqo-ios-verification/MireqoCheck.xcodeproj \
  -scheme MireqoCheck \
  -destination 'platform=iOS Simulator,id=C588ADDD-FC8A-48E8-BA7D-B14D9093962D' \
  -derivedDataPath /tmp/mireqo-ios-verification/build \
  -resultBundlePath /tmp/mireqo-ios-verification/replay.xcresult \
  -parallel-testing-enabled NO \
  -only-testing:MireqoCheck/Check/testDiscovery
```

Use a new result-bundle path per run. When modifying this unsigned temporary runner, uninstall `com.mireqo.verification.xctrunner` before compiling/running again; Xcode otherwise reused an earlier installed test binary. Do not run concurrent Xcode tests against this device. Early runner setup attempts are not counted as passing feature evidence.

Expo's development-only floating Tools button obscured the app accessibility tree. It was disabled through the developer menu for label-based XCTest interaction. The native app source was not changed.

## Controlled recovery checks

A temporary loopback proxy forwarded normal responses to the unchanged Fastify API on port 3002. It supplied controlled HTTP 503 responses for Free-only, cursor-only, or all API requests, and an explicit empty `items`/`nextCursor` response for the empty-state UI check. These are native consumer/recovery tests, not proof of backend SQL behavior; real SQL filtering/empty/error behavior belongs to the separate integration evidence. PostgreSQL rows and the application source were not changed.

- Free-only failure: scoped Retry free events appeared while successful event content remained present; restored pass-through and scoped retry removed the error.
- All-empty response: the general empty guidance and Change area action appeared while empty collections were omitted. A slow pull on the actual ScrollView refreshed successfully after pass-through was restored. App-wide generic swipe was insufficient to trigger this control; targeted ScrollView gesture worked.
- Cursor-only failure: Load more events became Retry loading more while existing cards remained. Restored pass-through and retry appended the following page.
- Cached Discover refresh: controlled outage during pull-to-refresh displayed Try again without removing previously loaded Sounds in the garden. Restored pass-through and retry removed the error; `Check.testCachedRefresh` passed in 14.71 seconds.

The earlier list-footer Refresh events attempt reached retained cached content but XCTest waited for app idleness before the retry assertion. That specific native footer-retry path is **not claimed as passed**. The separate Discover refresh/error/retry path above is observed and passed. The implementation/tester must assess the narrower footer limitation together with the host tests; it is not a hidden success claim.

The clean `recovery-pass.xcresult` bundle passed both `Check.testCachedRefresh` (14.71 seconds) and `Check.testFaultRecovery` (44.55 seconds), 2 tests / 0 failures. It was executed with the same Xcode command above using `test` and `-only-testing:MireqoCheck/Check/testCachedRefresh -only-testing:MireqoCheck/Check/testFaultRecovery`. Eight recovery screenshots were exported to `evidence/ios-*`.

Temporary proxy and port-3002 API were stopped after verification. The fault-mode file is `pass`; the normal API was restored on port 3000. Simulator appearance/text were restored to light/large. Runner, proxy source, raw logs, and result bundles remain under `/tmp/mireqo-ios-verification` for independent tester replay. No active fault listener remains.

## Coverage limits

Physical-device signing, VoiceOver audio traversal, and simulator-wide loss of network connectivity were not exercised by this verifier. Failure/empty verification is recorded separately when performed; do not infer it from the successful interaction suite. This evidence does not replace backend integration checks or independent testing.

Normal API after restoration: PID `37756`, tool session `48146`, log `/tmp/mireqo-collections-api-restored.log`. HTTP `/v1/areas` returned all three areas. Port 3002 has no listener; the temporary proxy is stopped.
