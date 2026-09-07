# Project foundation blockers

This record belongs to planning, implementation, and testing. Never include it or its history in reviewer input.

## B01 — No committed Git base for required worktree

- Status: user authorization received on 2026-09-06; awaiting coordinator baseline creation.
- Affected tasks: F01 and downstream code implementation F03–F05.
- Requirement: implement on a separate branch/worktree; do not modify `main` and do not make an unauthorized bootstrap commit.
- Evidence: `git status --short --branch` reports `No commits yet on main`; guidance/specification files are untracked. Coordinator inspection reports no remotes.
- Attempts: read-only repository/guidance inspection; no commit, reset, checkout, or worktree mutation attempted.
- Remaining work possible: durable planning, official toolchain research, and read-only host readiness inspection.
- Authorized resolution: user explicitly approved coordinator creation of a one-time baseline commit containing agreed root Markdown guidance, the three `spec/*.md` files, and foundation planning records. Exclude `.DS_Store`, unrelated Android interview PDF, and other unrelated files. Then implementer creates `codex/project-foundation` in a dedicated worktree.
- Planner disposition: coordinator may create the authorized baseline now. Record its hash in tasks and mark B01 resolved before code implementation starts. The implementer remains prohibited from committing or editing application code on `main`.

## B02 — No remote destination for eventual delivery

- Status: deferred delivery prerequisite; local planning can proceed.
- Affected task: F08 push/PR only.
- Evidence: coordinator inspection reports no configured Git remote.
- Attempts: no remote was invented or created.
- Proposed resolution: obtain or verify the intended repository destination before delivery. Keep code success separate from delivery status.

## Native verification readiness

Coordinator read-only inspection found Xcode 26.6 (17F113), available iOS 18.6/26.0/26.1 simulators, Android SDK at `~/Library/Android/sdk`, a `Medium_Phone` AVD with an arm64 android-37.1 image, Android platforms 36/37.0/37.2, and JBR 21.0.11 at `~/Library/Java/JavaVirtualMachines/jbr-21.0.11/Contents/Home`. Simulator inspection succeeds outside the sandbox; an initial sandbox failure is not evidence that iOS validation is unavailable.

Mise was absent from PATH and standard locations. No `gh`, `ruby`, or `pod` executable was found under `/opt/homebrew/bin`; this alone does not establish their absence elsewhere. F02 must resolve tool provisioning and compatibility before builds. Host inventory is not successful build/launch evidence; any missing required verification remains a blocker rather than a waived criterion.
