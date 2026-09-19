# Discover collections decisions

Planning date: 2026-09-18. This record distinguishes user decisions from planner proposals. Implementation was authorized with “implement it” on 2026-09-18; execution status is recorded in tasks.md.

## Confirmed user decisions

The user accepted Discover stage 2, then explicitly accepted these date and interaction rules:

| ID  | Confirmed behavior                                                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D01 | Stage 2 adds date shortcuts, category browsing, Discover collections and paginated collection lists. Stage 3 remains event details and saving.                                                                                                               |
| D02 | Keep the development mock catalog and current areas: Coacalco, Tultitlán and the whole of Mexico City. No live sources are introduced.                                                                                                                       |
| D03 | Quick dates are Today, Tomorrow, This Weekend and This Week, with a clear reset to default. All use the selected area's timezone, currently `America/Mexico_City`.                                                                                           |
| D04 | Today and Tomorrow mean their corresponding calendar day. This Week means today through Sunday. This Weekend means the upcoming Saturday–Sunday; during the weekend, only the remaining days. Saturday includes Saturday and Sunday; Sunday includes Sunday. |
| D05 | Default discovery shows upcoming events, followed by undated events. An active date filter excludes undated events. Exact-time events are included only when their start is at or after the browsing reference instant; see resolved Q01 below.              |
| D06 | Date selection applies across Discover. Categories combine with that date. Free Events and Music respect the date selection.                                                                                                                                 |
| D07 | Happening Today and This Weekend collections appear only in the default view, avoiding conflicting date scopes. Hide genuinely empty collections.                                                                                                            |
| D08 | See All inherits the collection, area and date context. Going back restores the previous browsing position. Changing area preserves the date choice.                                                                                                         |
| D09 | Fixture dates change only through explicit reseeding; API reads never roll dates forward.                                                                                                                                                                    |
| D10 | Initial collection set is Happening Today, This Weekend, Free Events and Music. Popular and Recommended For You are deferred until meaningful signals exist.                                                                                                 |

The previous stage's agreed warm editorial presentation, light/dark support, truthful event metadata and visible demo provenance continue to apply. These decisions extend stage 1; they do not authorize unfinished full-spec tabs, Search, GPS, accounts, details or saved events.

## Resolved date clarification

### Q01 — Exact-time events that already started (resolved)

The current exact schedule contains `startsAt` and timezone only. There is no end time, duration or authoritative ongoing state. The planner asked whether an earlier start today should remain discoverable in the default view; the user accepted hiding these events with “makes sense.”

**Confirmed user decision:** in default discovery, include exact-time events only when their start is at or after the browsing reference instant; include date-only events through their full local day. Explicit calendar filters, including Today and the temporal collections, include starts anywhere in the selected day range, even earlier today. Never label a past-start event as ongoing or completed without evidence, and do not invent an end time.

**Impact:** this determines eligibility in default, Music and Free Events without an active date filter, especially afternoon/evening usage and long events. Backend eligibility, fixtures and mobile copy must follow this rule. No product clarification remains open in this plan. The clarification preceded the explicit implementation authorization on 2026-09-18.

## Routine planning proposals, not additional user approvals

- Categories open their own filtered list, inheriting the Discover date. They do not apply an unrelated category globally to the Music collection. Reuse the current truthful demo category labels Music, Market, Art and Outdoors for the initial selector; do not fabricate catalog coverage for every category example in the specs. Define stable category identifiers in contracts independently of presentation labels.
- Preserve a general upcoming/all-category result path alongside collection previews, so date-filtered non-music paid events remain discoverable. A selected date must not leave only Free and Music results.
- Follow existing deterministic chronological ordering and ID tie-breaking. Date-only entries precede exact-time entries on their date; undated entries sort last in default. Do not claim relevance, personalization, distance or popularity ranking.
- Preserve explicit cancellation/postponement status on cards. Stage 2 does not infer cancellation, invent a replacement date or add a new status exclusion. Category/price/date filtering operates on the supplied metadata.
- Free Events means explicit `price.kind === 'free'`. Unknown prices remain omitted in presentation and never match Free. Numeric zero in a different price variant is not silently reclassified.
- Date/filter context is session state. Only the selected area continues to persist in SQLite. No whole-session restart restoration is added.
- Quick-date chips act immediately and reset removes the date selection. No advanced draft filter sheet, custom date range, extra sorting options, or generic filtering framework is needed for this scope.
- Selecting a different area or date starts that result context at its first page and clears incompatible cursors; returning from a child list restores its unchanged parent context and position. Area changes retain the selected date shortcut, whose bounds are recomputed for the area's timezone.

## Technical decisions to resolve in implementation design

These are technical choices within the agreed architecture, not outstanding product questions:

1. Use additive opt-in discovery query behavior or dedicated discovery endpoints. Do not silently change legacy `/v1/events` default semantics or add response fields its strict parser rejects. Publish the concrete request/response shape and compatibility strategy before parallel mobile implementation.
2. Use an explicit backend clock. Establish one consistent effective time/date context for a browsing generation, shared by section previews and their lists, and bind it into cursors. Re-evaluate at refresh, relevant app focus and selected-area local midnight; no hidden frozen demo clock. Record exact context encoding and expiry/invalidation rules in implementation notes.
3. Exact schema/index changes depend on the resulting SQL query. Existing `summary` JSONB can express these filters; do not add tables or duplicate columns speculatively. Any needed schema change is migration004 or later, never an edit to applied migration003.
4. Use existing Expo Router, Query, SQLite, native StyleSheet and pinned dependencies. A new date, state, navigation, design or provider dependency is not pre-approved.

## Specification notes

The specs list example categories/collections and a fuller product. The focused initial collection/category set is intentionally smaller. Details/save and unrelated tabs remain deferred under the established stages. This stage supersedes stage 1's deliberate all-demo-dates browsing only for the new Discover behavior; legacy API compatibility must be explicit. Architecture/build implemented-state descriptions should be updated when implementation lands, not reported as complete during planning.

## Implemented technical decisions

- Dedicated additive discovery context/events endpoints preserve strict legacy `/v1/events` shape and behavior. Published fields and compatibility are described in backend-notes.md.
- Context is a backend-signed token with effective instant/local date, area/dataset identity and 24-hour expiry. Preview/list/paging use the same token; refresh, app foreground and local midnight request a new generation. API restart and dataset changes invalidate old context.
- Existing catalog JSONB/order index supports the scoped query; no schema migration or dependency is added.
- Two-event independent previews link to six-event paginated native stack lists from their first page. All upcoming/date results remain reachable above the focused collections. Four existing category labels map to stable contract IDs.
- Expo Router retains parent screen/scroll state; route inputs are validated identifiers only. Session date resets on process restart; SQLite continues to store only area.
