# Development environment and builds

This document records the agreed build and development workflow for Mireqo. It is a plan, not a working setup guide yet: the application scaffold, toolchain pins, configuration files, and scripts described below have not been implemented or validated. Do not report these commands as available until they exist.

Application structure is defined in [architecture.md](architecture.md), product requirements in [spec/](spec/), and the code-change workflow in [implement_new_feature.md](implement_new_feature.md). Repository-wide guidance remains in [AGENTS.md](AGENTS.md).

## Environment contract

- Use mise to select repository-defined Node and pnpm versions.
- Install application dependencies and development tools locally through pnpm. Expo, TypeScript, linting, formatting, and test tools belong in the project's dependency declarations.
- Commit configuration, manifests, scripts, and one dependency lockfile: `pnpm-lock.yaml`.
- Do not install project development tools globally or implicitly download unpinned tools. Use repository commands and installed dependencies.
- Keep downloaded dependencies, caches, generated native projects, build outputs, local environment values, and credentials out of version control.
- Local Expo development builds are the default. Cloud builds are optional and are not a prerequisite for ordinary development.

## Version management

Mise is a one-time user-level prerequisite. Managed Node and pnpm installations may live in mise's user-level storage; their selected versions are controlled by this repository. Project packages are installed locally under `node_modules`.

| Planned file | Responsibility |
| --- | --- |
| `mise.toml` | Pin an exact supported Node version and enable reading pnpm's version from `package.json` |
| `package.json` | Pin an exact pnpm version through `packageManager`; declare dependencies and scripts |
| `pnpm-lock.yaml` | Lock resolved project dependencies |

Use `mise.toml` as the Node version authority. Do not add a duplicate `.node-version` or `.nvmrc` pin. Use `packageManager` as the pnpm version authority rather than maintaining a second independent version in mise configuration.

Agents and CI invoke tools through `mise exec --` so execution does not depend on interactive shell activation. Developers may optionally enable mise shell activation for convenience.

Exact mise, Node, pnpm, Expo, and native toolchain versions remain pending. During scaffolding, select a compatible combination, record the required mise version and setup instructions, and validate it before marking the environment supported. Do not use moving `latest` or `lts` aliases as committed version pins.

## Dependency installation

Once the scaffold and configuration exist, the intended sequence is:

1. Install the documented mise version at user level.
2. Review and trust the repository's mise configuration, then install its declared tools with `mise install`.
3. Install project dependencies from the committed lockfile.
4. Run diagnostics and configure the host prerequisites for the target platform.

The planned frozen install command is:

```sh
mise exec -- pnpm install --frozen-lockfile
```

Use frozen installs for fresh checkouts and CI. Intentional dependency additions or upgrades update dependency declarations and the lockfile together; a lockfile mismatch during normal setup is an issue to resolve, not a reason to silently regenerate it.

Keep pnpm as the sole package manager. Do not introduce npm or Yarn lockfiles. Any required pnpm configuration or dependency build-script permissions must be explicit and committed when the selected packages require them.

## Repository command contract

All commands below are planned. Implement them in `package.json` during scaffolding and update this document with their verified behavior.

| Command | Contract |
| --- | --- |
| `pnpm run doctor` | Report toolchain versions, configuration issues, and missing prerequisites without changing the machine |
| `pnpm run dev` | Start Metro for an installed Expo development build |
| `pnpm run android` | Build and launch the Android development app locally |
| `pnpm run ios` | Build and launch the iOS development app locally |
| `pnpm run lint` | Check code conventions and enforce the agreed module boundaries |
| `pnpm run typecheck` | Run TypeScript checks in strict mode |
| `pnpm run format:check` | Check formatting without modifying files |
| `pnpm run format` | Apply the committed formatting configuration |
| `pnpm run test` | Run automated unit and host-compatible integration tests once, without watch mode |
| `pnpm run check` | Run lint, type checking, formatting checks, and unit/integration tests; fail if any check fails |

For agents and CI, the invocation pattern is:

```sh
mise exec -- pnpm run doctor
mise exec -- pnpm run check
```

`check` must run without a simulator. Native builds and device tests are separate verification steps. Passing `check` does not establish that either mobile platform builds or behaves correctly.

Diagnostics must distinguish JavaScript-only, Android, and iOS readiness. They should report compatible setup instructions rather than install tools, modify shell configuration, or silently repair the environment. Missing Xcode on a non-macOS host does not prevent JavaScript-only checks or imply that Android setup is invalid.

## Local native builds

- Use Expo development builds installed on a simulator, emulator, or device. The normal workflow targets Mireqo's own development app rather than relying on Expo Go.
- Android builds require the documented local Android SDK and JDK setup. iOS builds require Xcode on macOS.
- Record compatible Xcode, Android SDK/build tools, JDK, and any required auxiliary native tooling when the scaffold is validated. Include simulator/emulator setup and any physical-device signing steps that apply.
- Build and install the development app before connecting it to Metro. JavaScript/TypeScript-only edits normally use the running development server.
- Rebuild when native dependencies, native configuration, or the Expo SDK change.
- Keep cloud build configuration optional. Release builds, signing for distribution, and store submission workflows remain deferred.

### Generated native projects

Use Expo native generation. Keep generated `android/` and `ios/` directories untracked. Store lasting native configuration in Expo app configuration and config plugins.

Initial generation may occur as part of a platform build. Clean regeneration of existing native directories must be explicit because it can discard manual edits. Do not hide destructive regeneration in `dev`, diagnostics, or routine checks. Inspect any native edits and preserve intended changes in configuration or plugins before regenerating.

## Local configuration

- Commit `.env.example` with descriptions and harmless placeholders when configuration variables are introduced.
- Ignore local environment files containing actual values, while retaining the example file in version control.
- Treat values bundled into the mobile application as public. Environment variables do not make private provider credentials safe to ship.
- Keep private provider credentials on a server if an eventual integration requires them, as described in the architecture.
- Do not invent provider-specific variables before the integration is selected.
- Commit ignore rules for dependencies, mise/runtime artifacts if stored locally, Expo local state, caches, generated native projects, and build outputs during scaffolding.

## Verification tooling

Tool selections and exact versions are pending; the following capabilities are required:

- Linting with committed configuration for code conventions and module boundaries from `architecture.md`.
- TypeScript strict mode.
- One formatter with committed configuration and separate check/write commands.
- Unit tests for shared product rules, particularly time zones, incomplete dates, prices, and status.
- Integration tests for provider adapters, persistence, and feature interactions.
- Separate Android and iOS verification for navigation, native integrations, and critical user journeys.

Keep host-compatible tests in `test` and `check`. Tests requiring a native SQLite runtime or another device-only API belong in a separately documented native test workflow. Mocked storage tests do not establish that actual SQLite transactions or migrations work on devices.

Use the same pinned tooling and repository commands in CI when CI is introduced. Report automated checks, native builds, and manual device verification separately, including unavailable platforms and unresolved failures. Follow the proportionate testing policy in [implement_new_feature.md](implement_new_feature.md#verification-and-completion).

## Toolchain changes

Make upgrades intentionally. Update relevant version declarations, dependency lockfiles, configuration, and documentation together. Run repository checks and the native builds affected by the update before claiming compatibility. Never disable checks or weaken tests merely to make an upgrade pass.

## Before this becomes an executable guide

The scaffold task must resolve and verify:

- Exact toolchain versions and the mise bootstrap procedure, including pnpm version discovery.
- Required host tools and supported platform versions.
- Dependency declarations, lockfile, ignore rules, and command implementations.
- Linter, formatter, test runner, and native test workflow selections.
- Initial local Android/iOS development builds and the checks that can run on the available host.

Replace planned instructions with verified setup steps as they are implemented. Keep unavailable-platform validation explicitly pending. This document does not authorize building the application or installing tools by itself.

## References

- [mise Node and package-manager setup](https://mise.jdx.dev/mise-cookbook/nodejs.html).
- [mise execution and shell behavior](https://mise.jdx.dev/faq.html).
- [Expo CLI](https://docs.expo.dev/more/expo-cli/).
- [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/).
- [Expo native generation](https://docs.expo.dev/workflow/continuous-native-generation/).

Use documentation compatible with the versions selected during scaffolding.
