# Project foundation plan

## Goal and authority

Provide a reproducible local development foundation: a minimal Mireqo Expo/React Native/TypeScript application that compiles, installs, and visibly runs on Android and iOS. This is infrastructure work, not the implementation of discovery features.

The user authorized foundation implementation on 2026-09-06. Follow [workflow](../../implement_new_feature.md), [architecture](../../architecture.md), and [build guidance](../../build.md). Product scope remains in [high-level spec](../../spec/high-level-spec.md), [feature spec](../../spec/feature-spec.md), and [UI spec](../../spec/ui-spec.md). The foundation screen is temporary scaffolding, not a replacement for the specified onboarding or Discover experience.

## Existing repository

Inspection found guidance and product specifications, no application scaffold, and an unborn `main` branch with no commits. No existing application components or build commands can be reused. Preserve all existing documents and unrelated files. A usable committed Git base is required before the implementer can create the required feature worktree.

## Included work

- Pin a compatible Node/Expo/React Native/TypeScript/pnpm toolchain after consulting current official documentation; record exact versions and evidence.
- Configure mise with one Node authority and pnpm version discovery from `package.json`.
- Create a minimal Expo Router entry and feature-owned launch screen, with platform-safe layout, readable text, and system light/dark appearance.
- Implement every command agreed in `build.md`: `doctor`, `dev`, `android`, `ios`, `lint`, `typecheck`, `format:check`, `format`, `test`, and `check`.
- Commit a pnpm lockfile and explicit dependency-install configuration; keep installations, secrets, caches, and generated native directories ignored.
- Enforce module boundaries, strict TypeScript, and consistent formatting; provide proportionate host tests for meaningful foundation behavior and diagnostics.
- Validate local native development builds and update `build.md` with actual setup, prerequisites, command behavior, and evidence-based supported versions.

## Exclusions

No backend/provider selection, accounts, event catalog, location permission flow, tabs, onboarding, search, saved-event persistence, notifications, remote data fetching, release signing, store submission, or cloud-build requirement. TanStack Query and SQLite remain architecture decisions; do not invent usage or schemas solely to populate empty layers. Do not create every planned feature folder before it has implementation.

## Proposed implementation boundaries

Keep only routing/layout in `src/app/`. Place the temporary launch screen in a small foundation feature and shared theme values in `src/ui/` where useful. Create `src/bootstrap/` only for actual startup composition. No event data contracts or network flow are needed. Repository tooling belongs outside application modules.

Routine tooling proposals are ESLint with Expo-compatible configuration and import-boundary rules, Prettier, and Expo-compatible Jest/React Native Testing Library where applicable. The implementer must verify compatibility and pin the chosen versions; these are proposals, not researched compatibility claims. Diagnostics should separate host inspection from reporting sufficiently to test missing/mismatched tool scenarios without modifying the machine.

## Acceptance criteria

1. A clean feature checkout can select the pinned runtimes through mise and install with `pnpm install --frozen-lockfile`, without globally installing project development tools or changing the lockfile.
2. Every documented repository command exists and behaves as specified. `check` runs without an emulator/simulator and fails if any constituent check fails.
3. `doctor` reports JavaScript, Android, and iOS readiness independently and does not install tools, edit shell configuration, regenerate native files, or repair the host implicitly.
4. Android development build compiles, installs, launches, and displays the minimal Mireqo screen using local tooling. Record device/emulator, OS, command, result, and launch evidence.
5. iOS development build compiles, installs, launches, and displays the same screen using local Xcode tooling. Record simulator/device, OS, command, result, and launch evidence.
6. Expo configuration reproduces required native configuration; generated `android/` and `ios/` remain untracked. Routine commands do not hide clean regeneration.
7. The app launches without backend credentials, account setup, location prompts, or fabricated event data. Screen content remains readable in light/dark appearance and with increased text size on the tested platforms.
8. Documentation describes actual implemented commands and validated tool versions, with remaining limitations stated precisely. No unrelated user files are changed or included in delivery.

## Verification and handoff

The implementer records exact commands/results in `implementation.md` and updates [tasks](tasks.md). Missing required native verification routes back to planning; it is not a passing handoff. The independent tester validates the current uncommitted worktree and writes `testing.md`. Only passing required verification proceeds to the reviewer, with a self-contained handoff that excludes blocker content/history. The reviewer alone determines feature success and performs the authorized commit/PR workflow.

Native setup availability and tool-install access are risks to inspect early. Version research, diagnostic design, and planning can proceed while Git isolation is unresolved. Required Android/iOS evidence is not waived for an unavailable host.

## Records

- [Tasks and resource inventory](tasks.md)
- [Decisions](decisions.md)
- [Planning blockers](blockers.md) — planner/implementer/tester record only; do not include in reviewer input.
