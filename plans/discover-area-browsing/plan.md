# Discover: browse events in a selected area

## Goal and authority

Implement the first usable Discover slice: choose an initial supported area, browse backend-served demonstration events, change area, and recover from loading, empty, network, and refresh failures. Persist the selected area locally across launches. This is **stage 1**, not completion of the full Discover specification.

Read [decisions](decisions.md) and [tasks](tasks.md) with this plan. Product references are [high-level specification](../../spec/high-level-spec.md), [Discover and location specifications](../../spec/feature-spec.md), and [UI specification](../../spec/ui-spec.md), especially location controls, cards, state handling, and accessibility. Follow [architecture](../../architecture.md), [build guidance](../../build.md), and the [implementation workflow](../../implement_new_feature.md).

Approved initial coverage is Coacalco and Tultitlán (municipalities in Estado de México), and Mexico City as the whole city, including all boroughs. Model these as **browse areas**, not interchangeable municipality/city geography. This clarification overrides literal city-only wording in the specifications. Selection is exact catalog membership; no invented radius, GPS inference, bounding box, or inferred cross-boundary membership.

## Scope

- Supported-area lookup and manual selection; selected-area header; persisted selection and restart hydration.
- One browsable card list with cursor pagination, backend catalog storage and queries, shared validated contracts, and generated OpenAPI.
- Clearly identified demo catalog, with synthetic backend seeds only. Mobile consumes the API and never substitutes local fake events when it fails.
- Initial structured loading, empty state with change-area recovery, retry, pull-to-refresh, incremental loading, and preserved session content on refresh/offline failures.
- Shared card presentation, truthful date/price/status/missing-field handling, light/dark appearance, text scaling, and accessible controls.
- PostgreSQL schema/migrations and seed verification; actual Android and iOS API-connected verification.

Stage 2 remains multiple curated collections, date shortcuts, and category browsing. Stage 3 remains event details and saving. Search, onboarding, interests, GPS, recents, Settings, four-tab scaffold, live ingestion, ticket links, account features, production hosting, and catalog persistence offline across restarts are excluded. Cards have no dead save/detail action. Categories can appear as descriptive card metadata but are not filters. Single-list presentation is an intentional temporary stage boundary, not full UI-spec acceptance.

## Existing implementation

Base verified by coordinator: clean `main` at `37c8077b7e09edaa155858ef8b280e3d11ec0780`; implementer must verify full revision and record isolation before code changes. Existing mobile is the FoundationScreen, thin Expo Router entry/layout, and two-color light/dark theme. Expo 57.0.20, React Native 0.86.3, React 19.2.3 and Expo Router 57.0.19 are pinned. Query, SQLite, and connectivity integration are architecture selections but absent from package manifest.

Backend has Fastify health/readiness/OpenAPI, Kysely/PostGIS, explicit migrations `001_import_runs` and `002_fixture_state`, operational seed and isolated integration harness. No event/area tables or product endpoints exist. Shared TypeBox package validates health and error responses. Preserve those endpoints and worker operational behavior; reuse error envelopes, migration runner, dependency boundaries, and test safety protections.

## Contracts and storage

Contract owner defines and integrates schema changes before mobile implementation depends on them. Routine exact naming can be refined by implementer without changing semantics below.

`GET /v1/areas` returns the three supported areas with stable ID, display name, administrative context, kind (`municipality` or `city`), country `MX`, and IANA timezone `America/Mexico_City`. An optional local text filter over this complete three-item response is sufficient; no external city lookup. No cursor needed for this complete bounded catalog.

`GET /v1/events?areaId=...&limit=...&cursor=...` returns selected area identity, items, next cursor or null, and explicit demo provenance/reference date metadata. Require a valid supported area. Reject malformed query, cursor, and cross-area cursor with common `INVALID_REQUEST` 400 envelope; unknown area is a documented 404. Database unavailability uses a documented recoverable response. Validate request bounds, response union values, unknown fields as appropriate, ISO date/instant semantics, and cursor length. OpenAPI includes all success/error responses. Health contracts remain compatible.

Event summary includes stable ID, title, nullable image and venue/neighborhood, area ID, nullable descriptive category, schedule, price, status, and last catalog update timestamp. Schedule distinguishes exact instant plus event timezone, date-only local date plus timezone, and unannounced. Do not turn date-only into UTC midnight or invent missing end time. Price discriminates free/fixed/starting-at/range/unknown with currency and integer minor units for monetary values; validate nonnegative values and range order. Unknown price is omitted on cards, never shown as zero/free. Cancellation/postponement remain explicit status text, never inferred from absence. Do not add popularity or availability signals.

Use deterministic ascending schedule date/time order with stable event ID tie-break; undated events follow dated events. Define comparison keys explicitly so date-only events do not acquire fabricated times. Cursor binds area, ordering keys, and dataset version/reference date; reject stale seed-version cursors recoverably instead of silently mixing pages. Queries filter exact area membership **before** pagination and request at most limit plus one. Document page limit default and upper bound in schema. No date/category filters or popularity ranking yet.

Add a new migration, never edit applied migrations: browse areas, catalog events, and a minimal source identity/provenance representation linking stable mock source record IDs to catalog IDs. Explicit area foreign-key membership is sufficient for the single-area synthetic fixtures; Mexico City rows represent city membership across borough examples. Keep operational import records unchanged. Add constraints/indexes for required identities, valid discriminants and area/order querying, and synchronize Kysely interfaces. PostGIS remains installed, but this slice requires no spatial predicate or geometry pretending to be authoritative boundaries.

Demo seeding is explicit and transactional, separate from API/worker startup, repeatable without duplicate IDs, and allowed only for local development/test targets. The production configuration must not accidentally serve mock catalog data as real. Preserve operational seed behavior, unrelated rows, and stable fixture identities. Include finite fixtures covering all three areas, several Mexico City borough labels, multiple pages, schedule/price/status variants, long text, image absence and failure. Use project-owned/simple local artwork or properly permitted assets, no unlicensed event poster copying. Empty states and server errors are controlled test fixtures/faults, not random runtime behavior.

Live source adapters, matching rules, import schedules/retries, and worker changes are assessed and **unaffected**: current empty source registry stays empty. Demo source IDs/provenance provide honest identity only, not a generalized ingestion platform.

## Mobile data and UI

Thin route files compose Discover and a dismissible location-selection surface. Features do not import each other's internals; selected-area operations and persistence live in shared data layer. Shared UI cards receive formatted values and no SQL/fetch responsibilities.

Bootstrap owns QueryClient, lifecycle focus integration, and connectivity integration using compatible pinned dependencies. All result-affecting inputs including area ID are query keys. Use AbortSignal cancellation and independent query identity; delayed old-area responses must never render beneath a new-area header. Runtime-validate API responses before cache insertion. Refresh/pagination failures preserve already loaded same-area data; never present old-area results as new-area results. Network failure with no session data shows retry, with session data shows a clear stale/offline message. Backend outage must not be mislabeled confirmed device offline solely from a failed request.

Expo SQLite owns selected-area preference via versioned local migration. Hydrate before choosing initial query to avoid flashing/fetching the wrong area. Serialize rapid preference writes or otherwise guarantee last-intent wins. Unknown persisted area returns to selection. Report persistence failure with retry/recovery and do not claim that restart persistence succeeded. Existing/unrelated preferences must remain untouched. No event-catalog SQLite cache or saved model is added.

Approved visual direction: React Native StyleSheet with shared semantic color/spacing/type/radius tokens; warm neutral light canvas, charcoal dark canvas, warm accent, native text, large image-forward cards and concise metadata. Reuse theme boundary; no styling framework or custom font dependency. Compact header says Discover and names the active area; a visible `Demo events` explanation makes synthetic content clear. Calm image fallback rather than broken imagery. Comfortable 44pt/48dp controls, visible selected area marker beyond color, readable contrast, accessible names/states, screen-reader order, dynamic type without clipped actions, and native back/dismiss behavior. No ornamental control without implemented behavior.

## Observable acceptance criteria

1. First launch can select any of the three accurately described areas without account/location permission. Relaunch restores selection; changing it reliably changes catalog membership.
2. Cards are served through API and real PostgreSQL queries. Each area only shows its assigned events, including Mexico City fixtures from multiple boroughs; cursor pages are deterministic and do not duplicate/skip tied items.
3. Demo provenance is visibly understood from the screen. No mock-source fallback occurs when the API fails; no live-source claims appear.
4. Schedule states render truthfully in event timezone even when device timezone differs. Price states, cancelled/postponed status, long text and missing/broken images remain usable.
5. Loading placeholders, empty/change-area, first-load retry, pull-to-refresh, incremental loading/retry, and stale content during refresh/offline failure work without losing selected area or displaying another area's data.
6. Rapid area changes and delayed responses/writes converge to the latest selected area; restart persistence and SQLite failure recovery are verified.
7. New migrations apply fresh, apply repeatedly, and upgrade the previous schema preserving operational records. Repeated seed with same reference date yields stable identity/content and no duplicates; reseed preserves unrelated data.
8. Shared request/response schemas and OpenAPI match live API responses, including invalid input/cursor/unknown area and backend failure. Existing health/readiness/worker tests remain passing.
9. Android and iOS actual native UI independently demonstrate the feature, API connectivity, area selection/restart, major states, light/dark appearance, enlarged text and accessible controls. Host tests alone do not satisfy this criterion.

## Verification and risks

Implementer runs `mise exec -- pnpm check`, local database migration/seed workflow and `mise exec -- pnpm test:integration` following build.md. Real integration tests cover catalog SQL ordering/membership/cursor boundaries, migration upgrade preservation, seed transactions/idempotence, and existing safety guardrails. Domain/data tests cover invalid responses, schedule/timezone/price, response races, SQLite migration/hydration/persistence failures, refresh and pagination recovery. UI tests exercise user-observable actions and state; avoid snapshot-only evidence.

Native rebuild is required for SQLite/connectivity native additions. Record device/simulator model/OS, native build commands, API transport configuration, launch, screenshots/state checks, and light/dark/enlarged text outcomes on each platform. Use iOS host localhost and Android reverse/10.0.2.2 per build.md. Tester independently repeats meaningful required checks on the current uncommitted tree and records evidence before reviewer receives it. Missing runtime/device verification goes through planner blockers, never waived by the implementer.

Risks: scope drift into full Discover; presenting demo data as real; aging mock dates; mixed municipality/city semantics; stale request or persistence races; cursor instability across reseed; native dependency build availability. Current decisions are resolved in decisions.md; no product questions block implementation. Update architecture/build descriptions from foundation-only to implemented slice while preserving future scope distinctions.

Coordinator runtime evidence: dedicated `colima-mireqo` context with development database port 54329 and test database port 54330 ready; iOS simulator `C588ADDD-FC8A-48E8-BA7D-B14D9093962D` and Android `emulator-5554` booted. These readiness facts are not feature verification. Use bundled original/simple event visuals or controlled fixture imagery and exercise fallback; assets never imply a real event source.
