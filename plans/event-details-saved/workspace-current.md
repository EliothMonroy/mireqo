# Current feature workspace inventory

- Base: main at dee988f521e0fb6dc80b6257c003276abab10f1c.
- Authoritative source and records: /Users/eliothmonroy/Documents/Github/mireqo/.worktrees/event-details-saved, branch codex/event-details-saved. Preserve while PR is open.
- Backend helper: /Users/eliothmonroy/Documents/Github/mireqo/.worktrees/event-details-backend, branch codex/event-details-backend, same base, no commits. Helper work is integrated; verify preservation before cleanup.
- Main checkout: /Users/eliothmonroy/Documents/Github/mireqo. Untracked plans/event-details-saved contains original planning drafts only. Preserve or archive deliberately; authoritative records are in the feature worktree.
- Task-owned Metro: port8081, PID51776, session31214, log /tmp/mireqo-details-metro.log. Task-owned API: port3000, session67769, log /tmp/mireqo-details-api-final.log. Keep available through testing; stop only these services when no longer needed.
- Persistent Colima development PostgreSQL54329 and isolated test PostgreSQL54330 are repository development resources, not disposable feature worktrees. Preserve development data.
- Native checks use existing Android emulator-5554 and iOS iPhone17Pro C588ADDD-FC8A-48E8-BA7D-B14D9093962D. Preserve simulators, installed app data and unrelated devices. Android selected area Coacalco, normal font1.0/light/network restored; iOS Tultitlán, light/large restored.
- Test-created saved fixtures are Android demo:coacalco:01; iOS demo:tultitlan:01, :10, :11. Retained for reproducibility. No user data reset.
- Temporary Apple verification project/results: /tmp/mireqo-details-ios. Earlier unrelated stage verification remains /tmp/mireqo-ios-verification. Retain unique evidence unless safely preserved elsewhere.

Coordinator byte comparison on 2026-09-18: all13 helper source/test files match the authoritative worktree. Helper backend-assessment.md, plan.md and tasks.md differ and need opaque preservation before removing that helper checkout; do not read their historical content for review. Main planning drafts also differ and should remain until deliberate post-merge cleanup. Recheck byte equality at cleanup time.

Reviewer input is explicitly curated: plan.md, decisions.md, implementation-current.md, testing.md and this inventory, together with source-manifest.json and relevant application source/tests. Do not read raw implementation.md, tasks.md, android-native.md, ios-native.md, native-readiness.md, backend-implementation.md, tester-findings.md, blockers.md or historical execution logs. Tester supplies current passing native evidence and any necessary screenshot references in testing.md. Preserve historical files without exposing their content as review input.
