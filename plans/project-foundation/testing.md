# Independent foundation testing

Testing passed against the clarified foundation requirements. This is a tester handoff, not final feature approval. Tester: `foundation_tester`; verified 2026-09-06 local date. No application code changes, delegation, commits, or pushes.

## Tested state

Authoritative worktree: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/project-foundation`; branch `codex/project-foundation`; base `main` at `e48d952`. Inspected tracked changes and every untracked application/tooling file. Independently recomputed the implementer code-state SHA256 as `518a6c62ffbe66a2764c8f8912a18854c480166867e416bdeef778eaa0cc7dbe` using the path/NUL/bytes/NUL algorithm and file list in implementation.md. Application/tooling files remained unchanged throughout testing.

## Acceptance evidence

| Requirement / task | Independent verification and result                                                                                                                                                                                                                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1 / F03          | `mise exec -- pnpm install --frozen-lockfile` passed with registry access. Lock SHA256 remained `1ed61a7c3dd9709f61d88628e8c5b3d549b495b9dd951583269545c7ef4902a6`. Reviewed implementer fresh-copy install evidence and pins/local dependencies.                                                                                               |
| AC2 / F04          | `mise exec -- pnpm run check` passed after install completed: lint, strict TypeScript, formatting, 7 Node tooling tests and 1 component test. Reviewed all command definitions; shell `&&` makes check stop on failure. Format write/check use the same Prettier configuration. `dev` was independently started and served both native bundles. |
| AC3 / F04          | `mise exec -- pnpm run doctor` exited 0 with all basic prerequisite groups READY. Reviewed code and missing/mismatch test scenarios: reports groups independently and only executes version commands and filesystem reads; no installs or repair operations.                                                                                    |
| AC4 / F05          | Reviewed actual regenerated Android build/install log: BUILD SUCCESSFUL, 455 tasks, 28s, APK installation and Expo launch. Independently force-stopped and relaunched installed app through its development URL; visibly rendered current Metro source on Medium_Phone, emulator-5554, Android 17 / API37.                                      |
| AC5 / F05          | Reviewed actual local iOS build/install log: Build Succeeded, zero errors, installation and opening on iPhone 17 Pro, iOS26.5, UUID C588ADDD-FC8A-48E8-BA7D-B14D9093962D. Independently terminated and reopened current app through its development URL and visually verified rendered source.                                                  |
| AC6 / F03          | Reviewed app.json and native wrappers: identifiers, Router/system appearance plugins and generated directories ignored. Regeneration/build evidence applies to identical code fingerprint. No lasting native-only changes required.                                                                                                             |
| AC7 / F05–F06      | Independently inspected screenshots below for light/default and dark/increased text on both platforms. Heading and both status sentences fully readable and visible; no clipping, account, location prompt, credentials, or event data. Android UIAutomator also exposed all three texts. Source preserves text scaling.                        |
| AC8 / F06          | Reviewed architecture/build documentation against implemented commands and current evidence; `git diff --check` passed. Source inventory contains no unrelated user files or secrets.                                                                                                                                                           |

## Native test commands and screenshots

After dependency installation and successful host checks, started `mise exec -- pnpm run dev` with its default listener. Android used `adb shell am force-stop com.mireqo.app` then `adb shell am start -a android.intent.action.VIEW -d 'exp+mireqo://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081' com.mireqo.app`, with existing adb reverse8081. iOS used `xcrun simctl terminate booted com.mireqo.app` then `xcrun simctl openurl booted` with the same development URL. Waited for app content rather than treating transient loading screens as launch success.

- [Android light, font_scale1.0](evidence/tester-android-light.png)
- [Android dark, font_scale2.0](evidence/tester-android-dark-large.png)
- [iOS light, Dynamic Type large](evidence/tester-ios-light.png)
- [iOS dark, Dynamic Type accessibility-medium](evidence/tester-ios-dark-large.png)

Set Android samples with `adb shell settings put system font_scale 2.0` and `adb shell cmd uimode night yes`; queried font_scale and received `2.0`. Set iOS with `xcrun simctl ui booted appearance dark` and `xcrun simctl ui booted content_size accessibility-medium`; queried content_size and received `accessibility-medium`. Captured via adb screencap/simctl screenshot and inspected images directly. Restored Android1.0/night no and iOS large/light afterward. Expo's development Tools overlay is visible in evidence; the Android overlay's own label truncates at enlarged system text, while all Mireqo content remains readable.

## Evidence classification and limits

Host checks and native launches were rerun independently. Native compilation/install was independently assessed from actual implementer logs against an identical configuration/dependency/code fingerprint; broad native recompilation was not repeated. Compilation logs: `/tmp/mireqo-android-regenerated.log`, `/tmp/mireqo-ios-build.log`. Host logs: `/tmp/mireqo-tester-install.log`, `/tmp/mireqo-tester-check.log`, `/tmp/mireqo-tester-doctor.log`. No claim that host checks alone establish native readiness.

Required D07 samples passed; maximum iOS Dynamic Type scrolling, all text categories, screen-reader navigation, physical devices, release signing and store distribution remain unverified. Product/backend functionality is outside scope. Existing upstream build warnings do not represent build errors.

An initial tester run overlapped a sandbox-restricted install with checks/Metro; dependency relinking invalidated that run. The install was completed with authorized network access, then checks and launches were repeated against the intact dependencies. Only the final runs above support this handoff.

## Reviewer handoff and resource inventory

Use [current reviewer summary](reviewer-current.md) plus this testing record, actual code, architecture/build guidance and persona/workflow instructions. Current summary supplies goal, clarified decisions, implementation and delivery context without investigation history.

- Sole feature worktree/branch as above; uncommitted task files ready for reviewer assessment.
- Active tester Metro session93325, `/tmp/mireqo-tester-metro.log`, port8081; previous implementer Metro exited during dependency relinking.
- Both emulator/simulator remain running and installed apps remain available. Original appearance/text settings restored.
- Disposable clean-copy directory `/tmp/mireqo-foundation-clean-v5meui9t`; no associated Git branch/worktree.
- Temporary tester logs/screenshots use `/tmp/mireqo-tester-*`; screenshots needed for delivery copied into feature evidence directory. Generated native directories, node_modules, vendor/bundle and .bundle remain ignored.
- F03–F05 implementation complete; F06 testing passed. F07 feature verdict and F08 delivery belong to reviewer.
