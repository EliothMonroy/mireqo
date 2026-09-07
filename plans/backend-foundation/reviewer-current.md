# Backend foundation current reviewer handoff

Independent testing passed for AC1–AC10. Reviewer must determine final feature success before committing or creating the PR. This summary is self-contained for current scope, decisions, implementation and verification; use it with testing.md and direct source inspection.

## Goal and agreed scope

Provide a repeatable local TypeScript backend API and separate import-worker foundation with PostgreSQL/PostGIS, integrated in a pnpm workspace while preserving the existing Expo Android/iOS application. No event discovery implementation, provider selection, real ingestion, catalog schema, accounts, production hosting, release or deployment is included.

Approved architecture: React Native/Expo mobile in apps/mobile; Fastify API and worker in apps/backend; platform-neutral public runtime schemas/types in packages/contracts; REST /v1; PostgreSQL/PostGIS; Kysely; root pnpm orchestration. User approved TypeBox with Fastify schema/OpenAPI tooling and local Colima/Docker/Compose. Routine implementation choices: pg driver, Kysely Migrator, explicit operational table interfaces verified against real database, official digest-pinned amd64 PostGIS image with VZ/Rosetta, empty live-source registry and opt-in synthetic fixture jobs.

## Current implementation

Mobile files move into apps/mobile; root mobile commands forward arguments, local doctor resolves root pins and app dependencies, and native wrapper supplies root Gemfile/bundle context. App screen, theme, routing and configuration remain byte-identical to base. Mobile contract tests and platform Metro bundles validate the shared parser without adding network work on launch.

API has separate application factory and executable startup, validated configuration, sanitized errors, graceful shutdown, /v1/health, /v1/ready and schema-generated /v1/openapi.json. Readiness requires migrated database access; health does not.

Compose provides persistent development and separate guarded disposable test databases. Explicit versioned migrations establish PostGIS, import_runs and fixture_state; deterministic seed is separate from process startup. Worker is a separate executable with no live sources by default, opt-in fixtures, dedicated-session advisory source locks, transactional writes, persisted outcomes and interrupted-run recovery after owner process loss.

Dependencies remain pinned: existing Node24.20.0/pnpm12.3.4/Expo57.0.20/ReactNative0.86.3/TypeScript6.0.3, backend Fastify5.12.3/Kysely0.29.5/pg8.23.0/TypeBox0.33.24/provider5.2.0/Swagger9.8.1. Actual database PostgreSQL17.5/PostGIS3.5.2. Build guidance and architecture document implemented status and future exclusions.

## Passing evidence

See [independent testing](testing.md) for commands, requirement mapping, source fingerprint, platform context and resource inventory. Fresh frozen install plus build, full repository checks, real DB migration/spatial/transaction/worker recovery tests, compiled startup/shutdown, development persistence and guarded reset refusal passed. Tester added focused error-schema and persisted-attempt assertions, with all affected checks rerun.

Both native builds succeeded in this worktree. Tester independently compared installed APK/iOS binaries with build outputs, checked moved app files against base, verified Metro working directory and both contract bundles, reopened both native apps and visually inspected fresh captures showing the unchanged screen. [Android](evidence/tester-android-launch.png), [iOS](evidence/tester-ios-launch.png).

Code manifest [tested-code.sha256](evidence/tested-code.sha256), 49 files excluding Markdown and plans; manifest hash `2608c44b523815ade2c9de97b308db9422386ca21dac741697236a39a825ba04`. Later relevant changes require affected verification again.

Current architecture wording was independently verified against implementation: TypeBox/Fastify Swagger and existing source locking/reconciliation are documented as implemented; provider policies remain deferred. All 49 tested-code manifest entries and diff checks still pass.

## Ownership and delivery

Base main `acbb0babd6efd18910bfe36492a92f1ffa7b236d`; feature `codex/backend-foundation`; authoritative `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/backend-foundation`. Full implementation remains uncommitted, including untracked files. Root seven approved guidance edits and original planning records remain preserved. Helper branch/worktree `codex/backend-mobile` at sibling `.worktrees/backend-mobile` is integrated and uncommitted.

BF01–BF07 implementation complete; BF08 independent testing passed; BF09 review/delivery pending. Reviewer follows reviewer.md and implement_new_feature.md for verdict, dated changelog, useful future ideas if warranted, scoped commit, push/PR and safe cleanup. No merge/publish/release authorization is implied. Retain open PR source and user work; details of database, Metro/native, temporary copies/logs and helper resources are in testing.md.
