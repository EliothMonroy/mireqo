# Delegated mobile relocation

Owner: backend implementation subagent `mobile_move`.

- Base: main `acbb0babd6efd18910bfe36492a92f1ffa7b236d`.
- Branch: `codex/backend-mobile`.
- Worktree: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/backend-mobile`.
- Parent's backend foundation worktree is authoritative after deliberate integration.
- No commits, pushes, or dependency installations performed.

## Changes

Moved the unchanged Expo source, app configuration, TypeScript/Jest/lint configuration, and mobile environment example to `apps/mobile`. Existing mobile dependency versions are preserved; `@mireqo/contracts` is the only added mobile dependency. Root scripts forward mobile arguments through pnpm filters. Root remains the Gemfile and dependency-toolchain authority.

Doctor resolves manifests and dependencies from its own repository path rather than the caller directory. Native wrappers always run Expo in the mobile directory and explicitly set repository Gemfile, bundle configuration, and bundle installation paths. Mobile lint boundary tests now construct ESLint with the mobile working directory.

Added a mobile data-boundary export and tests for valid/invalid shared health responses. Contracts are supplied by parent. Root orchestrates package checks and backend commands and builds contracts before the aggregate check.

## Verification and integration

The relocated doctor tests passed (4 tests) using the pinned Node runtime. `git diff --check` passed. Full lint, type, Jest, workspace installation, API-contract resolution, and native build/launch checks remain parent responsibilities after integration. No dependency install was attempted in this disposable branch.

Parent should integrate the tracked diff and all untracked `apps/mobile` files (including `.env.example`), then this note. The deleted root mobile files must also be removed. Root package scripts may require coordination with final backend command names. The shared health data module is intentionally not coupled to the launch screen; demonstrate Metro shared-package consumption in the parent verification without introducing a network request.
