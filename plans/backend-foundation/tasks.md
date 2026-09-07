# Backend foundation tasks

Original planning copy (superseded by feature worktree): `/Users/eliothmonroy/Documents/Github/mireqo/plans/backend-foundation`. The feature worktree below is authoritative; root originals remain preserved.

| ID   | Outcome                                                                                               | Depends on | Owner                      | Status                    |
| ---- | ----------------------------------------------------------------------------------------------------- | ---------- | -------------------------- | ------------------------- |
| BF01 | Finalize foundation scope and dependency/runtime choices in decisions.md                              | None       | Planner + coordinator/user | Ready; decisions recorded |
| BF02 | Create feature branch/worktree; preserve agreed root doc edits and copy plans; record inventory       | BF01       | Implementer                | Implemented and verified  |
| BF03 | Relocate Expo to pnpm workspace; preserve tooling/native commands and establish contracts package     | BF02       | Implementer                | Implemented and verified  |
| BF04 | Compose/PostGIS, explicit migrations, typed operational data access, guarded test target and seed     | BF02, BF01 | Implementer                | Implemented and verified  |
| BF05 | Fastify health/readiness/errors/OpenAPI and shared-schema consumers                                   | BF03, BF04 | Implementer                | Implemented and verified  |
| BF06 | Separate worker and fixture operational lifecycle/exclusion/recovery                                  | BF04       | Implementer                | Implemented and verified  |
| BF07 | Integrate checks/docs; frozen install, DB/API/worker tests, native regression, implementation handoff | BF03–BF06  | Implementer                | Implemented and verified  |
| BF08 | Independently verify all AC and prepare passing curated handoff                                       | BF07       | Tester                     | Implemented and verified  |
| BF09 | Independent verdict, then reviewer-owned changelog/commit/PR and safe cleanup                         | BF08       | Reviewer                   | Pending                   |

BF03 and BF04 can be conceptually independent after contract/tool ownership is clear, but this does not require delegation. All implementation is integrated and verified in one authoritative feature worktree. Tester/reviewer do not delegate.

## Branch/worktree/resource inventory

- Base: `main`, `acbb0babd6efd18910bfe36492a92f1ffa7b236d`.
- Intended feature branch: `codex/backend-foundation`; created by implementer.
- Authoritative feature worktree: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/backend-foundation`.
- Helper: `codex/backend-mobile` at sibling `.worktrees/backend-mobile`; mobile relocation integrated, no commits.
- Resources: Compose project mireqo, dev volume mireqo_development and test tmpfs; logs /tmp/mireqo-backend-*.log; Colima mireqo shared host runtime.
- Root edits to carry: architecture.md, build.md, implement_new_feature.md, implementer.md, planner.md, reviewer.md, tester.md.
- Temporary databases, Compose project/volumes, API/worker processes, native runtimes, logs: none created by planner; active owners must inventory their resources for safe cleanup.
