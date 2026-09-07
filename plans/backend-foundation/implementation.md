# Backend foundation implementation

## Handoff

Implemented and implementer-verified; ready for independent tester. This is not the reviewer success verdict. Authoritative worktree: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/backend-foundation`, branch `codex/backend-foundation`, base main `acbb0babd6efd18910bfe36492a92f1ffa7b236d`. No commits or pushes made. Seven approved dirty root guidance docs and planning records deliberately copied; root originals untouched.

## Changes

- Moved unchanged Expo screen/application/config into apps/mobile; root commands forward arguments, doctor locates root pins/mobile dependencies, native wrapper provides root Gemfile/bundle paths.
- Added @mireqo/contracts TypeBox health/error schemas and parseHealth runtime validation. Mobile data boundary and its tests consume the package. Platform-specific Metro entry bundles demonstrate shared package resolution without adding a launch-screen network dependency.
- Added Fastify factory/process startup, /v1/health, /v1/ready, generated /v1/openapi.json, sanitized errors, config validation, structured logging, and signal shutdown.
- Added digest-pinned official PostGIS Compose dev/test services, explicit Kysely migrations and seed, operational-only schema/interfaces, and guarded isolated integration testing. Seed input is synthetic; no event catalog schema or endpoint added.
- Added separate worker, empty live registry, opt-in fixture, dedicated-session advisory locks, transactional job writes, failure recording, and abandoned-run reconciliation after process death.
- Updated architecture/build implementation status and agreed personas. No provider, production hosting, or product behavior introduced.

## Dependency decisions

Node/pnpm/Expo/React/RN/Ruby/JDK pins unchanged. Backend uses Fastify5.12.3, Kysely0.29.5, pg8.23.0, @fastify/swagger9.8.1, TypeBox0.33.24, and provider5.2.0. TypeBox0.34 versions caused pnpm peer-range rejection; selected compatible0.33.24 and verified no peer issues. Parser8.69.0 supports pinned TypeScript6.0.3. Kysely0.29 migrator imports use kysely/migration. Official image digest is in Compose; actual PostgreSQL17.5/PostGIS3.5.2 ran under Colima VZ/Rosetta.

## Verification evidence

- `mise exec -- pnpm check`: PASS build, lint, strict types, format, seven tooling tests, one contracts test, two backend HTTP/config tests, six mobile tests. `/tmp/mireqo-backend-check.log`.
- `mise exec -- pnpm install --frozen-lockfile`: PASS existing checkout. Fresh isolated copy also installed with frozen lock and built both packages; lock byte-identical. `/tmp/mireqo-backend-frozen.log`, `/tmp/mireqo-backend-fresh.log`.
- `pnpm db:migrate`, `pnpm db:seed`: PASS. `pnpm test:integration`: PASS real spatial distance/radius, absent-schema readiness, fresh/repeated migration, migration001→002 sentinel preservation, deterministic seed, typed writes, failed job rollback, repeated attempts, distinct source progress, separate-process same-source exclusion, SIGKILL lock release and interrupted-run reconciliation, bounded unavailable readiness, and development-data preservation. `/tmp/mireqo-backend-integration.log`.
- `/tmp/mireqo-backend-smoke.py`: PASS compiled API/worker startup and SIGTERM exit within5s, API three endpoints, invalid configuration failure, unconfirmed reset refusal, dev Compose stop/start preserving fixture seed. `/tmp/mireqo-backend-smoke.log`. Processes exited; no API/worker smoke process retained.
- `pnpm ios --device C588ADDD-FC8A-48E8-BA7D-B14D9093962D --no-bundler`: PASS Xcode26.6/iOS26.5 iPhone17Pro, zero errors/two upstream script warnings. `/tmp/mireqo-backend-ios.log`.
- `pnpm android --device Medium_Phone --no-bundler`: PASS455 Gradle tasks48s, Android17/API37 emulator-5554. `/tmp/mireqo-backend-android.log`.
- Both installed apps reopened after Metro was ready; coordinator inspected screenshots showing unchanged Mireqo foundation screen. Evidence [iOS](evidence/ios-launch.png), [Android](evidence/android-launch.png). Use `adb reverse tcp:8081 tcp:8081` and open `exp+mireqo://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081`; initial pre-Metro launch retained its connection-error page until reopened.
- Metro GET `/apps/mobile/src/data/health.bundle?platform=ios&dev=true&minify=false` and equivalent Android URL: both200, ~955KB bundles. `/tmp/mireqo-backend-contract-{ios,android}.bundle`. No temporary imports added to app.
- `git diff --check`: PASS. Generated native projects/dependencies/env ignored. Contracts test does not assert live provider connectivity.

Fastify5.12 emits an upstream deprecation notice for disableRequestLogging (supported until6); this is not a failed check. Local foundation does not claim physical-device signing, release deployment, actual event queries, production schedules, or live-source coverage.

## Tester instructions and resource inventory

Use the authoritative worktree and `PATH="$HOME/.local/bin:/opt/homebrew/bin:$PATH"`; mise configuration trusted. Docker context colima-mireqo. Dev/test containers are running (`mireqo-db-1`, `mireqo-test-db-1`), dev volume mireqo_development, test tmpfs. Run check and test:integration sequentially against this tree; integration intentionally resets only allowlisted test schema.

Metro retained on8081 (session42516); iOS simulator and Android emulator retained for independent launch tests. Native outputs and root vendor bundle are ignored. Colima mireqo is the user-approved host runtime, not disposable project source.

Helper branch codex/backend-mobile at `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/backend-mobile`: source moved via reviewed patch/copy, helper tests included in final checks, no commits. Patch `/tmp/mireqo-backend-mobile.patch` and inventory `/tmp/mireqo-backend-mobile-untracked.txt`; safe cleanup follows preservation/delivery rules.

Fresh verification copy: /var/folders/qw/18v8y7cn4wg9tjl1txnqs3cr0000gn/T/mireqo-backend-fresh-ongq1g8c. Temporary verification code/logs live under /tmp/mireqo-backend-* and /tmp/backend-*. Source changes are authoritative only in the feature worktree. Reviewer should retain open PR branch/active preview until safe cleanup.

## Review documentation correction

Corrected architecture.md to identify the implemented TypeBox/Fastify Swagger contract tooling and distinguish implemented dedicated-session locking/interrupted-run recovery from deferred provider policies and production requirements. Documentation only; no application, dependency, configuration, or test code changed. `git diff --check` passed; returned through coordinator to tester for documentation verification.
