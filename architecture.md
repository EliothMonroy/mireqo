# Mireqo architecture

This document records the agreed architecture for Mireqo's Android and iOS MVP. The Expo application, pnpm workspace, backend API/worker foundation, and first Discover area-browsing slice are implemented. Discover uses shared area/event contracts, a local-development PostgreSQL demo catalog, TanStack Query session data and an Expo SQLite area preference. Live ingestion and later product stages remain pending; see [slice decisions](plans/discover-area-browsing/decisions.md).

Product scope and behavior remain defined by the [high-level specification](spec/high-level-spec.md), [feature specification](spec/feature-spec.md), and [UI specification](spec/ui-spec.md). Repository guidance is defined in [AGENTS.md](AGENTS.md); the code-change workflow is defined in [implement_new_feature.md](implement_new_feature.md). Development environment setup, dependency installation, native build configuration, and build/check commands are defined in [build.md](build.md), which distinguishes the agreed workflow from pending implementation.

## Technology decisions

| Concern | Decision |
| --- | --- |
| Mobile framework | React Native for Android and iOS |
| Language | TypeScript |
| Application framework | Expo |
| Navigation | Expo Router |
| Remote data | TanStack Query |
| Local persistence | Expo SQLite |
| Temporary UI state | React state, scoped to the relevant browsing context |
| Repository organization | pnpm workspace with mobile, backend, and shared API contracts |
| Backend | TypeScript, Fastify API, and a background import worker |
| Catalog database | PostgreSQL with PostGIS |
| Database access | Kysely, with explicit SQL where needed for PostGIS |
| Mobile-facing API | REST under `/v1`, documented through OpenAPI |
| Event ingestion | Scheduled batches from multiple sources |

Organize the mobile application by feature, with explicit boundaries between presentation, shared product rules, and data access. No additional global state library is selected. Introduce abstractions for demonstrated needs; simple operations may remain functions rather than requiring classes or a layer for every action.

Initial demo coverage is Coacalco and Tultitlán municipalities and all of Mexico City. The first slice uses native StyleSheet semantic tokens, warm editorial illustration cards, and system fonts. Live event sources, production coverage and hosting remain open decisions.

## Workspace organization

The agreed target structure is:

```text
apps/
  mobile/              # Expo application
  backend/             # Fastify API and import worker, sharing backend modules
packages/
  contracts/           # API schemas and inferred TypeScript types
```

The Expo application lives in apps/mobile. The API and worker are separate processes within one backend application. Do not introduce separate services or additional shared packages without a demonstrated need.

Share API contracts across mobile and backend, not database models or provider integrations. Contracts must be usable without importing backend runtime code or mobile dependencies. Each application keeps its internal domain and data-access modules private; extract other shared logic only when justified.

## Mobile module organization

Apply the mobile layout below as features are implemented. Existing mobile source lives in `apps/mobile/src/`.

```text
src/
  app/                 # Expo Router routes and navigation layouts only
  bootstrap/           # Startup, providers, dependency composition
  features/
    discover/
    search/
    event-details/
    saved/
    location/
    interests/
    settings/
    onboarding/
  domain/              # Shared models and pure product rules
  data/                # Catalog, adapters, query integration, local persistence
  ui/                  # Shared components, presentation helpers, theme
```

Create directories as they become necessary. Features may contain screens, feature-specific components, and hooks; they do not need identical internal scaffolding.

### Dependency boundaries

- Route files connect navigation to feature screens and remain thin. Bootstrap code wires shared dependencies and providers.
- Features use shared domain, data, and UI modules. They do not import another feature's internal implementation.
- Shared modules do not depend on feature implementations. Cross-feature behavior belongs behind an explicit shared API.
- Domain code has no React Native, network, database, or Expo dependencies.
- Screens access data through feature-facing hooks and operations. They do not call providers or execute SQL directly.
- Data adapters convert external representations to Mireqo models. Provider fields and database details do not leak into screens.
- Shared UI receives data and callbacks; it does not fetch or persist data. Shared formatting helpers keep dates, prices, and statuses consistent.
- Platform integrations stay behind focused boundaries so domain rules and reusable presentation remain independent of Expo APIs.

For example, `EventCard` receives saved state and an `onSave` callback. A feature hook connects that callback to the shared saved-events operation. The card does not maintain an independent saved-events collection.

## State ownership

| State | Owner | Lifetime |
| --- | --- | --- |
| Discovery collections, search results, event details | Catalog operations with TanStack Query | Session cache with refresh |
| Saved membership and saved event snapshots | Shared local-data layer backed by SQLite | Across app restarts |
| Selected city, interests, appearance, onboarding completion, recent searches | Shared local-data layer backed by SQLite | Across app restarts |
| Search input, applied filters, draft filters, browsing position | Relevant screen or navigation context | Preserved during navigation and tab switching |

Do not copy all categories into a single global store. A reactive in-memory view of persisted data must be coordinated by the shared local-data layer; individual screens must not create competing authorities.

Applied Search filters remain independent of Discover filters. The active location is shared across discovery unless the user explicitly makes a location-specific search. Changing location does not clear saved events or interests.

Restoring the full browsing session after a process restart is outside the MVP. Returning users normally enter Discover.

## Data access

### Event catalog

The catalog exposes operations for discovery collections, search and filtered listings, pagination, and event details. Its callers work with Mireqo models returned by the backend catalog API, independent of external source formats.

```text
Search screen
  → search hook
    → TanStack Query
      → event catalog operation
        → Mireqo REST API → backend catalog query
```

- Validate incoming data at runtime; TypeScript types alone do not validate API responses.
- Maintain stable identities across collections, details, and saved entries.
- Include all result-affecting inputs in query identity, such as location, query, filters, and ordering. Keep pagination associated with the correct query.
- Prevent older requests from replacing results for a newer query or location. Use request cancellation where available and correct query identity regardless of cancellation support.
- Apply search and filter semantics through the catalog contract. Filtering only a downloaded page must not be presented as a complete filtered result set.
- Document provider limitations. Unsupported filters and missing ranking signals must not produce misleading results or invented popularity.
- Keep successful discovery sections visible when another section fails. Refresh and pagination failures should preserve usable results with appropriate recovery actions.
- Configure app lifecycle and network connectivity integration centrally for TanStack Query. Connectivity signals do not replace handling actual request failures.

External provider integrations and private credentials belong on the backend. The mobile application queries the Mireqo API rather than individual providers. Saved membership and preferences remain local; this backend decision does not add accounts or synchronization.

### Local user data

Shared operations own saving, unsaving, preference updates, and local reads. SQLite stores this data behind those operations, with versioned migrations.

Saving follows this flow:

```text
Save control
  → shared saved-events operation
    → immediate shared UI update
    → SQLite transaction storing membership and event snapshot
    → confirm success, or reconcile state and report a recoverable failure
```

Saving and unsaving update every screen immediately. If persistence fails, restore the appropriate prior state without overwriting a newer user action. Coordinate overlapping operations so an older completion cannot undo the user's latest intent.

Remote refreshes may update event information, but never own saved membership. Refreshing an event and removing it from Saved must not accidentally recreate a saved entry.

### Offline behavior

- Cache Discover and Search results during the session and preserve useful loaded content when refresh fails.
- Persist enough event information with each saved entry to view it after restarting offline. A snapshot is last-known information, not a guarantee that the event is unchanged.
- Refresh saved snapshots when current information becomes available, without changing saved membership.
- If a provider removes an event, retain the saved entry and explain that current details are unavailable. Do not equate an unavailable response with cancellation.
- Retain the snapshot's last successful refresh timestamp. Communicate stale/offline information appropriately.
- Offline Saved must remain usable if remote images cannot load; use the shared image fallback. Downloading an entire city's catalog is outside the MVP.

## Backend catalog and imports

```text
External event sources
  → source adapters
  → validation and normalization
  → conservative duplicate matching
  → PostgreSQL/PostGIS catalog
  → Fastify REST API
  → mobile catalog operations
```

### Responsibilities and boundaries

- Source adapters handle provider-specific fetching and mapping into the shared backend event model. Preserve provider references and field provenance; validate external data at runtime.
- Import processing owns normalization, matching, and repeatable updates. Keep it separate from HTTP route handling.
- Catalog modules own event identity and selection rules. Database-access modules expose focused operations, such as searching events or upserting a source record.
- The API queries the stored catalog. Implemented endpoints are `/v1/areas` and `/v1/events?areaId=...&limit=...&cursor=...` for exact browse-area membership. Pagination uses local schedule-date/time keys with stable event ID, bound to area and demo dataset version; date-only sorts before exact times on that date and unannounced last. Search, event details, categories, geographic lookup and later ranking remain pending.
- Keep Kysely queries and explicit SQL inside backend data-access modules. Parameterize values and allowlist dynamic identifiers and ordering options. Group related writes into transactions.
- Versioned migrations define the database schema. Keep Kysely schema types aligned with migrations; type checking is not a substitute for testing actual PostgreSQL/PostGIS queries.

### Scheduled imports

Start with scheduled batches, without a dedicated queue service. Each source has an adapter and refresh schedule. Record import progress and failures in PostgreSQL. Repeated imports must safely update existing records rather than duplicate them; enforce at most one active import per source across worker instances. Failures and retries are independent per source.

The foundation uses session advisory locks on dedicated database connections and reconciles abandoned running records as interrupted after ownership is recovered. Provider-specific retry policies, batch sizes, schedules, stale-data thresholds, and any additional production recovery requirements must be settled in implementation planning against actual provider limits. Continue serving the stored catalog during source outages. Local fixtures support development without live provider access; they do not establish live-provider compatibility.

### Identity and duplicate matching

- Assign stable Mireqo IDs to catalog events. Retain each provider's event ID and source record separately, linked to the catalog event.
- Automatically merge only when strong evidence identifies the same event. Title alone is insufficient. Keep uncertain matches separate initially.
- Separate performances remain separate events even if their titles and venues match. Exact handling of multi-session source records remains open.
- Preserve field provenance. Define precise matching rules after examining selected providers' data.
- Verify permitted storage, reuse, and imagery handling for each source before integrating it.

### Conflicts and freshness

- Define source priority explicitly, with field-specific rules when needed. Fetch recency alone does not establish accuracy.
- Record each source record's last successful fetch and provider update timestamp when available.
- Preserve existing values when an import omits a field, unless the source explicitly indicates removal. The source adapter must distinguish omission from explicit removal according to provider semantics.
- Cancellation and postponement require explicit status evidence. Missing records and failed requests do not establish either status.
- Serve last-known catalog information during outages. Define refresh intervals and stale-data behavior per source after assessing capabilities and usage limits.

## API contracts

Use REST under `/v1`, with an OpenAPI specification. Shared request and response schemas in `packages/contracts` are the source for runtime validation, inferred TypeScript types, and API documentation. TypeBox supplies the shared runtime schemas and inferred types, the Fastify TypeBox provider connects route types to those schemas, and @fastify/swagger generates OpenAPI from the registered route schemas.

- Validate incoming requests on the backend and responses at the mobile data boundary.
- Expose stable Mireqo IDs and the public event model; keep provider records and database details internal.
- Use cursor-based pagination with deterministic ordering. Define cursor behavior and ordering for each listing contract.
- Use a consistent error format with a machine-readable code and readable message.
- Apply complete search and filter semantics on the backend, before pagination; mobile filtering of a downloaded page is not a complete result set.
- Plan API changes together with affected mobile consumers, validation, OpenAPI output, and compatibility implications. Do not assume all installed clients update at the same time.

## Shared event model

The exact schema will follow the catalog contract. Preserve these distinctions:

| Concept | Rule |
| --- | --- |
| Identity | Stable event ID; never derive identity from a title or list position |
| Schedule | Distinguish exact times, date-only schedules, and unannounced schedules; retain event time zone |
| Price | Explicit free, fixed, starting-at, range, and unknown states; include currency where applicable |
| Status | Keep cancellation/postponement separate from temporal classification such as upcoming or past |
| Missing fields | Represent absence explicitly; use shared presentation rules instead of fabricated values |
| Snapshot freshness | Retain the last successful refresh timestamp |

Date filters such as Today, Tomorrow, and This Weekend use the selected location's time zone. Event times display in the event's local time zone. Do not silently use the device's time zone for either rule.

Temporal classification, price interpretation, and other shared product rules belong in pure TypeScript functions. Keep the clock explicit in time-dependent rules so boundary cases can be tested deterministically.

Exact weekend boundaries, classification when an end time is missing, and handling multi-session event identity remain details to settle before implementing those behaviors. Do not invent times to resolve incomplete provider data.

## Navigation

Use Expo Router with this conceptual hierarchy:

```text
Root navigation
  Onboarding
  Main tabs
    Discover → Event lists
    Search
    Saved
    Settings → Preference screens
  Event Details
  Location selector
```

- Event Details is one shared route opened above the current browsing context. Back restores the originating screen, query, filters, and browsing position.
- A direct event link without browsing history has Discover as a fallback destination. Public link hosting and domain configuration remain undecided.
- Pass event IDs rather than complete event objects in routes. Validate incoming parameters and handle invalid or unavailable events gracefully.
- Preserve each tab's browsing state independently. State preservation must be implemented and tested, not assumed from the router.
- Keep filter selections in a draft until Apply. Dismissing the filter surface discards unapplied changes.
- Keep feature screens outside `src/app/`; route files and layouts are the only files placed there.
- Respect Android back behavior and iOS navigation gestures. Do not introduce additional primary destinations beyond the four specified tabs.

## UI and styling

- Define shared theme tokens for colors, spacing, typography, and shapes, including light and dark appearance.
- Build reusable primitives such as buttons, text, chips, and loading states.
- Compose shared event components such as `EventCard`, `EventRow`, and `EventStatusBadge` from those primitives.
- Keep screen-specific components inside their feature until reuse is demonstrated.
- Centralize formatting so dates, prices, and statuses read consistently across screens.
- Use platform-specific components where native interaction differs while preserving product behavior.
- Treat accessibility as part of component contracts: labels, selected states, text scaling, and touch targets.

Visual design and the styling-library choice are deferred. Follow the UI specification's content hierarchy and state behavior in the meantime.

## Verification boundaries

Follow the proportionate verification policy in [implement_new_feature.md](implement_new_feature.md#verification-and-completion). The architecture should make these behaviors independently verifiable:

- Domain rules: time-zone boundaries, incomplete schedules, price states, and event status.
- Catalog adapters: runtime validation, stable identity, missing fields, query/filter semantics, and pagination.
- Backend: API validation/error contracts, combined filters and pagination, PostgreSQL/PostGIS queries, schema migrations, and mobile/API integration.
- Imports: normalization, repeatable updates, duplicate matching, conflict selection, source failures/retries, freshness, and prevention of overlapping imports.
- Local persistence: migrations, transactional saves, restart hydration, and failure handling without lost user intent.
- Feature integration: shared saved state, stale search responses, partial failures, and offline snapshots.
- Navigation and UI: tab/back continuity, direct event entry, filter drafts, appearance, accessibility, and relevant Android/iOS behavior.

Test tooling, installation workflow, pinned toolchain, and executable commands are defined in [build.md](build.md).

## Open decisions

- Event sources, launch coverage, city lookup source, provider capabilities, and permitted data reuse.
- Production hosting and deployment; API operational limits and abuse controls.
- Further catalog contracts/schema and provider-specific dependencies. Foundation uses pg, TypeBox/Fastify Swagger, Kysely Migrator, and manually synchronized schema interfaces verified by integration tests.
- Source-specific matching/priority rules, schedules, stale-data thresholds, retry policies, and additional production recovery requirements beyond the implemented dedicated-session locks and interrupted-run reconciliation.
- Concrete API/schema details and remaining date/session semantics identified above.
- Visual design and styling library.
- Public event-link domain and hosting, if used.
- Release distribution and physical-device signing workflow, tracked separately from the local foundation in [build.md](build.md).

Optional product features remain optional under the specs. These open decisions do not authorize adding authentication, synchronization, notifications, or other deferred functionality.

## Technical references

- [Expo Router](https://docs.expo.dev/router/introduction/) and [route conventions](https://docs.expo.dev/router/basics/notation/).
- [TanStack Query React Native integration](https://tanstack.com/query/latest/docs/framework/react/react-native).
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/).

Consult documentation compatible with the versions eventually pinned in the repository.

## Implemented backend foundation

Fastify factory is separate from process startup. Health, readiness, and OpenAPI are the only public endpoints. Shared TypeBox schemas provide runtime validation and TypeScript types; mobile data-boundary tests consume them without coupling the launch screen to a server.

Kysely data access stays in backend modules. Versioned migrations create PostGIS and operational import/fixture tables; no event catalog schema is implied. The separate worker has no live adapters by default. Explicit fixture jobs demonstrate transaction rollback, persisted run outcomes, session advisory locking on a dedicated connection, and recovery of abandoned running records after process loss. Hash collisions may conservatively serialize unrelated sources; they cannot permit overlapping imports. Production schedules, provider policies, matching and freshness remain deferred.

## Implemented Discover slice

`bootstrap/AppProviders` owns Query lifecycle/connectivity and the SQLite preference store. `bootstrap/DiscoverExperience` composes independent Discover and location features; routes remain thin. Responses are runtime-validated before Query cache insertion; query keys include area, cancellation prevents wasted requests, and serialized preference writes preserve the latest intent. Hydration finishes before event lookup. Unknown stored areas return to selection; failed local writes surface recovery. Only selected area is persisted, not event catalogs.

Migration003 adds indexed exact area membership, JSON event summaries with identity/discriminant constraints, and stable demo source references. Explicit `db:seed:demo` transactionally updates only reserved demo identities. Serving and seeding refuse production and targets outside allowlisted local development/test databases. The empty worker source registry and operational import records remain unchanged. Original bundled art is illustrative, not provider imagery. Demo provenance and seed reference date appear on Discover; reads never advance fixture dates.

The stage intentionally omits collections/date/category filters, details/save and tabs. Full product requirements remain in the specifications; this slice does not claim their completion.
