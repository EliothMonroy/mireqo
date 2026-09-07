# Development environment and builds

Mireqo uses local Expo development builds for Android and iOS. The foundation provides the commands below; the backend foundation is implemented and product features remain separate work. Application boundaries are in [architecture.md](architecture.md), and code-change responsibilities are in [implement_new_feature.md](implement_new_feature.md).

## Toolchain and installation

Install [mise 2026.9.1](https://mise.jdx.dev/getting-started.html) once at user level and put its executable on PATH. No system-wide Node, pnpm, Expo CLI, Ruby gems, or JDK installation is required. Mise stores runtimes in its managed user directory; package and gem dependencies live in the checkout. Do not use global project-tool installations or commands that implicitly download unpinned tools.

| Tool                                                         | Version authority                                        |
| ------------------------------------------------------------ | -------------------------------------------------------- |
| Node 24.20.0, Ruby 3.4.8, Temurin JDK 17.0.18+8              | `mise.toml`                                              |
| pnpm 12.3.4                                                  | `package.json` `packageManager`, read by mise            |
| Expo 57.0.20, React Native 0.86.3, React 19.2.3              | `apps/mobile/package.json` and root `pnpm-lock.yaml`     |
| TypeScript 6.0.3, ESLint, Prettier, Jest and Testing Library | `apps/mobile/package.json` and root `pnpm-lock.yaml`     |
| CocoaPods 1.16.2 and its dependencies                        | `Gemfile` and `Gemfile.lock`                             |
| Bundler 2.6.9                                                | Bundled with the pinned Ruby; recorded in `Gemfile.lock` |

From the repository root:

```sh
mise trust
mise install
mise exec -- pnpm install --frozen-lockfile
```

For iOS, install the repository-local gem bundle:

```sh
mise exec -- bundle config set --local path vendor/bundle
mise exec -- bundle install
```

Keep mise on PATH during native extension builds. No shell activation is required for the explicit `mise exec --` commands. `mise.toml` is the only Node pin; do not add `.nvmrc` or `.node-version`. `packageManager` is the only pnpm pin. Intentional dependency updates may use `pnpm add`; commit the resulting lockfile. Fresh checkouts and CI use `--frozen-lockfile`. CocoaPods dependency changes likewise update `Gemfile.lock` deliberately.

## Host prerequisites

- **Android:** Android SDK platform 36, build-tools 36.0.0, platform-tools, and an emulator with a suitable system image or a connected development device. Gradle obtains additional pinned native components such as the NDK on first build; accepted Android SDK licenses and network access are required. Use Android Studio's SDK Manager for initial SDK/device setup.
- **Android SDK path:** set `ANDROID_HOME` (or `ANDROID_SDK_ROOT`) when needed. Native commands default to `~/Library/Android/sdk` on this macOS setup. Other hosts must configure their SDK path explicitly.
- **Java:** mise selects JDK 17 and provides `JAVA_HOME`; no manual system JDK symlink is necessary.
- **iOS:** macOS, Xcode 26.4 or newer, command-line tools selected for that Xcode, completed first-launch setup, and an installed simulator runtime compatible with Xcode. The validation host uses Xcode 26.6 with iOS SDK 26.5. Xcode's installed SDK and an entry under “Other Installed Platforms” are not sufficient if Platform Support is missing. In Xcode Settings > Components, install the iOS entry under **Platform Support** (on this host: iOS 26.5.1 + iOS 26.5 Simulator). `xcodebuild -downloadPlatform` may install only the runtime; verify Platform Support if destinations remain ineligible.
- **Physical devices:** may require signing, trust, developer mode, or USB debugging. Simulator/emulator validation does not establish physical-device signing readiness.

Initial setup downloads runtimes, dependencies, native artifacts, and possibly emulator images. Subsequent local builds reuse caches. Cloud builds and Expo accounts are not prerequisites.

## Repository commands

Run commands through `mise exec --`, for example `mise exec -- pnpm run check`.

| Command                           | Behavior                                                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `pnpm run doctor`                 | Read-only basic prerequisite report for JavaScript, Android and iOS; exits nonzero if any group is unready |
| `pnpm run doctor javascript`      | Report all groups but require only JavaScript readiness                                                    |
| `pnpm run doctor android` / `ios` | Require JavaScript and the selected native platform prerequisites                                          |
| `pnpm run dev`                    | Start Metro for the installed development app                                                              |
| `pnpm run android`                | Check prerequisites, generate native files if absent, compile/install/launch Android locally               |
| `pnpm run ios`                    | Check prerequisites and run the iOS build/install/launch under the repository CocoaPods bundle             |
| `pnpm run lint`                   | ESLint conventions and architecture import boundaries                                                      |
| `pnpm run typecheck`              | Strict TypeScript checking without emission                                                                |
| `pnpm run format:check`           | Prettier check without edits                                                                               |
| `pnpm run format`                 | Apply formatting to maintained application/tooling documents and code                                      |
| `pnpm run test`                   | Node tooling tests and Jest/Testing Library component tests, once                                          |
| `pnpm run check`                  | Lint, typecheck, format check, then tests; stops on failure                                                |

`check` needs no simulator. Passing it does not prove native compilation or launch. Doctor never installs, repairs, regenerates, or changes shell configuration. It checks basic executable/SDK prerequisites, not Xcode Platform Support registration, every native build failure, or device availability. An iOS basic-prerequisite pass still requires the manual Platform Support check above.

Native commands forward arguments to Expo, for example:

```sh
mise exec -- pnpm run ios --device '<simulator UUID>' --no-bundler
mise exec -- pnpm run android --device '<device name>' --no-bundler
mise exec -- pnpm run dev
```

With `--no-bundler`, start Metro separately. For an Android emulator, `adb reverse tcp:8081 tcp:8081` connects its localhost to Metro when needed. A simulator can reach host localhost; a physical device needs an appropriate reachable network address. Use the default Metro listener for both platforms. With this Node/Expo combination, `--localhost` can bind only IPv6 while the generated bundle URL uses IPv4; avoid that flag if the app cannot reach Metro. The first native command installs the development build. JavaScript-only edits normally use Metro; rebuild after native dependency or configuration changes.

## Native configuration and environment

`apps/mobile/app.json` and config plugins own lasting native settings. Generated `android/` and `ios/` are ignored. Ordinary native commands create missing projects but do not silently clean existing ones. After configuration changes, explicitly run:

```sh
mise exec -- pnpm --filter @mireqo/mobile exec expo prebuild --no-clean --no-install
mise exec -- bundle exec pod install --project-directory=apps/mobile/ios
```

SDK 57 `expo prebuild` cleans native directories by default. Omit `--no-clean` only deliberately after checking for manual native changes; the default deletes and regenerates native directories. Represent required changes in configuration/plugins first. Generated Podfiles/Gradle files are not the place for lasting edits.

`apps/mobile/.env.example` documents the optional public API URL; root `.env.example` documents backend settings. No credentials or provider configuration are required to launch. Local environment files are ignored. Anything bundled into the mobile app is public; private provider credentials belong on a future backend. Never commit caches, downloaded tools, build artifacts, `.bundle/`, `vendor/bundle/`, or secrets.

## Verification policy

The current foundation tests cover diagnostic readiness/mismatch handling, import boundaries, and the accessible launch screen. Future domain, adapter, storage, and feature tests are added with those implementations; empty layers are not scaffolded solely for tests.

ESLint enforces feature isolation and shared-layer imports. TypeScript uses strict mode and checked indexed access. Prettier excludes generated files and pre-existing guidance/specification documents to avoid unrelated formatting changes.

Native verification must record the actual emulator/simulator, OS, build command, launch result, and light/dark and enlarged-text checks. Device tests remain separate from host `check`. Physical-device, store signing, release distribution are outside local foundation scope. Current feature-specific results live in [implementation notes](plans/project-foundation/implementation.md) and independent testing records when available.

## Workspace and backend

The workspace contains `apps/mobile`, `apps/backend`, and `packages/contracts`. Root mobile commands forward arguments to Expo from its application directory. Gemfile and the local bundle stay at root; native wrappers set BUNDLE_GEMFILE explicitly. Install from root with the frozen lockfile. `pnpm build` compiles contracts before backend; `pnpm check` builds, lints, checks types/format, and runs tooling, contracts, mobile, and backend HTTP tests.

Backend packages are pinned in their manifests: Fastify 5.12.3, Kysely 0.29.5 with pg 8.23.0, TypeBox 0.33.24 (compatible with the provider peer range), its Fastify provider 5.2.0, and Swagger 9.8.1. TypeScript remains 6.0.3. The pinned image currently reports PostgreSQL 17.5 and PostGIS 3.5.2. Node's built-in TypeScript stripping runs development commands; `pnpm build` produces executable JavaScript in package-local ignored dist directories. Contracts export platform-neutral source for Metro and built JavaScript for Node. Build contracts before standalone backend commands.

### Local services

Install Colima, Docker CLI, and Compose as host prerequisites. The verified host uses Colima 0.10.3, Docker CLI 29.8.0, Compose 5.5.1, and engine 29.5.2. On Apple Silicon start the dedicated profile with:

```sh
colima start --profile mireqo --vm-type vz --vz-rosetta --cpu 2 --memory 4 --disk 20
docker context use colima-mireqo
mise exec -- pnpm db:up
mise exec -- pnpm db:test:up
mise exec -- pnpm build
mise exec -- pnpm db:migrate
mise exec -- pnpm db:seed
```

`infrastructure/compose.yaml` pins official PostGIS 17-3.5 by immutable digest, using linux/amd64 and VZ/Rosetta on this host. Ports bind loopback only. Development uses port 54329 and persistent volume `mireqo_development`; isolated tests use port 54330, separate credentials/database, and disposable tmpfs storage. Example credentials are local development values only.

| Command                                         | Behavior                                                                                              |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `pnpm db:up` / `pnpm db:stop`                   | Start/wait for or stop development database, preserving data                                          |
| `pnpm db:test:up`                               | Start isolated integration database                                                                   |
| `pnpm db:migrate`                               | Apply versioned Kysely migrations explicitly                                                          |
| `pnpm db:seed`                                  | Insert deterministic operational fixture seed if absent                                               |
| `pnpm db:reset --delete-local-development-data` | Destructively remove the fixed local development container and volume; recreate and migrate afterward |
| `pnpm api`                                      | Start API with optional root .env                                                                     |
| `pnpm worker`                                   | Start worker with optional root .env; no live sources                                                 |
| `pnpm test:integration`                         | Reset only allowlisted test schema; run real PostGIS/migration/import tests                           |

Copy `.env.example` to `.env` if overrides are needed. API defaults to 127.0.0.1:3000. `/v1/health` is database-independent, `/v1/ready` returns 503 until the database and migrations are ready, and `/v1/openapi.json` serves schema-generated OpenAPI. Common errors contain `error.code` and `error.message`; internal details are not returned. No event endpoints exist yet.

For future mobile API use, iOS simulator reaches host localhost, Android emulator uses 10.0.2.2 or `adb reverse tcp:3000 tcp:3000`, and physical devices need a reachable host address plus deliberately configured HOST binding. The foundation screen makes no API request. EXPO_PUBLIC values are public; provider secrets never belong there.

The worker uses an empty source registry by default. Set WORKER_FIXTURE=success or fail deliberately to exercise a synthetic job; WORKER_INTERVAL_MS controls its local loop, not production provider policy. Session advisory locks serialize each source across worker processes; connection loss releases ownership and the next owner marks abandoned runs interrupted. Job writes are transactional and failures recorded without exception details. Graceful signals stop scheduling and close connections after active work.

### Schema and verification

Kysely migrations are authoritative; never edit applied migrations. Keep explicit database interfaces synchronized and verify real selected/inserted columns. Migrations and seeds never run implicitly on API/worker startup. Operational import records and fixture counters are the only tables: synthetic sample event inputs live in `apps/backend/fixtures`, and catalog event seeding remains deferred until an event schema exists.

Start both databases, migrate/seed development, then run integration tests. Tests refuse non-loopback, wrong port/user/database, and URL override parameters before destructive SQL. They verify fresh and repeated migrations, upgrade preservation, spatial distance, transactional failure, independent source work, cross-process exclusion and crash recovery, readiness, and unchanged development records. Test database reset destroys only test schema data; development reset requires the separate explicit flag above.

`pnpm check` does not require containers or devices; `pnpm test:integration` does require running databases. Native compilation and launch remain separate checks after workspace/native changes. Live providers, production hosting and catalog behavior are not covered by foundation fixture tests.

## References

- [Expo SDK compatibility](https://docs.expo.dev/versions/latest/): SDK 57 targets React Native 0.86 and Android SDK 36.
- [Expo local development](https://docs.expo.dev/guides/local-app-development/) and [native generation](https://docs.expo.dev/workflow/continuous-native-generation/).
- [mise Node/package-manager configuration](https://mise.jdx.dev/mise-cookbook/nodejs.html).
- [CocoaPods Gemfile workflow](https://guides.cocoapods.org/using/a-gemfile.html).
- [Expo unit testing](https://docs.expo.dev/develop/unit-testing/).

Validate upgrades against the pinned SDK's compatibility data and repeat the relevant checks/native builds before changing the supported toolchain.
