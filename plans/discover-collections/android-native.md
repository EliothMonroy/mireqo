# Android native verification

Coordinator implementation-stage verification; independent tester/reviewer have not yet approved. Device: Medium Phone, emulator-5554, Android17 (Android Studio identifies API37.1). Existing com.mireqo.app development build from stage1 runs current Metro JavaScript; no native dependency/config changes require a rebuild. Metro started from this feature checkout with EXPO_PUBLIC_API_URL=http://127.0.0.1:3000, pnpm dev --clear; API from same checkout on3000. Explicit demo seed reference2026-09-18. CLI lifecycle launch and read-only screenshots; actual touch/Back interactions used CUA through Android Studio Running Devices.

## Observed interactions

- Existing Mexico City preference hydrated. Today selected; Music category opened with Mexico City/Today context, date-only event and an already-started16:00 event visible at approximately19:05 local, matching full-calendar-day behavior. Returned using Back to Discover and Today stayed selected. Repeated after hot reload settled.
- Selected Tomorrow, changed area to Coacalco; Tomorrow remained selected and new Coacalco catalog appeared. Screenshot android-area-date.png.
- Selected This Week and browsed sections. Later selected This Weekend and opened Outdoors; list header identified Coacalco/This Weekend with September19 events.
- Cold-launched frozen source after the implementer's final changes. Coacalco persisted and date reset to Upcoming (session-only date). Opened See all events; header identified Coacalco/Upcoming. Date-only September18 events remained, later dated results followed; no elapsed September18 exact-time records appeared before September19 results.
- Scrolled full list to Load more events and successfully loaded additional Art results after first-page Market boundary. Android Studio's native Back control returned to Discover. This verifies pagination and native Back, not an exact nonzero parent-scroll comparison.
- Dark mode with font_scale1.3: all date/category controls, list title, context, wrapped schedule and prices remained readable and usable. Outdoors/This Weekend exercised in this configuration. Screenshot android-dark-large.png. Restored prior light mode/font_scale1.0.
- Disabled emulator Wi-Fi and mobile data: explicit offline banner appeared with existing Discover events retained. Screenshot android-offline.png. Restored both previous enabled states.

Screenshots taken using adb exec-out screencap -p. android-today-music.png reflects the earlier implementation UI pass; final copy correction and shared-refresh fix did not change those date/category semantics. android-before-see-all.png was captured after scroll inertia settled at the last collection's cards, so it is not evidence of a before/after navigation comparison. Avoid treating transient CUA screenshots during animations as final layouts.

## Scope of evidence

No physical device, screen-reader audio traversal, or fresh native compilation is claimed. Removing adb reverse briefly did not interrupt an established connection; that attempt is not a pagination-error test, and the mapping was restored. Controlled error/empty checks are covered separately by the iOS helper and real database/host suites; do not infer Android fault recovery from an attempted test without an observed assertion.

## Final frozen-source navigation observations

After cold launch, selected Today and scrolled to a nonzero position with the categories above the general See all events button. Opened that list, observed Coacalco/Today and the date-only first card, then used Android system Back. The parent restored its previous position and context: compare android-parent-position.png and android-parent-restored.png. Neither reverts to the top-of-Discover header.

A temporary loopback forwarding proxy was used to prepare selective503 testing without affecting iOS, but the failed section was not conclusively inspected before the proxy was stopped. No partial-error pass is claimed from it. Proxy3001 is stopped, Android reverse is restored3000→3000. The iOS verification helper owns temporary API fault testing and will restore the standard API listener.
