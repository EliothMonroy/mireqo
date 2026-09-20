# Mireqo product webpage tasks

Status: independent testing passed; ready for review.

## Inventory and ownership

- Base main: `54d0ea1676a227e7e528b03d94b5be996d0761a8`.
- Authoritative worktree: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/mireqo-webpage` on `codex/mireqo-webpage`.
- Coordinator/planner owns `plan.md`, `decisions.md`, and this task list’s planning rows. Implementer owns `implementation.md` and I01–I05 status.
- No implementer commits/pushes. Preview server for verification used `PORT=4280` (PID recorded in the local Cursor terminal session); default 4173 was occupied by an unrelated project.

| ID  | Outcome                                                                                                   | Depends on     | Owner                | Status                                    |
| --- | --------------------------------------------------------------------------------------------------------- | -------------- | -------------------- | ----------------------------------------- |
| P01 | Inspect handoff, workspace, assets, and write durable plan                                                | None           | Planner              | Complete                                  |
| P02 | Record destination, static-stack, and claim-boundary decisions                                            | P01            | Planner              | Complete                                  |
| I01 | Create isolated worktree/branch; copy plan records                                                        | P01/P02        | Lead implementer     | Implemented                               |
| I02 | Scaffold `@mireqo/website`, copy brand/screenshot assets, add preview server                              | I01            | Lead implementer     | Implemented                               |
| I03 | Implement static page HTML/CSS per handoff (header, hero, features, coverage/footer, favicons)            | I02            | Lead implementer     | Implemented                               |
| I04 | Add node:test coverage for structure, copy, assets, word budget, and no API coupling                      | I03            | Lead implementer     | Implemented                               |
| I05 | Update architecture.md and build.md; run website tests and layout/preview checks; write implementation.md | I03/I04        | Lead implementer     | Implemented and verified                  |
| T01 | Independently verify AC01–AC09 and current working tree                                                   | I05 passed     | Independent tester   | Passed                                    |
| R01 | Inspect actual passing implementation and evidence; determine verdict                                     | T01 passed     | Independent reviewer | Successful                                |
| R02 | Successful verdict: changelog, commit, push/PR, and safe task cleanup                                     | R01 Successful | Reviewer             | Commit and PR done; worktree cleanup next |
