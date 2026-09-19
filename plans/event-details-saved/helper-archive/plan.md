# Event Details and Saved Events

Status: planning complete; implementation authorized. The user approved the date rule in decisions.md. The reviewer determines success after independent testing.

## Goal and authority

Complete the journey from discovering a mock event to reading its details, sharing/opening available external information, and keeping a personal shortlist that remains usable after an offline restart.

Follow AGENTS.md, implement_new_feature.md and each assigned persona. Product authority: high-level specification sections 7–8; feature specifications 3, 4, 11, 12–14; UI sections 16, 31–43, 58–70, 78 and 83–84. Architecture supplies local SQLite saved membership/snapshots, shared operations, thin routes, one details route above browsing, and independent tab state. Build guidance supplies pinned commands and native verification rules.

## Scope

- Open shared Event Details by stable event ID from Discover, category/collection lists and Saved. Show prominent existing artwork/fallback, title, truthful schedule/end time, venue/address/city, category, price, expandable description and useful available metadata.
- Save/unsave on every implemented card/list and details surface, with immediate consistent state, reversible failure recovery and durable local storage. Search remains unimplemented.
- Introduce working Discover and Saved primary destinations using the specified navigation model. Do not expose dead Search/Settings destinations. Preserve Discover date, area, position and list/detail return context across navigation.
- Saved defaults to Upcoming; Past is secondary. Undated events have a clearly labeled group within Upcoming. Preserve saves across area changes. Empty Saved links to Discover.
- Use the confirmed past-classification rule in decisions.md consistently. Status (cancelled/postponed) remains separate from time classification. Do not infer duration or claim an event is ongoing merely because its start passed.
- Native sharing of identifying event information; external HTTPS event/ticket action only when suitable information exists; external venue lookup only when enough location information exists. Errors are recoverable. No in-app purchase flow or public-link hosting.
- Persist a last-known snapshot for offline Saved/details, including freshness/completeness and area/demo information. Missing remote information must not remove a save or imply cancellation.
- Implement the necessary additive details contract, backend query/storage/fixtures/OpenAPI and tests. Keep all existing strict summary/discovery clients compatible.

Excluded: live sources, Search/advanced filters, Settings/onboarding/interests, accounts/sync, notifications, popularity/personalization, similar events, calendar integration, maps inside Mireqo, production hosting/public universal links, multi-session identity redesign, payments and release distribution. No new dependency is anticipated; discuss material additions before installation.

## Existing integration points

- Base main is dee988f521e0fb6dc80b6257c003276abab10f1c (stage 2 merged). Root checkout is initially clean, with no remaining feature worktrees.
- packages/contracts/src/catalog.ts has strict summary/schedule schemas; endsAt, description, full address and event URLs do not exist. Preserve their old shapes.
- Backend catalog and discovery read PostgreSQL demo JSON summaries with stable IDs, explicit transactional seed ownership and protected local targets. Worker has no live sources. See backend-assessment.md for additive storage/contract assessment.
- EventCard currently renders presentation only. Keep it callback/data-driven; shared saved operations and feature-facing hooks own persistence/navigation coordination.
- AppProviders owns Query, central connectivity/focus, area preference SQLite and DiscoverySession. Extend this composition with shared saved state without competing per-screen stores.
- SQLite mireqo.db currently has namespaced area preference migration/table. Add versioned saved storage without resetting preferences. Current installed native shells already include Expo SQLite, Router and native sharing/link APIs.
- Root Stack has index Discover and /events full list. Routes stay thin; details accepts a validated ID, never a serialized event object. Put actual screens in features/event-details and features/saved.

## Data and behavior design

### Backend and contract

Use a narrow additive GET /v1/events/:eventId (or equivalent documented additive path) with strict shared runtime validation. Return summary, area/demo provenance and explicitly nullable details fields, including a separately validated end instant when applicable. Unknown event is a distinguishable 404, unsafe/malformed input a safe 400, and storage/catalog failure 503. Do not collapse a transient failure into event removal.

Lookup is by global stable ID and must work for past/cancelled events and saved events outside the selected area. It must not require a Discover eligibility context. Preserve existing list response fields and date/filter/cursor rules unchanged. No saved-membership backend endpoint or table.

Add a new immutable migration if required for optional details data. Existing rows remain valid with missing details; never invent provider data while migrating. Explicit development seed adds deterministic synthetic descriptions, end-time variants, useful venue data and missing-field/status cases while preserving old IDs and unrelated records. Reads/startup never reseed. No worker behavior changes beyond any necessary model compatibility.

For mock external actions, never present a fabricated official listing or ticket sale. Use https://example.org/ for a clearly labeled Open demo page fixture action; this is an example destination, not a fictional event's official page or a ticket sale. Events without URLs omit that action. Share mock provenance. No domain purchase, hosting or live event-provider commitment is authorized. Venue lookup must identify the venue/location, not claim a fictional event is real.

### Local saved ownership

One shared local-data operation owns membership, snapshots and subscriber updates. Save a card's known summary and area/demo snapshot immediately, even offline; enrich from details when available. Explicitly distinguish summary-only snapshots from successfully refreshed full details. Never overwrite richer stored details with a summary-only update or relabel old details as newly fetched.

Use atomic SQLite transactions and parameterized statements. Preserve selected-area and unrelated local data on fresh/repeated/upgrade migration. Validate stored data on hydration and report recoverable failures honestly. Coordinate rapid save→unsave→save, multiple screens, delayed writes, retry, remote refresh and restart; an older completion must not override newer intent, resurrect removed membership, or duplicate a saved event. Controls should not silently operate against unknown hydration state.

Hydrate Saved independently from remote areas/context so it works on offline cold start. Refresh only currently saved entries or the current detail as needed; avoid uncontrolled repeated requests. Use explicit identity and request cancellation/version checks to prevent responses for one event replacing another. Keep prior snapshots and last successful refresh time on errors. A confirmed missing event keeps its saved snapshot with an unavailable explanation; cancellation only comes from actual status data.

### Presentation and navigation

Use current semantic theme/editorial art, structured initial loading placeholders, native back/gesture behavior, readable action targets and selected/saved accessibility states. Show no empty metadata sections. Share uses the system sheet and never automatically sends a message. External actions clearly identify leaving Mireqo and reject unsafe schemes; use known complete venue information to compose location lookup.

Cancelled and temporally past events must not encourage buying tickets. Unknown end-time events past their day say Date passed, while known elapsed end times may say Ended. Postponed status remains visible and is not treated as confirmed cancellation. Missing date/time/price remains explicit.

Details loads fresh data by ID but can show a valid same-event cached/saved snapshot during refresh/offline. Invalid direct route or unknown unsaved event has useful recovery. Direct entry without history has Discover fallback. Save controls do not accidentally open the card; open controls do not accidentally toggle save. Back and switching primary destinations preserve originating filters/list position. A route refactor must keep existing /events entry behavior working.

## Acceptance criteria

| ID | Observable outcome |
| --- | --- |
| AC01 | Cards from Discover and category/collection lists open correct full details by ID; back/gesture preserves date, area and parent position. |
| AC02 | Detail image/text/schedule/end/venue/price/status and expandable description match backend information; missing fields stay truthful; past/cancelled ticket behavior is appropriate. |
| AC03 | Save/unsave immediately agrees across all implemented surfaces and persists through restart; rapid actions and persistence failures preserve latest intent with visible recovery. |
| AC04 | Saved is reachable from primary navigation, defaults Upcoming, separates Past and undated group, orders dates consistently and preserves membership across area changes. |
| AC05 | Known-end, unknown-end, date-only and undated classification follows approved rules across exact boundaries, timezones, midnight and app foreground. |
| AC06 | Offline cold-start Saved/details remains usable from persisted snapshots, including unavailable images and summary-only saved entries; timestamps/completeness and unavailable/503 distinctions remain honest. |
| AC07 | Refresh can update saved details without changing membership or resurrecting an unsaved event; stale responses cannot replace another event or a newer snapshot. |
| AC08 | Native share includes identifying information and demo provenance; valid available external event/location actions open safely; absent/unsafe links and launch failures are handled. No message is sent automatically. |
| AC09 | Additive backend details lookup, strict schemas/OpenAPI, real PostgreSQL queries/migration/seed behavior and legacy discovery/list regression checks pass. No live providers or backend saved membership added. |
| AC10 | Local migration preserves area preference/unrelated data, has repeatable upgrade behavior and real native persistence evidence. |
| AC11 | Loading/empty/error/offline/refresh states, dark/light, enlarged text and accessible independent controls work on Android and iOS. Direct-entry fallback and tab/list continuity are verified. |

## Verification expectations

- Domain tests with injected clock: known end equality, missing-end local-day boundary, date-only/undated, month/year/leap transitions, device versus event timezone, status independence and sorting ties.
- Contracts/backend: semantic detail validation, invalid IDs/URLs/end times, 404 versus 503, cross-area/past ID lookup, response identity and legacy strict parsing/OpenAPI. Real isolated PostgreSQL fresh and upgrade migrations, seed repeatability/rollback/ownership/unrelated preservation, import safeguards and existing discovery paging.
- Saved storage/store: transaction/hydration failure, repeated migration, original preference survival, duplicate save, latest-intent ordering, stale refresh after unsave, summary-to-detail enrichment, richer snapshot preservation, unavailable versus network handling and retry. Use meaningful behavior tests rather than implementation mirrors.
- Mobile screens/hooks: full card/details/Saved flow, invalid direct entry, tab/back continuity, loading skeletons, partial snapshot offline display, status/actions, native Share/Linking adapters and unsafe URLs.
- Both native platforms with local real API/database and existing shells if no native config changes: save from card and details, open Saved, unsave and cross-screen consistency, area switch and date/back restoration, cold restart offline, real SQLite preference/save survival, long/missing content, dark/enlarged controls, native share sheet and external navigation without sending messages or purchasing. Controlled faults must be labeled separately from real SQL results.
- Run repository-pinned pnpm check and pnpm test:integration. Record source fingerprint, actual device/runtime and precise coverage; no claim of fresh native compilation unless actually performed. Preserve unrelated simulator/device state and development database data.

## Handoff and risks

First freeze one shared-contract shape, then implement backend and mobile in isolated branches/worktrees with explicit ownership. Integrate and verify before independent tester. Only passing current requirements/evidence reaches an independent reviewer; no blocker/history handoff. Reviewer owns success verdict, changelog, commit/PR and safe cleanup.

Principal risks: strict legacy schemas, detail enrichment racing unsave, local write rollback overriding newer intent, partial snapshots mislabeled fresh, offline Saved coupled to online area hydration, date rollover and incomplete schedules, and Router tab refactor losing existing scroll state. These require evidence rather than assumptions.
