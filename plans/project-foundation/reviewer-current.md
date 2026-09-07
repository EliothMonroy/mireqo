# Current foundation reviewer handoff

## Goal and requirements

Deliver the authorized minimal Expo/React Native/TypeScript local-development foundation. It must install through mise/pnpm with frozen locks, expose doctor/dev/android/ios/lint/typecheck/format:check/format/test/check, enforce strict types and architecture imports, and compile/install/visibly launch on Android and iOS. Keep generated native projects and tool caches ignored. Screen content must remain readable with system appearance and increased text. Document executable commands and validated prerequisites. No backend, discovery features, accounts, location flow, tabs, storage, release signing or cloud-build requirement.

## Clarified decisions

The user selected Expo development builds and Expo Router, mise-managed Node/pnpm with local dependencies, pnpm exclusively, generated native projects untracked, and actual Android/iOS compile/run verification. Required text samples are Android font_scale2.0 and iOS accessibility-medium alongside default settings. Maximum Dynamic Type scrolling is unverified; the sample is not universal accessibility certification. Workflow requires independent testing and review; reviewer owns verdict and delivery.

User authorized one baseline commit of agreed documentation on main; resulting base is e48d952. User provided origin https://github.com/EliothMonroy/mireqo.git, currently empty at recorded handoff. Successful reviewer delivery therefore publishes baseline main and the feature branch before creating the PR. No merge or release authorization.

## Implementation and tested state

Minimal feature-owned FoundationScreen displays Mireqo and honest temporary status text using system-aware colors, SafeAreaView and bounded ScrollView. Routes remain thin. Tooling comprises mise pins, exact package pins and frozen pnpm lock, local CocoaPods bundle, read-only doctor, native wrappers, ESLint boundary checks, strict TypeScript, Prettier and proportionate Jest/Node tests. Build guidance records actual commands and native prerequisites.

Node24.20.0, pnpm12.3.4, Expo57.0.20, ReactNative0.86.3, React19.2.3, TypeScript6.0.3, Ruby3.4.8, Temurin17.0.18+8 and CocoaPods1.16.2 are pinned. Pinned package/native compatibility was verified by installation and builds.

Authoritative worktree `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/project-foundation`; branch `codex/project-foundation`; base main/e48d952. Uncommitted and untracked files contain the feature. Code-state SHA256 `518a6c62ffbe66a2764c8f8912a18854c480166867e416bdeef778eaa0cc7dbe` matched independently. No implementation files changed during testing.

## Passing evidence

[Independent testing](testing.md) records all eight acceptance criteria, exact commands, evidence and limits. Frozen install preserved lock; full host check passed (7 tooling tests and 1 component test), all prerequisite groups READY. Native logs demonstrate compile/install for both platforms; independent cold launches show current app content. Android Medium_Phone/API37 and iOS iPhone17Pro/iOS26.5 passed light/default and dark/required increased-text screenshot inspection. No application defect was found. Testing passed; feature success remains for reviewer to assess.

Required D07 samples passed. Maximum iOS text scrolling, physical devices, release/store signing and backend behavior remain unverified; these are not claimed by passing foundation evidence. Upstream build warnings remain without errors.

## Delivery and cleanup inventory

Only one task worktree/branch exists, listed above. Preserve unrelated original-checkout files including the Android interview PDF. Review application/tooling changes, architecture/build updates, feature records and evidence; exclude caches/generated native projects/secrets. After successful verdict, follow reviewer.md for changelog, appropriately prefixed commit, push/PR and safe cleanup. Do not remove the PR source branch or unpreserved work.

Metro session93325 listens on8081, log `/tmp/mireqo-tester-metro.log`. Android emulator-5554 and iOS simulator C588ADDD-FC8A-48E8-BA7D-B14D9093962D remain running with original display settings restored. Disposable test copy `/tmp/mireqo-foundation-clean-v5meui9t` has no Git branch. Temporary logs/screenshots `/tmp/mireqo-*` are task resources; retained screenshots are under the feature evidence directory. Generated android/ios, node_modules and vendor/bundle remain ignored.
