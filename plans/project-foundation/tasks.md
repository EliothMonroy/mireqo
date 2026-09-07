# Project foundation tasks

## Resource ownership

- Planning owner: `foundation_planner`; coordinating owner: root agent.
- Current authoritative planning copy: `/Users/eliothmonroy/Documents/Github/mireqo/plans/project-foundation/`.
- Base branch: `main`; base commit: unavailable (unborn repository).
- Proposed implementation branch: `codex/project-foundation`; worktree: not created or assigned.
- No temporary branches or worktrees created by this planning task.
- On worktree creation, record its absolute path/base commit and deliberately synchronize these records into that authoritative working copy.

| ID | Outcome | Dependencies | Owner | Status |
| --- | --- | --- | --- | --- |
| F01 | Establish authorized baseline and dedicated feature branch/worktree | Baseline authorization received | Coordinator, then implementer | Ready: coordinator creates approved baseline, implementer isolates work |
| F02 | Inspect native host readiness and select/document compatible exact toolchain | None for read-only research; F01 for implementation | Implementer | Ready for inspection |
| F03 | Configure mise/pnpm, manifests, lockfile, ignores, and minimal Expo Router app | F01, F02 | Implementer | Pending |
| F04 | Implement documented commands, strict checks, boundary enforcement, and meaningful tests | F03 | Implementer | Pending |
| F05 | Verify frozen install, host checks, and Android/iOS build/install/launch; update executable build guide | F04, available native prerequisites | Implementer | Pending |
| F06 | Independently verify acceptance criteria and current code state; record testing evidence | F05 passing | Tester | Pending |
| F07 | Independently assess implementation against goal and acceptance criteria | F06 passing | Reviewer | Pending |
| F08 | Update changelog, commit using `task - ...`, push/create PR, safely clean task resources | F07 successful; usable remote destination | Reviewer | Pending |

Execution status is not feature approval. The implementer never commits or pushes. Tester/reviewer cannot delegate. Planner/implementer delegation remains subject to the workflow's shared concurrency limit and runtime capacity.
