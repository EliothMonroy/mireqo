# Discover collections — final independent review

Date: 2026-09-18

## Verdict: Successful

R01-F01 is resolved. Re-review inspected the shared themed event-card placeholders, all three initial loading call sites and focused rendering regressions. Pagination remains compact and refresh retains real cards. Independent tester evidence covers initial context, preview and list loading on Android and iOS, in light and dark/enlarged text, accessible labels and transition to real events. Representative Android context and iOS dark/enlarged list screenshots were visually inspected by the reviewer.

The current 91-file manifest matches the source. SHA-256: `1a205be5c7df30331a7703472c49af617a16e2a3223fe26fc011ad98a8b98a1b`. Current full host check passed with 40 mobile tests in 13 suites. Backend/contracts remain unchanged from the passing real PostgreSQL/PostGIS integration and 111 independent live API comparisons. The earlier complete source review below remains applicable; no unresolved findings remain. Reviewer independently repeated manifest verification and `git diff --check`, and inspected current tester evidence; no fresh rerun of the tester's full suites is claimed.

AC01–AC10 have adequate evidence for the agreed stage-2 scope. Physical devices, screen-reader audio, new native compilation, release signing, production/live providers and iOS-wide connectivity loss remain outside the verified claims. Native list-footer refresh retry is not claimed; shared renewal and native Discover cached-refresh evidence remain distinct.

## Current delivery status

R01 complete: Successful. R02 complete: feature committed, pushed and PR opened. Authenticated GitHub account `EliothMonroy` verified; `EliothMonroy/mireqo` is public with push/admin permission and default branch `main`.

- Feature commit: `4c38b70333f4a7b9e2fe87033732223898b6efc5` — `feat - add Discover date filters and collection browsing`.
- Push: `codex/discover-collections` successfully published to origin with upstream tracking.
- Pull request: [#4 — Add Discover date filters and collection browsing](https://github.com/EliothMonroy/mireqo/pull/4), base `main`, source `codex/discover-collections`; attached to the Codex task. No merge, deployment or release.
- Dated changelog included. No speculative backlog item added. Final source/delivery review and credential-pattern scan found no unintended changes or exposed secrets. Only trailing whitespace was removed from two captured test logs; application source remained identical to the verified manifest.
- Cleanup: confirmed the backend helper agent completed and its branch had no divergent commits. Fourteen helper files matched authoritative copies; three unique planning documents were archived opaquely under `helper-archive/` with hashes and committed/pushed before removal. Ignored helper content consisted only of dependency/build directories. Removed `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/discover-collections-backend` and `codex/discover-collections-backend` successfully.
- Retained: open PR source branch and authoritative worktree; original root planning drafts; active normal API/Metro preview, development/test databases, emulator/simulator and temporary native result bundles. These remain useful for the open PR and preserve development data/evidence. Durable feature evidence is committed; no blanket cleanup performed.

This follow-up delivery record contains no application changes.

## Initial review record (superseded by the successful re-review above)

Date: 2026-09-18

## Verdict: Changes required

Reviewed the current requirements and passing evidence in `reviewer-current.md`, repository guidance, architecture/build boundaries and relevant specifications. Inspected all modified and untracked application/contract/test source, including the deleted single-feed hook and its replacement modules. No application code was changed during review.

Reviewed base: `b3ef0fa6c9867fb50010b165246f35c02cad3365`, branch `codex/discover-collections`, authoritative worktree `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/discover-collections`.

The 90-file source manifest matches the working tree; manifest SHA-256 is `e22eac084621ca39ee7c50f02ac2c2e2e691c6df6ddfd15fef40ac4d646ffc78`. Reviewer independently reran manifest verification and `git diff --check`; both passed. Existing tester evidence records passing full host checks (37 mobile tests), real PostgreSQL/PostGIS integration, 111 live ordered-result comparisons and Android/iOS native flows. Reviewer inspected those current results and representative native dark/enlarged-text and offline screenshots. This review does not claim fresh execution of the tester's host, integration or native suites.

## Required finding

### R01-F01 — P2: Restore structured placeholders for initial event loading

`apps/mobile/src/features/discover/DiscoveryParts.tsx:34-40` defines `Loading` as only an activity indicator and text. This component is used for initial context loading in `DiscoverScreen`, each initially pending `DiscoverySection`, and the initial empty `EventListScreen`. Consequently a slow initial request or uncached area/date selection produces spinner/text regions with none of the event imagery/title/metadata structure that will occupy the screen after results arrive. The prior Discover screen had two structured event-card placeholders; this change removes them.

Requirement: `spec/feature-spec.md`, SPEC 1, Loading State says to show placeholders representing the eventual content structure and keep the screen stable. `spec/ui-spec.md`, section 58, likewise requires structured placeholders resembling eventual content. The current stage-2 scope does not exclude loading-state presentation, and AC08 explicitly covers loading.

Required correction: use a shared, themed event-shaped placeholder for initial Discover context, section and full-list loading, including an appropriate accessible loading announcement. Keep the compact indicator for incremental pagination, and retain usable cards during refresh. This is restoration of the documented loading behavior, not a request for a redesign.

Verification for correction: cover pending context/preview/list states with focused rendering assertions; inspect the initial loading appearance on Android and iOS (light/dark and enlarged text as affected), and rerun affected regression checks. Tester must independently verify the correction and provide a current passing handoff/source identity before re-review.

## Other review conclusions

- Server-owned time contexts, selected-area calendar ranges, exact-time cutoff and undated eligibility match the clarified rules. SQL filters before pagination, parameterizes values and binds cursors to the complete selection and boundary.
- Legacy response parsing remains strict; additive contracts and routes preserve the old endpoint. Seed changes retain stable original identities, explicit invocation and local-demo safeguards. No migration, worker behavior change, dependency addition or native configuration change was introduced.
- Mobile query identities include area, generation and filters. Separate section queries isolate failures; same-scope retained results are identified as snapshots and incompatible filters do not borrow prior results. Native list routes preserve parent state and remain thin.
- Evidence limitations remain as stated in the handoff: no physical-device or screen-reader-audio verification, new native compilation, release signing, production/live-provider validation or iOS-wide connectivity-loss test. List-footer refresh retry is not claimed as a native observation; shared renewal and native Discover cached-refresh evidence are distinct.

## Delivery status

R01 review completed with changes required; awaiting implementer correction followed by independent tester verification. R02 delivery has not started. No changelog entry, commit, push, PR, merge, deployment or cleanup was performed. All feature and helper worktrees/branches and original planning drafts remain preserved.
