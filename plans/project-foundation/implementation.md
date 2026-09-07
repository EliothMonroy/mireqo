# Foundation implementation

## Ownership

Owner: `foundation_implementer`. Base: `main` at `e48d952`. Branch: `codex/project-foundation`. Authoritative worktree and feature records: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/project-foundation`. Planning records transferred via baseline checkout. No delegated worktrees, commits, or pushes by implementer.

## Changes

- Minimal Expo Router layout and feature-owned accessible foundation screen; adaptive colors, unrestricted text scaling, and an explicitly bounded ScrollView. No backend, account, permission prompt, event data, or product feature.
- mise pins Node 24.20.0, Ruby 3.4.8 and Temurin JDK 17.0.18+8; pnpm 12.3.4 authority is packageManager. Installed mise 2026.9.1 user-level without changing shell files. Xcode Platform Support iOS26.5.1+iOS26.5 Simulator installed through official Components UI.
- Expo 57.0.20 / React Native 0.86.3 / React 19.2.3 pinned from published package compatibility metadata. TypeScript 6.0.3 matches Expo template. Expo Router native peers explicitly aligned with bundled versions to avoid incompatible implicit peer resolution.
- CocoaPods 1.16.2 in Gemfile, full Gemfile.lock and ignored local vendor/bundle. No system Ruby or global gems modified.
- Local command contract implemented with read-only diagnostic groups and native wrappers. Strict TypeScript, Expo ESLint with architecture boundary rule, Prettier, Jest/Testing Library and Node tooling tests.
- Executable build guide and ignore rules. Generated native files, dependencies, caches and local environment values remain untracked.

## Implementer verification

- Frozen pnpm install completed without lock changes (`/tmp/mireqo-frozen.log`). A fresh app/tooling copy without node_modules at `/tmp/mireqo-foundation-clean-v5meui9t` also installed in4.2s and passed all host checks. Original and fresh-copy lock SHA256: `1ed61a7c3dd9709f61d88628e8c5b3d549b495b9dd951583269545c7ef4902a6`. Logs `/tmp/mireqo-clean-install.log` and `/tmp/mireqo-clean-check.log`. Temporary copy is disposable after verification.
- `pnpm exec expo install --check`: dependencies up to date; `pnpm peers check`: no peer dependency issues.
- `pnpm run doctor`: JavaScript, Android and iOS prerequisite groups READY (host readiness only).
- `pnpm run check`: lint, strict typecheck, formatting, seven tooling tests and one accessible component test passed (`/tmp/mireqo-check.log`).
- CocoaPods installation succeeded under repo-local bundle (`/tmp/mireqo-pods.log`).
- Android compile/install/launch passed: `pnpm run android --no-bundler`, Medium_Phone arm64 emulator, Android17/API37. Gradle BUILD SUCCESSFUL (455 tasks,4m54s). Metro localhost8081 via adb reverse; actual launch verified from screenshots [light evidence](evidence/android-light.png) and [dark/large-text evidence](evidence/android-dark-large.png). Dark appearance and font_scale2.0 remained readable without clipped content. Restored original font_scale1.0/night no. Metro log: `/tmp/mireqo-metro.log`.
- Explicit native regeneration succeeded. Expo57 prebuild cleans by default; use `--no-clean --no-install` to preserve existing native files. Corrected build guide after inspecting installed CLI help. Regenerated Android rebuild passed (455 tasks,28s; `/tmp/mireqo-android-regenerated.log`); pods restored for regenerated iOS.
- iOS compile/install succeeded on iPhone17Pro/iOS26.5, UUID `C588ADDD-FC8A-48E8-BA7D-B14D9093962D`: Build Succeeded,0errors,2upstream script dependency warnings (`/tmp/mireqo-ios-build.log`). Actual app loaded against default Metro listener, with accessible heading and status text confirmed through Simulator AX. Light appearance at default `large` and dark appearance at `accessibility-medium` verified with all text fully visible/readable, matching D07. Evidence: [iOS light](evidence/ios-light.png), [iOS dark/increased text](evidence/ios-dark-large.png). Restored original light/large settings.
- Default `pnpm run dev` listener is required for this tested setup. `--localhost` bound onlyIPv6 while Expo returned an IPv4 bundle URL; default listener serves both native clients. Current Metro log `/tmp/mireqo-metro-final.log`, session57438.

## Sources

- https://docs.expo.dev/versions/latest/ and published expo57.0.20 bundledNativeModules.json.
- https://mise.jdx.dev/mise-cookbook/nodejs.html
- https://guides.cocoapods.org/using/a-gemfile.html
- https://docs.expo.dev/develop/unit-testing/

## Handoff

Implemented and verified against the clarified plan; ready for independent tester handoff. This is not the feature-success verdict. No further implementation mutations after the final state recorded below.

## Verification limits

D07 samples are Android font_scale2.0 and iOS accessibility-medium, not a universal scaling certification. Exploratory maximum iOS Dynamic Type wraps beyond the initial viewport; automated touch-drag reachability could not be established, so maximum-size scrolling remains explicitly unverified. No font cap or scaling suppression was introduced. Physical devices, release signing, store distribution and product/backend features were not tested and are outside this foundation scope.

Two upstream iOS script-phase dependency warnings and Android upstream deprecation warnings remain; no build errors. No generated native changes are relied on outside app.json/config plugins.

## Active resources for tester

- Feature worktree/branch above, uncommitted and unpushed. Inspect untracked scaffold files as well as tracked diffs.
- Metro: default listener port8081, tool session57438 (`/tmp/mireqo-metro-final.log`); process16361 at handoff. Keep available for tester.
- Android emulator Medium_Phone, serial emulator-5554, Android17/API37; app com.mireqo.app. adb reverse8081 configured for local Metro.
- iOS iPhone17Pro/iOS26.5, UUID C588ADDD-FC8A-48E8-BA7D-B14D9093962D, app com.mireqo.app.
- Fresh-copy verification directory `/tmp/mireqo-foundation-clean-v5meui9t` is disposable; no Git branch/worktree belongs to it.
- Native Android regenerated build output: `android/app/build/outputs/apk/debug/app-debug.apk`. iOS app: `/Users/eliothmonroy/Library/Developer/Xcode/DerivedData/Mireqo-abfnzoobvprofdguuszfbaepmerr/Build/Products/Debug-iphonesimulator/Mireqo.app`.

## Final code state

SHA256: `518a6c62ffbe66a2764c8f8912a18854c480166867e416bdeef778eaa0cc7dbe`. Computed by sorting the following relative paths and hashing each UTF-8 path, NUL, file bytes, NUL in sequence. Documentation and screenshots are excluded from this code-state fingerprint.

```text
.env.example
.gitignore
.npmrc
.prettierignore
.prettierrc.json
Gemfile
Gemfile.lock
app.json
eslint.config.cjs
jest.config.cjs
mise.toml
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
scripts/boundaries.test.mjs
scripts/doctor.mjs
scripts/doctor.test.mjs
scripts/native.mjs
src/app/_layout.tsx
src/app/index.tsx
src/features/foundation/FoundationScreen.test.tsx
src/features/foundation/FoundationScreen.tsx
src/ui/theme.ts
tsconfig.json
```

Final `pnpm run check` passed after documentation/evidence finalization: seven tooling tests plus one component test, lint, strict types, and formatting. Log: `/tmp/mireqo-check-final.log`. `git diff --check` passed. No commits or pushes.
