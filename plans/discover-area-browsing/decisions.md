# Discover area browsing decisions

## Confirmed direction from coordinator's user-context handoff

- First product work item is Discover browsing in a selected area, implemented in stages. This work is stage 1: area selection, backend mock catalog/API, event cards and loading/empty/error/refresh. Stage 2 is collections/date/categories; stage 3 is details/save.
- Initial areas are Coacalco and Tultitlán municipalities in Estado de México and Mexico City as the entire city/all boroughs.
- Mock events are for development, served through the backend. No real event sources have been selected or authorized.
- Existing architecture selects TanStack Query and Expo SQLite. Adding their compatible pinned versions implements an agreed choice, not a new architecture.
- Exact geographic membership is assigned in the mock catalog; do not invent a radius. General literal city wording is clarified to browse areas for these selections.

## Current resolved decisions

Coordinator confirmed existing user authorization on 2026-09-07; no additional scope approval is needed.

| ID  | Decision                                                                                                                                                                                                                                                                                                                                                                       | Authority / impact                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D01 | Stage 1 is a single card list and area selector, without tabs/search/save/detail/GPS controls until those behaviors are implemented.                                                                                                                                                                                                                                           | User accepted staged scope; coordinator confirms the temporary presentation boundary. Full Discover remains incomplete.                                                          |
| D02 | First launch shows manual area selection with all three choices and no silent default. Returning launches restore SQLite preference.                                                                                                                                                                                                                                           | Coordinator routine UX interpretation within approved manual area selection.                                                                                                     |
| D03 | Native StyleSheet editorial presentation: prominent imagery, compact location control, neutral light/dark surfaces and a **warm** accent. System fonts and shared tokens.                                                                                                                                                                                                      | User approved this visual direction, confirmed by coordinator. Supersedes planner's preliminary teal proposal. No styling framework.                                             |
| D04 | Seed accepts an explicit ISO reference date, defaulting to Mexico City local date on explicit invocation. Stable offsets/IDs make same-date reseeds deterministic. API reads never move dates. List all demo schedules chronologically without falsely claiming past dates are upcoming; label demo catalog/reference date. Only deliberate reseed updates mock-owned records. | Coordinator routine development-fixture decision; no hidden frozen runtime clock.                                                                                                |
| D05 | Verify and exactly pin stable TanStack Query, Expo-compatible SQLite and a suitable Expo network package; AppState handles Query focus centrally.                                                                                                                                                                                                                              | Query/SQLite already architecture-approved; connectivity is routine integration. Versions were not previously pinned; implementer verifies compatible versions and records them. |

## Routine implementation decisions

- Shared TypeBox schemas, PostgreSQL/Kysely persistence and exact area membership follow the architecture. Keep implementation small; no generic provider framework, polygons, spatial radius search, or catalog snapshots in mobile SQLite.
- API event list uses cursor pagination with deterministic schedule/ID order and area/dataset binding. Contract implementation documents exact keys/default bounds before mobile depends on them.
- Keep nullable/missing fields and schedule/price/status discriminants truthful. UI-spec unknown-price rule is omission, not `Free`. Event local timezone is independent of device timezone.
- Query identity and serialized preference updates preserve latest area intent. Successful same-area session content remains visible after refresh failure.
- Explicit demo provenance must be visible in UI. Demo seeding and serving must remain development/test-scoped; API startup never seeds.
- Existing pinned backend dependencies remain; no source SDK, styling framework, state store, or date library is implied. Implementer verifies current Expo-compatible exact versions for `expo-sqlite`, approved Query library, and one minimal connectivity integration, records pins and rationale, updates frozen lockfile, and rebuilds native apps. No exact versions are claimed as already installed or agreed here.

## Specification/documentation mismatch

Full Discover specification includes collections/date/categories/detail/save, and whole-app UI includes tabs and other entry points. This stage deliberately defers those previously staged items. Update architecture/build implemented-state notes and link this record; do not silently rewrite the full product scope as completed. Municipality/city selection uses the browse-area semantics above rather than geographic equivalence.

## Outside-scope open decisions

Live providers and permissions; authoritative geographic lookup; production ingestion, freshness and duplicate matching; production hosting; eventual GPS/radius behavior; later date/weekend filtering; event details/save; production artwork and richer branding remain outside this slice.
