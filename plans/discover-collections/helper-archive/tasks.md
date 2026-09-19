# Discover collections tasks

Status as of 2026-09-18: planning only. No code, dependency installation, feature branch/worktree, commit, test run or PR is part of this planning turn. The reviewer has not assessed implementation success.

## Authoritative records and checkout inventory

- Base branch: `main`.
- Base commit: `b3ef0fa6c9867fb50010b165246f35c02cad3365`.
- Current authoritative planning copy: `/Users/eliothmonroy/Documents/Github/mireqo/plans/discover-collections/`.
- Current checkout: `/Users/eliothmonroy/Documents/Github/mireqo` on `main`.
- `git status --short` was empty before these planning files were created.
- `git worktree list` showed only the main checkout; no stage-2 worktree exists.
- Future feature branch/worktree: unassigned. Implementer must create an isolated `codex/` branch and record its actual absolute path before code edits. Do not modify main for implementation.
- Planner owns only plan.md, tasks.md and decisions.md in this turn. Coordinator handles user clarification and stage transition. No helper agents or temporary services were created by this planner.

When implementation is authorized, copy the current agreed records into its worktree and designate that copy authoritative. Record every helper branch/worktree, temporary service/port and artifact with its owner before use. Preserve unrelated work and avoid divergent plans.

## Tasks

| ID | Outcome | Depends on | Owner | Current status |
| --- | --- | --- | --- | --- |
| P01 | Inspect guidance/specs and current mobile/contracts/backend; write durable scope, integration points and acceptance criteria | None | Planner | Complete for planning; no implementation verdict |
| P02 | Clarify already-started exact event eligibility in default versus explicit calendar filters; record user answer in Q01 and update criteria | P01 | Coordinator/planner with user | Complete; user accepted hiding past-start exact events in default |
| P03 | Confirm transition from discussion/planning to implementation and establish authoritative feature branch/worktree | P02, explicit implementation authorization | Coordinator then implementer | Not started |
| I01 | Publish concrete additive discovery request/response/category/context contract and compatibility/cursor strategy; add shared schemas/validation tests | P03 | Implementer, shared-contract owner | Not started |
| I02 | Implement deterministic clock/range rules and complete PostgreSQL filtering before pagination; preserve error/readiness/legacy behavior and generate OpenAPI | I01 | Implementer, backend owner | Not started |
| I03 | Expand deterministic owned demo fixtures and any justified migration/index; verify repeatability/upgrade/unrelated preservation | I01, I02 query shape | Implementer, backend owner | Not started |
| I04 | Add runtime-validated mobile catalog operations, complete Query identities, lifecycle/rollover behavior and independent section recovery | I01 | Implementer, mobile data owner | Not started |
| I05 | Build quick dates, category/collection previews and full list routes; preserve parent navigation/scroll state, area/date rules and accessibility | I04 | Implementer, mobile UI owner | Not started |
| I06 | Integrate real API/mobile flow, update architecture/build implemented-state notes and run host/DB/native checks; write implementation.md and tested-state evidence | I02–I05 | Lead implementer | Not started |
| T01 | Independently verify AC01–AC10 using current code, real database and both native platforms; write testing.md and curated passing handoff | I06 passing implementer handoff | Tester | Not started |
| R01 | Independently inspect current passing changes/evidence and record Successful or Changes required | T01 passing | Reviewer | Not started |
| R02 | After Successful verdict, dated changelog, appropriate feat commit, push/PR and safe task-resource cleanup; preserve open PR source branch | R01 Successful | Reviewer | Not started |

## Coordination and readiness

Planning decisions are complete, including P02. Implementation has not started; there is no implementation blocker history or blockers.md. The coordinator may resolve routine contract/range technical design independently once product behavior is agreed. Silence is not an answer or authorization.

During authorized implementation, backend and mobile tasks can proceed independently only after I01 establishes one shared-contract owner, frozen integration shape and version-control ownership. Implementers may delegate under workflow limits and actual runtime capacity, with separate helper worktrees and no commits/pushes. The lead implementer integrates and re-verifies the combined diff. Tester and reviewer cannot delegate.

If implementation or verification cannot meet criteria, its owner writes blockers.md and returns to planner for disposition; defects follow the implementer→tester loop. Do not waive verification to advance. Provide reviewer only self-contained current clarified requirements, current implementation summary, passing evidence, tested source state and actual inventory. Exclude blocker files/history from reviewer input without concealing unresolved defects.

## Verification and completion tracking

No checks were run for this planning-only change. P01 records read-only repository inspection, not code verification. Future owners record actual commands, exit results, native device/runtime/action evidence, source fingerprint and limitations in their own handoff files. Task completion, tester pass, reviewer feature verdict and PR delivery are separate statuses.

## Authorized implementation — 2026-09-18

User requested “implement it.” P03 is complete. Authoritative records are now `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/discover-collections/plans/discover-collections/`. Lead implementer owns mobile and integration in branch `codex/discover-collections`, worktree `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/discover-collections`, base `b3ef0fa6c9867fb50010b165246f35c02cad3365`. Original main planning copy is preserved.

Delegated backend implementer owns only packages/contracts, apps/backend and backend-notes.md in dedicated `.worktrees/discover-collections-backend`, branch `codex/discover-collections-backend`, same base. Output: frozen shared contract followed by reviewed uncommitted patch and backend-notes.md; complete I01–I03 with integration tests. Lead owns apps/mobile, architecture/build updates and integrated I04–I06. No commits/pushes. Coordinator owns service/device readiness and native assistance.
