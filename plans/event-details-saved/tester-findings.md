# Independent tester findings

Tester-owned investigation record. Not reviewer input; preserve separately from the current passing handoff.

## T01 / AC07: older detail cache overrides newer saved snapshot

Confirmed on 2026-09-18 against source manifest 25a7b32171b6aa25d57e376dee2374faeafaede7ccc85cb6198d35969d9b5dc1, plus the tester's regression in `apps/mobile/src/features/event-details/EventDetailsScreen.test.tsx`. No application code changed by tester.

Reproduction: open an event to populate its detail query, return to Saved, refresh saved details so that the saved snapshot has newer information, then reopen the same event while the original detail query is still within its 60-second stale window. `EventDetailsScreen` selects `query.data` before `saved.entries[id]`, so the earlier description and freshness are displayed instead of the newer saved information. Membership itself remains correct.

Expected: choose the newest usable same-event details without misrepresenting its freshness. Actual: earlier cached query description wins.

Deterministic regression seeds those two valid states through the real QueryClient and saved store. Command: `PATH="$HOME/.local/bin:/opt/homebrew/bin:$PATH" mise exec -- pnpm --filter @mireqo/mobile test EventDetailsScreen.test.tsx`. Result: previous two cases pass; new case fails because Latest event information is absent, and Earlier event information remains rendered. Log: `/tmp/mireqo-details-tester-freshness.log`.

Returned to root and implementer. No tester application fix, commit or push. Required AC07 verification does not pass until corrected and retested.

## Verification infrastructure observation

Android computer-control initialization did not return for approximately nine minutes and was interrupted. It performed no known UI mutation. Existing implementation-stage native evidence remains available and separately attributed; this does not constitute an independent native repeat.

## Resolution

Implementer supplied final source fingerprint403bec9394fdf4dd7347adbe177fa3fe4c7ec58928c8a624aba5a06c0be6a7dc. Tester independently inspected the same-ID whole-snapshot selector and reran5 affected suites/21tests: all pass, including the original regression and404/503 retention cases. All109 manifest file hashes match. No unresolved finding remains. The self-contained current testing.md is the only testing handoff for reviewer.
