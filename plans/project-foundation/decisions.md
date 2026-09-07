# Project foundation decisions

## Confirmed user direction

- **D01 — Scope:** Start foundation implementation first; backend definition remains a later work item.
- **D02 — Stack:** React Native, TypeScript, Expo development builds, and Expo Router.
- **D03 — Tooling:** mise manages repository-pinned Node and pnpm versions; project tools are local dependencies. Use pnpm exclusively and commit its lockfile.
- **D04 — Native configuration:** Generated native projects stay untracked; durable configuration resides in Expo configuration/plugins. Local native builds are the default.
- **D05 — Validation:** Android and iOS must compile and run. Host checks alone do not satisfy this requirement.
- **D06 — Workflow:** Planner → implementer → independent tester → independent reviewer. Durable Markdown records; implementer works in an isolated branch/worktree and never commits/pushes. Reviewer owns successful delivery.

## Implementation choices still to validate

- Exact compatible versions for mise, Node, pnpm, Expo, React Native, TypeScript, native prerequisites, and test/lint tools. Select through official documentation and actual installation/build results, not moving version aliases.
- ESLint, Prettier, and Expo-compatible Jest/React Native Testing Library are routine tooling proposals. Record final selection and compatibility evidence before treating setup as supported.
- Coordinator research identifies [Expo's unit-testing guidance](https://docs.expo.dev/develop/unit-testing/) as supporting Jest/jest-expo with React Native Testing Library. Exact package pins remain for implementer compatibility validation.
- A minimal temporary launch screen demonstrates the foundation. It does not establish product visual design or implement onboarding/Discover.

## User input pending

- **Q01 — Git baseline — resolved:** The user explicitly authorized a one-time baseline commit on `main` containing agreed root Markdown guidance, the three specification Markdown files, and these foundation planning records. Exclude `.DS_Store`, the unrelated Android interview PDF, and other unrelated files. The coordinator will make this baseline; the implementer still cannot commit or push.
- **Q02 — Delivery destination:** The inspected repository has no configured remote. A destination must be supplied or otherwise verified before push/PR delivery; no hosting account/repository is assumed. This does not block local implementation once Git isolation is available.

Do not pass investigation history to the reviewer. Before review, provide current clarified decisions and verified requirements in a self-contained handoff.
