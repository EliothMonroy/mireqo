# Implementing new work

## Authority and scope

This document is the source of truth for the workflow whenever code changes are to be implemented in Mireqo: new features, bug fixes, refactors, dependency upgrades, and other maintenance. Read it before starting implementation and use the linked personas for their respective responsibilities.

[AGENTS.md](AGENTS.md) defines repository-wide collaboration and specification authority. Product requirements remain in [spec/](spec/), technical boundaries in [architecture.md](architecture.md), and environment/build commands in [build.md](build.md). This workflow does not replace those requirements or override explicit user direction.

Planning-only requests stop at planning. A request to discuss or edit guidance does not itself authorize application implementation, dependency installation, commits, or PR creation. For an authorized code-change task, follow the full sequence below, including reviewer-owned delivery after success, unless the user explicitly limits the scope.

## Persona responsibilities

| Persona | Responsibility | Output and next owner |
| --- | --- | --- |
| [Planner](planner.md) | Clarify requirements with the user, document the goal and tasks, resolve blockers | Ready plan → implementer; unresolved decisions remain with planner/user |
| [Implementer](implementer.md) | Implement in a dedicated branch/worktree and verify changes; never commit or push | Implemented and verified → tester; blocked → planner |
| [Tester](tester.md) | Independently verify the current implementation; never fix application code | Passing verification → reviewer; defects → implementer; blocked/unclear → planner |
| [Reviewer](reviewer.md) | Independently assess feature success, then perform delivery and safe cleanup | Changes required → implementer then tester; successful → commit and PR |

Read the assigned persona before acting. The coordinating agent manages stage transitions and documented handoffs without taking over another persona's authority. Tester and reviewer work must remain independent of the implementation. Do not silently collapse those stages into implementer self-approval if runtime capacity or tooling is unavailable; record the limitation and route it through planning.

## Durable feature records

Use `plans/<feature-name>/` for each work item, including fixes and maintenance. Choose a stable descriptive name and resume its existing records when continuing the same work.

| File | Owner and purpose |
| --- | --- |
| `plan.md` | Planner: goal, scope, spec references, approach, acceptance criteria, and verification expectations |
| `tasks.md` | Planner defines tasks; active owners update execution status, dependencies, ownership, and branch/worktree inventory |
| `decisions.md` | Planner: user questions, answers, and current clarified decisions |
| `implementation.md` | Implementer: changes, integration notes, checks, and implementation handoff |
| `testing.md` | Tester: independent verification evidence and current passing handoff |
| `review.md` | Reviewer: findings, feature verdict, and separate delivery status |
| `blockers.md` | Implementer/tester report blockers; planner records disposition and resolution; create when needed |

Create supporting Markdown files only when useful and link them from the plan. Documents are the durable handoff; do not rely on conversation memory. Task completion, passing verification, reviewer success, and completed delivery are distinct states.

Record the base branch/commit, feature branch, absolute worktree paths, task ownership, and all related temporary resources. Identify the authoritative working copy and deliberately synchronize documents across worktrees. Do not maintain divergent plans or overwrite another agent's records. Parents integrate delegated notes into the authoritative records.

## Workflow

### 1. Plan and clarify

Assign the [planner](planner.md) to inspect the request, relevant guidance/specs, and existing code. It writes the plan, tasks, and decisions before implementation begins.

The planner addresses questions and unclear requirements with the user and documents the answers. It identifies blocked tasks and independently ready work. It describes success criteria but does not decide whether delivered work is successful. Do not invent product decisions or treat silence as approval.

### 2. Implement in isolation

Assign ready tasks to the [implementer](implementer.md). Before code changes, it creates a dedicated worktree and separate `codex/` branch, records ownership, and brings the required plan records into the authoritative feature worktree.

Do not modify `main` or `master` unless explicitly asked. Do not commit or push from the implementer, including its subagents. If a usable Git base or worktree cannot be established, return the blocker to the planner rather than making an unauthorized bootstrap commit or falling back to the main checkout.

The implementer writes code and appropriate tests, integrates delegated changes, runs required implementer checks, and updates the records. It has exactly two handoff paths:

- Implemented and verified: hand the current worktree and evidence to the tester.
- Blocked, including unavailable required verification: write `blockers.md` and return to the planner.

### 3. Verify independently

The [tester](tester.md) inspects the actual working tree, including uncommitted and untracked feature files, and verifies the clarified requirements. It may improve tests but does not fix application code, commit, push, or delegate.

- Defects return to the implementer with reproducible findings.
- Blocked verification or unclear requirements return to the planner through `blockers.md`.
- Only passing required verification proceeds to the reviewer.

After fixes, rerun affected checks and relevant regressions. Record which code state was tested. Passing evidence must apply to the current implementation; later relevant changes require renewed verification.

### 4. Review the passing implementation

Provide the [reviewer](reviewer.md) a curated, self-contained handoff: current goal, clarified requirements/decisions, implementation summary, passing test evidence, tested code state, base revision, and branch/worktree inventory.

Never include `blockers.md`, blocker content, or blocker history in reviewer input. If current records contain such history, prepare current summaries without deleting the original records. Do not use a full conversation-history handoff that carries blockers into review. This separation must not conceal unresolved defects or missing required verification: those prevent review from starting.

The reviewer inspects the code and evidence and writes either **Successful** or **Changes required** in `review.md`. It cannot fix code, redefine requirements, waive required verification, or delegate. Findings go back to the implementer and then through the tester before re-review. If findings create a new blocker, the implementer/tester returns that blocker to the planner; the reviewer does not receive it.

### 5. Deliver after success

Only after determining success, the reviewer follows the detailed [delivery rules](reviewer.md#delivery-after-a-successful-verdict):

- Prepend a dated change entry to root `changelog.md`.
- Add useful potential future functionality to root `backlog_ideas.md` when warranted, without treating ideas as approved scope.
- Commit task-related changes with `feat - ...`, `fix - ...`, or `task - ...` as appropriate.
- Push the feature branch and create or update its PR with changes and verification evidence.
- Perform safe cleanup of task-related temporary branches and worktrees, preserving the open PR's source branch and any unpreserved work.

Do not merge, publish, or release as part of this workflow without separate authorization. Report the feature verdict and delivery outcome separately; a failed commit, push, PR operation, or cleanup must remain explicitly incomplete.

## Blocker loop

Implementers and testers document the affected tasks, unmet requirement, evidence, attempts and outcomes, work still possible, and any suggested resolution in `blockers.md`. The planner investigates and decides how to proceed, involving the user for unclear requirements or material changes.

The planner records the disposition and updates the plan, tasks, and decisions before handing back concrete next steps. A resolved blocker only permits work to resume; it is not feature approval. Preserve partial work and keep blocked portions explicit while independent work proceeds.

## Delegation and concurrency

Only planners and implementers may spawn subagents, following their personas. Testers and reviewers may not delegate, directly or indirectly. Returning work to its preceding stage is a handoff, not permission to spawn a helper.

Allow at most five concurrent subagents across the entire feature workflow, including nested delegation, subject to any lower runtime limit. The coordinator tracks shared capacity; each parent does not receive its own allowance of five. Queue work when capacity is exhausted and release completed agents before dispatching more.

Assign each delegated task a bounded scope, documented owner, dependencies, Markdown output location, and the relevant persona. Parents remain responsible for integration and their final handoffs. Implementation subagents use separate branches/worktrees and cannot commit or push; integrate their reviewed diffs or patches into the authoritative worktree and verify the combined result.

Do not delegate merely to fill capacity or bypass scope, Git, clarification, or verification restrictions. Keep concurrent edits coordinated and preserve the branch/worktree inventory for reviewer cleanup.

## Code quality and change discipline

- Read the relevant specs and existing implementation before editing. Identify the behavior and code affected by the task.
- Keep changes focused. Avoid unrelated refactors, formatting changes, or cleanup.
- Follow established patterns unless they conflict with requirements or have a concrete problem. Explain when a departure is necessary.
- Give each function, component, and module a clear responsibility. Separate product rules from rendering and external integrations.
- Reuse existing components and logic. Extract shared abstractions when there is a demonstrated need; do not build frameworks for hypothetical future features.
- Justify new dependencies and avoid competing solutions to the same problem. Discuss major dependency changes under the autonomy rules in AGENTS.md.
- Use descriptive names and explicit contracts. Comments should explain intent, constraints, or non-obvious decisions.
- Handle failures explicitly. Do not silently swallow errors or substitute fabricated data.
- Preserve existing user work and behavior outside the requested change.
- Optimize for understandable code rather than arbitrary file-length limits or blanket bans on duplication.

## Mireqo product guardrails

These reminders highlight requirements that cut across features. Consult the relevant specs for full behavior and acceptance criteria.

- Keep saved state consistent across all screens.
- Preserve search queries, filters, and browsing position when navigating back. Keep filters scoped to their intended context.
- Keep core discovery usable without an account or location permission.
- Handle dates, time zones, and event status consistently. Never invent missing times, prices, availability, or popularity. Unknown prices must not appear as free.
- Include appropriate loading, empty, error, and offline behavior. Preserve usable content during refreshes and partial failures.
- Reuse product components and respect native platform conventions, accessibility, and light/dark appearance.
- Keep ticket purchases external. Keep optional features outside the task unless explicitly requested.

## Verification and completion

- Verify changes against the relevant spec's acceptance criteria, including affected edge cases.
- Add or update tests for meaningful behavior changes and bug fixes. Prefer tests of observable behavior over implementation details. Keep verification proportionate to the change.
- Run the available checks appropriate to the change. Do not disable checks or weaken tests just to make them pass.
- For UI changes, verify affected states, accessibility, and navigation behavior. Check both Android and iOS when platform behavior is involved.
- Distinguish automated checks from manual verification. If a device, simulator, or service is unavailable, state what remains unverified.
- Before finishing, review the diff for unintended changes, temporary debugging code, and exposed secrets.
- Report what changed, what was verified, and any remaining limitations. Never claim checks passed when they were not run or claim success beyond the evidence.
