# Project foundation decisions

## Confirmed user direction

- **D01 — Scope:** Start foundation implementation first; backend definition remains a later work item.
- **D02 — Stack:** React Native, TypeScript, Expo development builds, and Expo Router.
- **D03 — Tooling:** mise manages repository-pinned Node and pnpm versions; project tools are local dependencies. Use pnpm exclusively and commit its lockfile.
- **D04 — Native configuration:** Generated native projects stay untracked; durable configuration resides in Expo configuration/plugins. Local native builds are the default.
- **D05 — Validation:** Android and iOS must compile and run. Host checks alone do not satisfy this requirement.
- **D06 — Workflow:** Planner → implementer → independent tester → independent reviewer. Durable Markdown records; implementer works in an isolated branch/worktree and never commits/pushes. Reviewer owns successful delivery.

## Implementation choices still to validate

- **D07 — Foundation text-size verification sample:** Planner selects Android `font_scale=2.0` and iOS Dynamic Type `accessibility-medium` as the concrete increased-text samples for acceptance criterion 7. This is a routine verification-detail decision within the agreed requirement, not a change to product accessibility expectations. Verify actual readability and content reachability, retaining system text scaling. Maximum Dynamic Type scrolling remains explicitly unverified unless demonstrated; no maximum-size success claim is permitted. Confirmed larger-text defects still require correction. The tester independently checks the sample and evidence; the reviewer retains success authority.
- Exact compatible versions for mise, Node, pnpm, Expo, React Native, TypeScript, native prerequisites, and test/lint tools. Select through official documentation and actual installation/build results, not moving version aliases.
- ESLint, Prettier, and Expo-compatible Jest/React Native Testing Library are routine tooling proposals. Record final selection and compatibility evidence before treating setup as supported.
- Coordinator research identifies [Expo's unit-testing guidance](https://docs.expo.dev/develop/unit-testing/) as supporting Jest/jest-expo with React Native Testing Library. Exact package pins remain for implementer compatibility validation.
- A minimal temporary launch screen demonstrates the foundation. It does not establish product visual design or implement onboarding/Discover.

## User input pending

- **Q01 — Git baseline — resolved:** The user explicitly authorized a one-time baseline commit on `main` containing agreed root Markdown guidance, the three specification Markdown files, and these foundation planning records. Exclude `.DS_Store`, the unrelated Android interview PDF, and other unrelated files. The coordinator will make this baseline; the implementer still cannot commit or push.
- **Q02 — Delivery destination — resolved:** User supplied `https://github.com/EliothMonroy/mireqo.git`; coordinator configured origin and confirmed remote has no refs. Reviewer delivery must publish baseline main and the successful feature branch before PR creation.

Do not pass investigation history to the reviewer. Before review, provide current clarified decisions and verified requirements in a self-contained handoff.
