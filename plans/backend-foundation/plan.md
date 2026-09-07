# Backend foundation plan

## Goal and authority

Provide a repeatable local foundation for the agreed TypeScript API and import worker backed by PostgreSQL/PostGIS, integrated into the pnpm workspace, while preserving the existing Android/iOS application. This is infrastructure foundation work, not event discovery implementation. Reviewer determines success after independent testing.

Read [architecture](../../architecture.md), [build guidance](../../build.md), [workflow](../../implement_new_feature.md), and the linked personas. Product boundaries come from [high-level spec](../../spec/high-level-spec.md), [feature spec](../../spec/feature-spec.md) (especially missing-data and global behaviors), and [UI spec](../../spec/ui-spec.md). No product acceptance criteria are claimed complete by this work.

Current decisions and readiness are in [decisions](decisions.md); ownership and execution state are in [tasks](tasks.md).

## Existing implementation and preservation

- Base: local `main` at `acbb0babd6efd18910bfe36492a92f1ffa7b236d` when planning began.
- Existing Expo application, native wrappers, strict types, lint boundaries, tooling tests, and component test are at repository root. Native projects are generated, not tracked.
- Seven existing uncommitted updates in architecture.md, build.md, implement_new_feature.md, implementer.md, planner.md, reviewer.md, tester.md describe the already-agreed backend architecture and responsibilities. Preserve and deliberately carry them into the authoritative feature worktree; do not overwrite or discard them.
- Toolchain versions remain under existing mise.toml/packageManager authorities. Avoid incidental Expo, React Native, Ruby, JDK, or pnpm upgrades.
- Implementation uses a separate `codex/backend-foundation` branch/worktree. Record actual location before editing code. Root planning records become non-authoritative once deliberately copied into that worktree.

## Included work

1. Move the current Expo app into `apps/mobile`; create `apps/backend` and `packages/contracts`; establish root orchestration and one lockfile. Preserve convenient root mobile commands and argument forwarding. Adjust doctor, native scripts, lint, tests, ignored generated paths, and CocoaPods path handling deliberately.
2. Fastify application factory separate from process startup, environment validation, structured logging without secrets, graceful shutdown, liveness/readiness, consistent errors, and generated OpenAPI. API remains available for liveness when its database is unavailable; readiness distinguishes an unavailable/unmigrated database.
3. Shared runtime schemas and inferred types, consumed by backend and a focused mobile data-boundary contract check. Demonstrate schema validation and mobile bundling without adding a network dependency to the launch screen or a new user-facing diagnostic feature.
4. Compose-managed pinned PostgreSQL/PostGIS, persistent development volume, explicit migration command, isolated integration-test target, and development seed command. Development fixtures are clearly synthetic and do not appear as real catalog data.
5. A separate runnable worker with an empty live-source registry by default. A deliberately enabled fixture job exercises persisted run state, per-source mutual exclusion across processes, repeatability, failures, and subsequent recovery. No external provider credentials or connections are needed.
6. Repository-local checks, deterministic tests, updated build instructions and architecture implementation status.

## API and data boundaries

Foundation routes are limited to health/readiness and OpenAPI; choose clear concrete paths under `/v1` and document them. Health returns an application status, readiness verifies usable database/schema access with bounded waiting, unavailable readiness returns 503. Unknown routes return the common error contract. Unexpected errors do not disclose SQL, credentials, stack traces, or internal provider details. Request-schema rejection can be verified with a test-only registered route rather than shipping an invented public endpoint.

Contracts contain only public schemas/types and platform-neutral runtime validation. Mobile and backend must not import each other's internals. Database access uses Kysely and parameterized SQL inside the backend, not shared packages or HTTP handlers directly.

Only operational import-run state is needed initially. Do not design an event/venue/source-record catalog table before actual provider data and the product contract are selected. If fixture seeds need persistence, use clearly identified operational fixture records rather than an invented event model. Store deterministic sample event inputs as development/test fixtures only, with no public event endpoint. This deliberately limits the build guidance's future sample-event seeding to the portion supported by the foundation schema; document the remaining catalog seeding work explicitly.

PostGIS verification must execute real spatial SQL against the container (for example, known-point distance and radius behavior), not merely check a mocked extension response. Schema migrations remain authoritative. Kysely types and selected/inserted column behavior must be verified against the migrated database.

Worker locking/recovery is an implementation planning decision, not a provider policy. Prefer a database-backed mechanism that releases ownership after connection/process loss and bounds concurrent starts per source. Do not hold a pooled session lock then return that session to the pool. If crashed run records remain, subsequent ownership must reconcile them explicitly. Failures must not prevent other fixture sources or subsequent scheduled attempts. Production refresh intervals, source priorities, retries, and matching stay deferred.

## Acceptance criteria

| ID   | Observable criterion                                                                                                                                                                                                                                                                                      |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1  | A fresh frozen workspace installation resolves mobile, backend, and contracts using the pinned toolchain and committed lockfile; checks/builds use local dependencies.                                                                                                                                    |
| AC2  | Existing root mobile commands still work from the new layout; Android and iOS compile and launch the unchanged foundation screen from the moved app, with working Metro resolution. Existing component/tooling checks pass.                                                                               |
| AC3  | API and worker start as separate local processes using documented commands and fail clearly on invalid configuration. Shutdown releases server, timers, and database connections.                                                                                                                         |
| AC4  | Liveness returns success without requiring the database; readiness succeeds only with a reachable, migrated database and returns a bounded 503 on unavailability. Schema validation, not-found, and unexpected errors follow documented contracts without internal leakage.                               |
| AC5  | OpenAPI is generated from the same schemas used at runtime; both app packages consume the shared package without forbidden dependencies. A mobile data-boundary test accepts a valid foundation response and rejects malformed data; no launch-screen API dependency is introduced.                       |
| AC6  | Compose starts the pinned database with PostGIS. Stop/start preserves known development data. Explicit reset is separate and clearly destructive. Test/reset operations reject development and non-allowlisted targets before mutation.                                                                   |
| AC7  | Migrations initialize a fresh database and repeated migration is safe. Upgrade from the relevant prior migration preserves sentinel data. Development seeding is deterministic/repeatable and separate from migration and process startup.                                                                |
| AC8  | Real database integration tests verify PostGIS spatial behavior, operational writes/types, transactional failure behavior, and isolation from development data.                                                                                                                                           |
| AC9  | Fixture worker execution records success/failure, repeated attempts have correct operational records, concurrent worker attempts cannot overlap for the same source, different sources remain independent, and ownership recovers after failure/process loss. Default worker never calls a live provider. |
| AC10 | Root and per-package checks, database integration tests, build/start commands, environment examples, local API connectivity guidance, and implementation status are documented accurately. No secrets, native output, dependencies, or temporary resources are committed.                                 |

## Verification expectations

Implementer records commands, actual dependency/container versions, outcomes, and code state in implementation.md. Tester independently verifies the current worktree, including required real database behavior and Android/iOS layout regression, recording evidence in testing.md. Review starts only after required checks pass, with a curated handoff excluding blocker history.

Required checks include frozen install, lint/types/format, existing mobile tests, backend/contract unit and HTTP tests, compiled backend startup, real PostgreSQL/PostGIS integration, migration re-run and upgrade preservation, seed repeatability, destructive target rejection, worker multi-process exclusion/recovery, and native builds/launches. UI styling is unchanged: existing screen assertion plus actual launch verifies preservation; new exhaustive accessibility behavior is not added by workspace relocation.

No live-provider connectivity, production hosting, deployment, physical-device signing, event search/pagination/model, accounts, or catalog completeness claim is in scope.

## Risks and pending inputs

Contract tooling and Colima are user-approved; driver/runner/type synchronization and operational-only schema choices are documented in decisions.md. Coordinator handles the dedicated Colima runtime setup independently. Record an unavailable runtime or required native verification in blockers.md rather than weakening criteria. Use the official PostGIS image pinned to a supported version, declaring linux/amd64 and documenting the Colima VZ/Rosetta requirement on this Apple Silicon host; verify actual image execution. Workspace relocation can affect Expo, Bundler, and script working-directory assumptions; verify actual native builds.
