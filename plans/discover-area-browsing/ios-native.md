# iOS implementer native verification

Actual iPhone17Pro simulator, iOS26.5, UUID `C588ADDD-FC8A-48E8-BA7D-B14D9093962D`. Coordinator compiled/installed both native additions using the repository iOS command; exact build log owned by coordinator. Verified actual installed app with Simulator CUA accessibility actions, native screenshots and simctl lifecycle/appearance controls on 2026-09-08. Metro restarted with cleared cache and TypeBox CommonJS resolver; runtime loaded correctly. Public API `http://127.0.0.1:3000`, served by real local PostgreSQL catalog.

Verified:

- First launch displays all3 backend area choices without account/location permission. Selected Coacalco, Tultitlán and MexicoCity and checked changed header/venue/borough membership. iOS AX exposes selected state for current area and named button roles. Close dismisses modal without changing selection.
- Force-stop/relaunch restores MexicoCity from SQLite; area lookup failure/retry also restores it without reselection. Final area is Tultitlán after empty recovery.
- Initial loading indicator, first-load503 with no invented cards, and actual area-load retry/recovery. Fault is a temporary nonmutating browse-area table lock, automatically released.
- Pagination action loads the next actual SQL page. AX verifies all10 fixtures including cancelled/postponed, price variants, omitted unknown price and distinct borough labels. Missing/broken images render calm fallback with unannounced date and no invented price; standard layout inspected visually.
- Cached refresh under temporary catalog table lock returns503 while retaining same-area cards. Visible stale-content message and Try again recover after lock release. Backend failure never claims confirmed device offline.
- Empty Tultitlán fixture displays clear Change area/Refresh events actions. Only synthetic Tultitlán rows temporarily removed and immediately restored using same-date seed. Refresh recovers actual events and keeps selection.
- Light and dark appearances inspected. `accessibility-extra-large` text inspected after cold relaunch; cards/text remain scrollable and controls accessible. Masthead/title maximum scaling1.6 prevents a fixed header consuming most of the viewport; event information and action text retain full dynamic scaling. Long titles wrap at this extreme size and remain available through scrolling. Restored iOS `content_size large` and light appearance after verification.

Screenshots: evidence/ios-light.png, ios-dark-large.png, ios-fallback.png, ios-refresh-error.png, ios-first-error.png and ios-empty.png. Native UI action/AX checks are distinct from host tests. Confirmed device-offline banner and incremental-load failure/retry were exercised on Android; iOS independently exercised backend outage/refresh recovery and successful incremental loading. Physical hardware, live providers, VoiceOver audio navigation and production hosting are outside these simulator checks.

All synthetic fixtures restored to30 records, seed reference2026-09-07; no fault locks remain. Existing Expo dev-client Tools overlay is development tooling. Native cap change leaves Android1.3-scale evidence unaffected because it only limits scaling above1.6. Independent tester still owns feature verification.
