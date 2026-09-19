> Current reviewer status (2026-09-18): R01 Successful; R02 delivery in progress. See [review.md](review.md) for the current verdict and delivery outcome. Earlier execution status below is historical.

# Discover collections plan

Status: planning complete and implementation authorized. Implementation is complete in the dedicated feature worktree; independent testing is in progress. See tasks.md for current ownership and execution status. Review and delivery remain pending.

## Goal and authority

Let users find relevant demo events in Coacalco, Tultitlán or all Mexico City using date shortcuts, category lists and useful Discover collections, while preserving browsing context and recovering from partial failures. The reviewer determines implementation success after independent testing; this plan defines the intended outcome.

Authority: [AGENTS.md](../../AGENTS.md), [workflow](../../implement_new_feature.md), [planner](../../planner.md), [architecture](../../architecture.md), [build guidance](../../build.md), [high-level Discover scope](../../spec/high-level-spec.md#4-discover-screen), [Discover specification](../../spec/feature-spec.md#spec-1--discover), [event lists](../../spec/feature-spec.md#spec-10--event-lists-and-categories), and [UI specification](../../spec/ui-spec.md). Current confirmed behavior and the resolved date clarification are in [decisions.md](decisions.md). Task ownership and checkout inventory are in [tasks.md](tasks.md).

## Scope

- Today, Tomorrow, This Weekend and This Week shortcuts, one active at a time, with reset.
- Selected-area calendar semantics and the approved collection/date interactions.
- Compact categories linking to paginated lists. Category and date combine on the backend.
- Happening Today, This Weekend, Free Events and Music previews; successful empty sections disappear; failed sections retain recovery rather than masquerading as empty.
- See All only when the preview indicates more results. Lists reuse event cards, identify active context and allow more results/retry.
- General discovery results remain available for events not covered by Free/Music collections, including when a date shortcut is active.
- Context-preserving navigation, existing area persistence, loading/empty/error/refresh/offline states, accessible light/dark editorial presentation.
- Actual shared API, PostgreSQL query and development fixture changes supporting the complete mobile behavior.

Excluded: event details/save (stage 3), Search, tabs for unavailable features, onboarding, interests/personalization, popularity/ranking signals, GPS/radius discovery, accounts, payments, live ingestion, production hosting, custom ranges, advanced filter sheets, new sorting options, new imagery and broad redesign. Existing cards must not gain dead detail/save controls.

## Confirmed current implementation

Base is `main` at `b3ef0fa6c9867fb50010b165246f35c02cad3365`; checkout inventory was clean and contained only the main worktree before these planning files.

| Integration point                                                                      | Existing behavior and planned change                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/contracts/src/catalog.ts`                                                    | Strict TypeBox area/event/request/response schemas and semantic response parsing. Existing requests accept only area, limit and cursor. Extend with opt-in discovery contracts, category/filter identity and effective date context without breaking older strict clients.       |
| `apps/backend/src/catalog.ts`                                                          | Exact-area query, repeatable-read metadata/data snapshot, stable local schedule key and ID order; cursor binds area/dataset/boundary. Add backend eligibility and combined filters before `limit + 1`; bind full effective discovery context to pagination.                      |
| `apps/backend/src/app.ts`                                                              | Fastify handlers, generated OpenAPI and uniform errors. Register new/extended discovery operations with strict request/response schemas and unchanged health/readiness behavior.                                                                                                 |
| `apps/backend/src/db/catalog-migration.ts`, `database.ts`, `migrations.ts`             | Migration003 stores event summaries as JSONB plus `area_id` and `order_key`. Assess useful query/index changes; keep old migrations immutable and schema interfaces aligned if a migration is needed.                                                                            |
| `apps/backend/src/db/demo.ts`                                                          | Thirty stable demo records across three areas, short date horizon, Music/Market/Art/Outdoors labels, varied price/status/schedule variants. Expand deterministic fixtures to exercise date/category/collection pagination and boundaries while preserving demo ownership guards. |
| `apps/mobile/src/data/catalog.ts`                                                      | Runtime-validated API adapter, area correspondence checks and cancellation. Add discovery operations and validate returned effective context against the request.                                                                                                                |
| `apps/mobile/src/data/discover.ts`                                                     | One area-keyed infinite query plus areas query. Separate context-aware listing and independently recoverable collection queries; all result-affecting inputs belong in query identity.                                                                                           |
| `apps/mobile/src/bootstrap/DiscoverExperience.tsx`, `AppProviders.tsx`                 | Area hydration/selector composition, central Query lifecycle/connectivity and SQLite preference. Own shared Discover session context at the appropriate lifetime while preserving boundaries.                                                                                    |
| `apps/mobile/src/features/discover/DiscoverScreen.tsx`                                 | Single area list, reusable EventCard, demo label, refresh/pagination and failure states. Compose date/category controls and sections; add feature-owned collection/category listing screen.                                                                                      |
| `apps/mobile/src/app/_layout.tsx`, `index.tsx`                                         | Existing Expo Router stack, thin root route. Add thin list route(s), validate route inputs and restore parent context for native back/gesture behavior.                                                                                                                          |
| `apps/mobile/src/ui/EventCard.tsx`, `theme.ts`, `Action.tsx`, `domain/event-format.ts` | Reuse event presentation, fallbacks, price/status truthfulness and semantic theme. Keep pure date rules apart from rendering/network/Expo.                                                                                                                                       |

No change is needed to source adapters, operational worker scheduling/locks, provider credentials or live ingestion. No new local persistent filter table is needed. Existing assets remain sufficient.

## Date and clock semantics

Confirmed ranges are inclusive calendar dates in the selected area's timezone. Today and Tomorrow cover their whole local day. This Week covers today through Sunday. On weekdays This Weekend is next Saturday and Sunday; on Saturday it is Saturday and Sunday; on Sunday it is Sunday only. No date filter accepts unannounced schedules. Default includes undated entries after eligible dated entries.

Exact schedules must be converted to the selected area's local date for calendar membership, not the device date or the UTC date string. Date-only schedules retain their calendar semantics; never invent an instant for them. All current schedules/areas use Mexico City timezone, but APIs must not accidentally rely on the device's setting. Handle month/year/leap-day boundaries deterministically.

Resolved Q01 in decisions.md defines default eligibility: exact starts must be at or after the browsing reference instant; date-only events remain eligible through their local day. Explicit calendar filters include the whole selected day range, including earlier starts today. Do not invent durations, “ongoing,” or completed status.

Backend rules receive an explicit clock. A browsing generation needs one effective instant/local-date context so preview→See All and successive pages cannot silently change their eligibility boundary. Filters, ordering, effective context and dataset version are bound into cursors. Refresh obtains a new generation; focus and local-day rollover must update stale relative-date interpretation. During unavailable refresh, retained content keeps truthful old-context/stale messaging rather than appearing to be newly fetched for a new date. Exact encoding and rollover mechanics are implementation choices to document before integration.

## API and data flow

1. Hydrate the existing area preference and resolve the area before fetching discovery.
2. Resolve validated date/category/collection inputs and the effective browsing context through the catalog boundary.
3. Backend validates inputs, determines bounds with its explicit clock, selects exact-area rows, applies every relevant filter in SQL, applies the cursor boundary, then sorts and limits.
4. Runtime-validated response data enters Query under identity containing area, date mode/effective bounds, category, collection/order and effective generation. Cancel obsolete requests and prevent stale responses crossing contexts.
5. Discover composes independent section results. A section's empty success differs from loading/failure; one failed section does not discard successful sections.
6. Child lists inherit the complete collection/category/date/area context and load a fresh first page or reuse a demonstrably compatible cached first page. A preview cursor must not skip its preview items in the full list.

The concrete shared contract is a prerequisite for mobile delegation. Prefer a narrow additive solution using the existing REST/TypeBox stack. Existing `/v1/events` serves all demo dates and has strict response parsing; new discovery temporal behavior must be opt-in or use a distinct endpoint. Preserve old response shape/legacy requests, test legacy cursors according to the documented compatibility strategy, and document new contracts in OpenAPI. Never silently add fields rejected by installed clients. Invalid combinations/unknown filters/malformed or mismatched cursors return safe contract errors; unknown areas remain 404 and database/section outages remain availability errors. Database lookup failures are not cursor-validation errors.

The cursor must reject reuse across area, date/effective bounds, category, collection, order or dataset generation. Its boundary row must belong to the same filtered result. Keep stable ordering and limit bounds; no duplicate/skipped IDs across tied sort keys. A data refresh/reseed invalidates old paging predictably and offers restart without hiding usable cached content.

Free uses the explicit free price discriminant. Categories use stable recognized identities mapped to truthful catalog metadata; null/missing categories are not fabricated. Do not derive availability of a category/collection by filtering the first downloaded page. Preserve status labels, null fields and demo metadata. If queries need a new migration/index, test fresh and upgrade paths plus unrelated-row preservation. Seeding must remain explicit, deterministic, transactional and limited to owned demo identities; increment dataset format version when fixture semantics change.

## Mobile interaction and state

- Keep the approved editorial presentation, compact accessible chips/category controls and reusable event cards. A selected chip has a visible and accessibility-selected state; controls remain usable with enlarged text.
- Date choice belongs to the Discover browsing session. Categories open a list for that category and current date; Free/Music carry their own collection constraint. Reset restores default without changing area.
- Default displays temporal collections; an active date removes those two sections and applies the selected date to Free/Music and the general results path. A selected date never silently filters only already-loaded items.
- Parent Discover date, loaded pages and scroll position survive See All/category navigation and Android back/iOS gesture. Route params carry validated identities/context, not full event objects. Invalid direct route input yields a safe recovery to Discover rather than a crash.
- Changing area retains date choice and requests the new area from page one. Old area/date cards must not be mislabeled under new controls. Existing latest-intent preference serialization remains intact.
- Date filters remain session-only; process restart restores area and begins default Discover. Do not persist catalogs or new filters in SQLite.
- Refresh retains relevant preferences and usable same-context results. An empty list gives context-specific recovery, such as reset date, return to Discover or change area. Pagination failure keeps current rows and retries; stale cursor recovery restarts the affected result context. Genuine device connectivity signals drive offline messaging.

## Observable acceptance criteria

| ID   | Expected observation                                                                                                                                                                                                                           |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC01 | Existing first-launch/manual area selection and restart persistence work for all three areas; Mexico City is not restricted to one borough.                                                                                                    |
| AC02 | Each approved date shortcut returns exactly its selected-area calendar range, excludes undated events and visibly identifies/reset its state. Weekend, week and midnight cases match decisions.md, including resolved Q01.                     |
| AC03 | Default eligibility matches the clarified upcoming rule; eligible undated events follow dated events. Date-only, missing price, status and demo provenance remain truthful.                                                                    |
| AC04 | Category lists combine category and date over the full backend result set. Free includes only explicit free events; Music includes only Music. General results remain reachable outside these collections.                                     |
| AC05 | Default Discover supports the four collections; active dates hide temporal collections. Empty success is omitted; partial failure has scoped retry and leaves successful sections visible. See All is absent when there is nothing additional. |
| AC06 | Full lists inherit the correct area/date/category/collection, include preview events, paginate without duplicates/skips and reject context-mismatched/stale cursors. Filtering occurs before pagination in real PostgreSQL.                    |
| AC07 | Back and gestures preserve parent date and position; area changes preserve the date shortcut while resetting incompatible pagination. Rapid date/area changes cannot show stale results as current.                                            |
| AC08 | Loading, all-empty, first-error, partial-error, cached-refresh failure, pagination failure and offline states provide accurate recovery without fabricated events. Rollover/refresh changes relative dates coherently.                         |
| AC09 | Legacy API use remains compatible under the published strategy. Shared validation and generated OpenAPI describe new behavior, malformed inputs and response semantics. Existing operational/migration safeguards pass.                        |
| AC10 | Android and iOS launch and exercise the changed navigation/filter flow, including enlarged text/light/dark. Native evidence identifies tested source and actual device/runtime; host checks are not labeled native verification.               |

## Verification expectations

- Pure deterministic date tests: Mexico City versus device/UTC day, exact midnight boundaries, Monday/Friday/Saturday/Sunday ranges, month/year/leap-day transitions, date-only/unannounced behavior, exact-time cutoff per Q01 and unchanged status semantics.
- Contract/API tests: all recognized/invalid filters, semantic combinations, runtime response mismatch, safe errors, legacy requests/responses and generated OpenAPI.
- Real PostgreSQL integration: combined filters before small pages; relevant matches after unrelated early rows; tied ordering; every context mismatch; boundary rows outside filter; dataset reseed; page continuity across clock changes; free/unknown prices; null categories; empty and availability errors. Preserve the existing test-target safeguards and development database.
- Fixtures: explicit fixed reference dates support each collection/category, more than a page of meaningful matches, empty combinations and calendar boundaries. Validate repeatability, update rollback and unrelated ownership preservation. Do not rely on today's date in deterministic test assertions.
- Mobile host tests: adapter validation, query identity/races, independent section error recovery, filter reset, offline cached states, See All navigation context/preview continuity, list pagination retry and back state restoration.
- Native Android and iOS: actually launch against the local API/database; choose all three areas; change date and category; open See All, load more and navigate back after scrolling; switch area with date selected; inspect empty/partial-error/offline behavior and light/dark/enlarged text. Capture reproducible actions and screenshots. Physical-device signing and screen-reader audio coverage must be stated separately if not exercised.
- Run repository-pinned `mise exec -- pnpm check` and `mise exec -- pnpm test:integration` with required local services. Follow build.md for compilation/rebuild needs; native compilation and launch are separate evidence. Record actual commands/results, current source fingerprint and remaining limitations.

## Risks and handoff

The current schema lacks end times, strict legacy parsers reject added response fields, date-relative paging can drift, multiple sections can fail independently, and native back/scroll behavior must be proved rather than assumed. Existing ten-record-per-area fixtures are insufficient for rich filter pagination without deliberate expansion.

Planning is not a success verdict. Product decisions are resolved. The user authorized implementation with “implement it” on 2026-09-18. See tasks.md and implementation.md for current execution status. The implementer creates a dedicated branch/worktree, synchronizes these records into it and owns code/self-checks. The tester independently verifies the resulting current state; only passing work reaches a separately instantiated reviewer with curated current requirements/evidence and no blocker history. Reviewer owns eventual changelog/commit/PR and safe cleanup under the workflow.
