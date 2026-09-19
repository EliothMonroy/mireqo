# Event Details / Saved — Android native verification

Coordinator implementation-stage evidence, 2026-09-18. This is not the independent tester verdict.

Environment: emulator-5554, Medium Phone API37.1 / Android17, existing com.mireqo.app development shell. Current JavaScript served from the authoritative feature worktree via Metro8081; real local API3000/PostgreSQL54329 with explicit demo-v3:2026-09-18 seed. No fresh native app compilation or physical-device verification is claimed. UI interactions use the computer-control tool bound to Android Studio's Running Devices window; screenshots/database/process inspection use read-only Android tooling.

## Current successful observations

- Discover retains Coacalco. See All opens the correct Upcoming list. Tapping the Sounds in the garden card's Save control changes it to Saved without opening Details. Opening the card then shows the correct same-event details and Saved state.
- Details displays date-only schedule truthfully (time unannounced), full description/address from the real API, demo disclosure and detail refresh timestamp. Shared illustration and price remain intact. No inferred end time is displayed for this date-only event.
- Native Android Share sheet opens with title, date, venue/Coacalco, explicit demo disclosure and https://example.org/. Dismissed with native Back; no recipient selected or message sent. Evidence: android-share-sheet.png.
- View location opens Google Maps with the provided demo venue/address query. Skipped sign-in and denied the optional location permission; no account/GPS requirement was added. Returned through native Back to the same Mireqo details. This establishes external query handoff, not that a fictional venue/event exists. Evidence: android-map-handoff.png.
- Removing and saving the event again in Details updates the event list's save state on native Back. The originating list returns at its first-card position; switching to Saved shows the same event under Upcoming with last-known details. Fast host-store race tests separately establish queued-action behavior; no precise double-tap latency claim is made here.
- After the local SQLite queue correction, closed Mireqo from Android Recents and verified pidof com.mireqo.app returned no process. Relaunched from the app drawer. Coacalco restored, no Saved hydration error occurred, and Saved retained the event. Read-only real SQLite shows demo:coacalco:01 with nonnull full description and refreshedAt, alongside selected-area=coacalco. Evidence: android-cold-saved.png and /tmp/mireqo-details-android-saved.db.
- Dark mode with font scale1.3: Saved's tabs, card title/venue, saved control, and freshness label are readable; opening Details retains legible Back/Share, title/date/price, saved control and wrapping address. Evidence: android-dark-large-details.png. No screen-reader audio coverage claimed.

Cold-start and dark checks use source-manifest c4f4b628cebd5b3db8afb30b195ce313187eb1e325040a0e56cac18072c9b594. Earlier ordinary demo-ID interactions also apply: the intervening change protects inherited object-property IDs and does not alter those UI paths. The final transport-normalization change is source-manifest 1382b46a1a24d5f26e6587109f53c80384739d345be17718902841e0e20a6efe; its affected error/recovery behavior was checked on-device below.

- With Wi-Fi and mobile data disabled and API stopped, closed Mireqo from Recents, confirmed no app process, and relaunched. Saved remained reachable while remote areas were unavailable. The same saved event opened with its last-known timestamp, full description and address, an offline notice and recoverable refresh failure. Evidence: android-cold-offline-details.png and android-offline-description.png.
- Restored network and API. Returning from the external browser advanced the successful detail timestamp to 21:06:30, cleared the offline/error notice and retained saved membership. Evidence: android-recovered-details.png. Android Open demo page invoked Chrome first-run setup; returned without accepting terms. This verifies Android external launch, not page rendering; iOS separately verifies Example Domain content.
- Final current-source cold launch with API stopped shows the friendly message “We could not reach the event catalog. Please try again.” and Try loading areas again, with Saved still available. No raw transport exception is displayed. Evidence: android-friendly-offline-error.png. API then restored; tapping Try loading areas again returned to populated Coacalco Discover, preserving the selection.
- Settings restored and inspected: font scale1.0, night mode=no, Wi-Fi/mobile data enabled. Coacalco and the single test-created save remain preserved.

## Execution history and remaining workflow

The first upgraded bundle initially showed Saved events could not be restored. Read-only SQLite showed both new tables/version1 and the preserved original area. Implementer serialized local preference/Saved I/O and added a regression test. The actual process-absent cold restart above then passed. android-initial-hydration.png retains the original observation; do not use it as current passing evidence or include this history in reviewer input.

Implementation-stage native checks above are complete; independent tester and reviewer stages remain pending. Baseline Android font scale1.0/night=no; selected area coacalco. Only demo:coacalco:01 has been saved by these checks. Databases are preserved. API and Metro remain coordinator-owned.
