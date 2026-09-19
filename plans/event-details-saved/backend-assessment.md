# Event Details and Saved: backend and contracts assessment

Planning support only. Inspected `main` at `dee988f521e0fb6dc80b6257c003276abab10f1c` on 2026-09-18. No application implementation, dependency installation, services, tests, commits, or delivery operations were performed for this assessment. The coordinating planner owns the integrated plan and decisions; this document distinguishes facts from recommendations.

## Confirmed scope and decisions

- Implement the stage-3 Event Details, Saved, and native sharing path against the existing synthetic catalog. Saved membership and snapshots belong exclusively to mobile SQLite; no saved API, accounts, synchronization, live providers, or new hosting.
- SPEC 3 requires truthful schedule, available venue/address/category/pricing/description, saving, sharing, external attendance information when available, and past/cancelled handling. Extra metadata and similar events are optional, not required additions.
- SPEC 4 requires immediate shared saved state, persistence, dated sorting, separate Upcoming/Past, removal, and opening saved details. SPEC 11 requires useful native share content with a link only when available.
- The coordinating planner relayed the user's confirmed date policy: known end moves to Past at that instant; unknown end moves after the event-local day with “Date passed,” not “Ended”; undated events appear in a separate “Date to be announced” group within Upcoming. This supersedes the initially pending date question.
- Demo external links must remain explicitly demo. A nullable default link plus a controlled HTTPS verification fixture or clearly labeled demo page is permitted; no false ticket sales or provider/domain/hosting additions.

## Current repository facts

| Area                  | Evidence and implication                                                                                                                                                                                                                                                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public summary        | `packages/contracts/src/catalog.ts` defines strict `EventSummarySchema`, `ScheduleSchema`, `EventsResponseSchema`, and semantic response validation. Schedule has exact start, date-only, or unannounced; no end. Every object rejects extra fields. Adding detail fields or `endsAt` to an existing listing response would break installed strict clients. |
| Discovery             | `packages/contracts/src/discovery.ts` reuses the same summary and strict legacy semantic validator. `apps/backend/src/discovery.ts` filters exact starts for default discovery and calendar dates for temporal collections. Stage-3 Saved classification must not silently change those agreed stage-2 eligibility rules.                                   |
| Stored catalog        | Migration `003_catalog` creates `catalog_events(id, area_id, summary jsonb, order_key)` and `catalog_source_records` containing source IDs and demo ownership. There is no detail payload, description, full address, end instant, ticket link, source-fetch timestamp, or tombstone.                                                                       |
| Catalog identity      | Stable demo IDs are `demo:<area>:<two-digit-index>`. Source linkage is separately stored. `seedDemo` preserves identity across repeat seeds/reference-date changes, upserts only owned demo events, and rolls back on identity collision.                                                                                                                   |
| Seed coverage         | `apps/backend/src/db/demo.ts` seeds 198 events across three areas, with exact/date-only/unannounced schedule, all price variants, scheduled/cancelled/postponed status, missing artwork and broken remote image. Content explicitly names a demo community space. There are no real event addresses or attendance links to reuse.                           |
| Route behavior        | `apps/backend/src/app.ts` documents registered TypeBox routes through Swagger, validates requests, and maps catalog failures into shared error envelopes. Local-only catalog guard and configuration allowlists apply. `/v1/events` lists by area; no detail route exists.                                                                                  |
| Database access       | `createCatalog` uses Kysely, parameterized values, and repeatable-read transactions to avoid mismatched area metadata/event rows during reseeding. Primary key lookup is sufficient for a detail endpoint; no spatial/search index is needed.                                                                                                               |
| Imports               | The default registry in `worker/main.ts` is empty. Fixture jobs update operational counters only; `fixtures/sample-events.json` is not a live catalog ingestion adapter. Advisory lock, transactional writes, retries, and interruption recovery already exist for jobs.                                                                                    |
| Local data            | `apps/mobile/src/data/area-sqlite.ts` uses `mireqo.db`, a namespaced preference migration table, and a selected-area preference. There are no saved tables. SQLite migrations must preserve that preference and its migration records.                                                                                                                      |
| Mobile error boundary | `apps/mobile/src/data/catalog.ts` maps every non-400 HTTP error into generic `UNAVAILABLE`; it currently cannot distinguish a missing detail from an outage. Existing 400 behavior is tied to legacy demo/context refresh.                                                                                                                                  |

## Recommended minimal shared contract

Add one route, `GET /v1/events/:eventId`, and a new strict detail contract module exported from `packages/contracts/src/index.ts`. Do not change the wire shapes of existing summary, schedule, listing, or discovery responses.

Recommended response envelope:

- `area`: existing `Area` for the event, even if it differs from the active browsing area.
- `event`: existing `EventSummary`, retaining exactly the same ID and semantics.
- `details`: new strict object with nullable `description`, `address`, `endsAt`, and `externalLink`. `externalLink`, when supplied, contains its URL and semantic kind (`event` or `tickets`) so UI labels do not infer ticket sales from a generic URL. Existing `area.name`, venue, neighborhood, category, price, image, and status should be reused rather than duplicated.
- `demo`: existing demo provenance/reference-date/dataset-version object, persisted with snapshots so offline views cannot misrepresent these events as live.

Nullable fields represent missing supported information; do not create empty strings or placeholder descriptions/addresses to satisfy validation. No extra organizer, doors, age restriction, accessibility, map coordinates, multi-session, or similar-event model is necessary without fixture evidence and approved scope.

Validation should cover strict field shape; nonempty bounded text when present; well-formed HTTPS URLs with no credentials; valid ISO instants/dates; `event.areaId === area.id`; valid price ranges; and `endsAt >= startsAt` when an exact schedule supplies an end. An end instant should remain null for date-only/unannounced records in this slice rather than fabricating a start or duration. Reuse existing summary semantic validation via a focused helper or an exact legacy-shaped projection, as discovery currently does. The mobile consumer also checks response event ID against the requested ID.

Validate the path ID as bounded nonempty text without requiring a UUID: existing IDs contain colons. Encode the complete ID on the mobile boundary. The lookup accepts no selected-area filter, discovery context, date filter, cursor, or pagination input, so saved past events and events from another selected area remain accessible.

The API exposes raw schedule/status evidence, not a persisted `past` boolean. Mobile derives classification from current time and the confirmed date policy, including when offline. A card summary cannot supply a known end until detail hydration occurs: save the summary immediately and later enrich it, with truthful unknown-end behavior until an end is known.

## Recommended backend storage and lookup

1. Add a new versioned migration after `003_catalog`; never edit the applied migration. Add a nullable `details jsonb` column to `catalog_events`, with a basic null-or-object constraint, and synchronize the explicit Kysely interface. Avoid storing a second full event object with a competing ID/title/schedule.
2. Existing rows remain valid with null detail payload. The endpoint should return their existing summary and nullable detail fields with HTTP 200; lack of extra fields is not an event removal. Do not backfill invented descriptions/links/end times or implicitly reseed in migration/startup.
3. Add a focused detail lookup operation to the catalog boundary. Select the event, its area and relevant demo metadata in one joined statement, or an equivalent repeatable-read snapshot if separate reads are clearer. Preserve the supported-area/local-demo guard. Validate the composed response before sending it.
4. Keep list selection, ordering, cursors, category/date filtering, and response schemas unchanged. New internal columns must never leak through `selectAll()` mappings: existing list mapping already emits `row.summary` only.
5. Extend readiness to probe the new required column (or equivalent schema state), so a database stopped at migration 003 is reported as not ready rather than readiness succeeding while details fail.
6. No new indexes, PostGIS geometry, additional services, source adapter, worker schedule, or HTTP writes are needed. Existing architecture rules still govern any future imports: omission preserves prior data unless a provider explicitly removes it; missing records or fetch failures are not cancellation/postponement evidence.

### Errors and missing events

| Condition                                                           | Recommended public behavior                               | Saved consequence                                                                                                                      |
| ------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Existing event, absent extra metadata                               | 200, nullable detail fields                               | Keep membership and display known information.                                                                                         |
| Valid ID has no current catalog row                                 | 404 `EVENT_NOT_FOUND` in shared error envelope            | Keep snapshot; explain current details are unavailable. Do not mark cancelled, remove automatically, or erase last successful refresh. |
| Invalid path/input                                                  | 400 `INVALID_REQUEST`                                     | Show recoverable invalid-request state without modifying membership.                                                                   |
| Database unavailable, demo guard disabled, malformed stored payload | 503 `CATALOG_UNAVAILABLE`, with no SQL/credential details | Retain cached/saved snapshot and offer retry. An HTTP failure alone does not mean device offline.                                      |

There is no removal history/tombstone in the current catalog. A 404 cannot prove that an event previously existed or was cancelled; do not introduce a 410 or claim a verified removal. Unknown and removed IDs deliberately share the missing-current-details behavior. The detail fetch boundary needs status-aware error handling without changing legacy listing's 400 recovery semantics.

## Recommended fixture and import work

Extend the explicit demo seed transaction with deterministic, clearly synthetic detail payloads for the existing stable IDs. Include a readable and a long expandable description, nullable description/address/link/end, known exact end, an overnight end, cancellation, postponement, and existing missing-image cases. Addresses must visibly identify synthetic examples; map actions should search the available demo venue/area truthfully rather than claim a precise real event location. Do not invent coordinates.

Keep the existing 198 summaries, order keys, schedule cases, ownership checks, and IDs unchanged where possible. Detail payloads can vary without adding rows or displacing discovery cases. Past-state testing can advance a deterministic clock or seed with an earlier explicit reference date, rather than altering current listing semantics. Use a version bump such as `demo-v3:<referenceDate>` for the revised fixture dataset and document deliberate cursor invalidation on reseed; the listing protocol remains unchanged.

Normal fixtures can use `externalLink: null`. Use a controlled valid HTTPS fixture or explicitly labeled demo destination for native external-action verification, clearly distinguish generic View Event from Get Tickets, and do not present a real organizer/homepage as the official page of a fictional event. An unusable reserved example URL does not prove a successful external page load. Native link-handler failure/cancel tests remain useful separately.

No provider credentials or live access are required. Operational seed and worker stay unchanged except schema typing/readiness consequences. Keep transactional same-date seed idempotency, preservation of unrelated rows, mid-seed failure rollback, and source ownership rules.

## Mobile persistence contract integration

The mobile owner should define a versioned saved snapshot that contains summary, area, demo provenance, nullable hydrated details, and a timestamp of the last successful retrieval. Distinguish a summary-only save from a successful detail fetch containing legitimate null fields. The source's `updatedAt` is different from local `lastSuccessfullyRefreshedAt`; a failed refresh must advance neither successful-detail freshness nor overwrite usable content.

Saving directly from a card must immediately store enough available summary/area information to survive offline restart; it must not wait for a detail request. Hydrate later through the same ID-based detail API. Subsequent summary-only refreshes must not erase known details/end/address, and completed requests must not resurrect an unsaved entry or overwrite a newer snapshot. Remote responses own event content only; SQLite/shared saved operations own membership. A new nullable detail response may legitimately clear a formerly known field; distinguish this from receiving only a summary.

Namespaced Saved migrations can coexist with the current preference migration table in `mireqo.db`; avoid resetting its global schema or deleting area selection. Local persistence is not a reason to add saved fields/end times to existing listing responses.

## Verification expectations for implementation and tester

These are proposed checks, not results:

- Contract tests: every schedule/price/status variant; valid nullable metadata; impossible dates/end-before-start; malformed URL; extra fields; area/event ID mismatch; detail end rejected for unsupported schedule kinds. Keep legacy strict-parser tests unchanged and add an explicit assertion that old list payloads never gain new fields.
- HTTP/OpenAPI tests: documented parameter and 200/400/404/503 envelopes; existing/past/cancelled/postponed/metadata-missing lookup; foreign-selected-area independence; encoded colon-containing ID; missing/invalid IDs; outages/disabled demo guard; no internal error leakage.
- Actual PostgreSQL integration: fresh and repeat migrations; upgrade from 003 with pre-existing catalog/source/import/fixture rows, exact preservation of their summaries/IDs/source links/order, null detail behavior, and readiness failure before the new schema. Test actual joined/transactional reads and malformed stored payload recovery.
- Seed integration: full same-date row equality after repeat seed; source counts/identity unchanged; unrelated data preserved; rollback includes detail payloads and area metadata on mid-seed collision; reference-date/version reseed invalidates existing cursors through existing behavior; old listing contracts and stage-2 filtering/pagination continue passing.
- Mobile/API integration: validated real detail response; summary-only saved restart offline; successful enrichment; missing-current-details versus outage; preserved last-success timestamp; partial snapshot refresh failures; no saved-membership resurrection; known-end versus local-day classification at the exact boundary. Native action checks remain the mobile owner's responsibility.
- Use repository-managed `mise exec -- pnpm check` and `mise exec -- pnpm test:integration` at implementation/testing stages. Integration requires allowlisted disposable test PostgreSQL/PostGIS plus existing development service for preservation checks; it is not replaced by mocks/typechecking. No new live provider check is needed.

## Handoff and remaining choices

Shared contract ownership precedes parallel mobile/backend implementation. Agree the final envelope/nullable-field and error names, then backend/fixture work and mobile consumers can proceed independently against the same contract. Migration must precede running a new detail API against an existing database; explicit reseeding is a separate development operation.

No remaining product decision is required for the confirmed date policy or local-only saved ownership. The exact controlled demo external destination still needs to be recorded by the integrated planner before treating successful external-page navigation as verified; selecting it must not invent a provider or real fictional-event attendance page. Precise field/module/table names above are recommendations and may be adjusted routinely while preserving these compatibility and truthfulness constraints.
