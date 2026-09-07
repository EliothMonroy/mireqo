# Project foundation tasks

## Resource ownership

- Planning owner: `foundation_planner`; coordinating owner: root agent.
- Current authoritative feature records: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/project-foundation/plans/project-foundation/`; copied by Git from the approved baseline.
- Base branch: `main`; base commit: `e48d952`.
- Implementation branch: `codex/project-foundation`; worktree: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/project-foundation`; owner: `foundation_implementer`.
- Only task worktree/branch is the implementation worktree listed above.
- On worktree creation, record its absolute path/base commit and deliberately synchronize these records into that authoritative working copy.

| ID  | Outcome                                                                                                 | Dependencies                                        | Owner                         | Status                               |
| --- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------- | ------------------------------------ |
| F01 | Establish authorized baseline and dedicated feature branch/worktree                                     | Baseline authorization received                     | Coordinator, then implementer | Complete                             |
| F02 | Inspect native host readiness and select/document compatible exact toolchain                            | None for read-only research; F01 for implementation | Implementer                   | Complete: pinned toolchain installed |
| F03 | Configure mise/pnpm, manifests, lockfile, ignores, and minimal Expo Router app                          | F01, F02                                            | Implementer                   | Complete                             |
| F04 | Implement documented commands, strict checks, boundary enforcement, and meaningful tests                | F03                                                 | Implementer                   | Complete                             |
| F05 | Verify frozen install, host checks, and Android/iOS build/install/launch; update executable build guide | F04, available native prerequisites                 | Implementer                   | Complete                             |
| F06 | Independently verify acceptance criteria and current code state; record testing evidence                | F05 passing                                         | Tester                        | Complete                             |
| F07 | Independently assess implementation against goal and acceptance criteria                                | F06 passing                                         | Reviewer                      | Passed; ready for reviewer           |
| F08 | Update changelog, commit using `task - ...`, push/create PR, safely clean task resources                | F07 successful; usable remote destination           | Reviewer                      | Pending                              |

Execution status is not feature approval. The implementer never commits or pushes. Tester/reviewer cannot delegate. Planner/implementer delegation remains subject to the workflow's shared concurrency limit and runtime capacity.
