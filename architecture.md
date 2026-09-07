# Mireqo architecture

This document records the agreed architecture for Mireqo's Android and iOS MVP. It describes the intended implementation; the application has not been built yet.

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

Use one application organized by feature, with explicit boundaries between presentation, shared product rules, and data access. No additional global state library is selected. Introduce abstractions for demonstrated needs; simple operations may remain functions rather than requiring classes or a layer for every action.

The event provider, backend, visual design, and styling library remain open decisions.

## Module organization

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

The catalog exposes operations for discovery collections, search and filtered listings, pagination, and event details. Its callers work with Mireqo models, regardless of the eventual event provider.

```text
Search screen
  → search hook
    → TanStack Query
      → event catalog operation
        → provider adapter / event API
```

- Validate incoming data at runtime; TypeScript types alone do not validate API responses.
- Maintain stable identities across collections, details, and saved entries.
- Include all result-affecting inputs in query identity, such as location, query, filters, and ordering. Keep pagination associated with the correct query.
- Prevent older requests from replacing results for a newer query or location. Use request cancellation where available and correct query identity regardless of cancellation support.
- Apply search and filter semantics through the catalog contract. Filtering only a downloaded page must not be presented as a complete filtered result set.
- Document provider limitations. Unsupported filters and missing ranking signals must not produce misleading results or invented popularity.
- Keep successful discovery sections visible when another section fails. Refresh and pagination failures should preserve usable results with appropriate recovery actions.
- Configure app lifecycle and network connectivity integration centrally for TanStack Query. Connectivity signals do not replace handling actual request failures.

Provider and backend selection are deferred. If private provider credentials are required, requests must go through a server that holds them; private credentials must not be embedded in the mobile application.

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
- Local persistence: migrations, transactional saves, restart hydration, and failure handling without lost user intent.
- Feature integration: shared saved state, stale search responses, partial failures, and offline snapshots.
- Navigation and UI: tab/back continuity, direct event entry, filter drafts, appearance, accessibility, and relevant Android/iOS behavior.

Test tooling requirements, installation workflow, and planned commands are defined in [build.md](build.md). Concrete tool selections and executable scripts remain pending.

## Open decisions

- Event provider, city lookup source, backend requirements, and provider capabilities.
- Concrete API/schema details and remaining date/session semantics identified above.
- Visual design and styling library.
- Public event-link domain and hosting, if used.
- Exact toolchain versions, environment bootstrap details, and test/build tool selections, tracked in [build.md](build.md).

Optional product features remain optional under the specs. These open decisions do not authorize adding authentication, synchronization, notifications, or other deferred functionality.

## Technical references

- [Expo Router](https://docs.expo.dev/router/introduction/) and [route conventions](https://docs.expo.dev/router/basics/notation/).
- [TanStack Query React Native integration](https://tanstack.com/query/latest/docs/framework/react/react-native).
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/).

Consult documentation compatible with the versions eventually pinned in the repository.
