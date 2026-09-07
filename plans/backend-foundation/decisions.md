# Backend foundation decisions

## Confirmed direction

User requested implementation of the backend foundation after agreeing to TypeScript, Fastify, a separate scheduled import worker, PostgreSQL/PostGIS, Kysely, REST `/v1` with OpenAPI/shared schemas, pnpm workspace, Compose local database, versioned migrations, separate seed/test data, and conservative multi-source catalog identity/freshness rules. Backend and mobile verification belong to their existing personas. The seven uncommitted guidance changes are agreed user work and must be preserved.

No live event sources, production hosting, actual event model, launch coverage, source-specific policies, or discovery endpoints have been approved by this foundation request.

## Current implementation decisions

User explicitly approved TypeBox with the Fastify type provider/OpenAPI plugin and Colima with Docker CLI/Compose. Coordinator confirmed the remaining choices below as routine implementations within the approved architecture; these are not separate user quotations. Foundation is ready for implementation.

| ID  | Decision                                                                                                                      | Reason / effect                                                                                                                                                                                                                                             |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D01 | TypeBox shared schemas with matching Fastify type provider and @fastify/swagger; platform-neutral value validation for mobile | Keeps JSON schemas, inferred types, validation, and OpenAPI aligned. Verify actual compatible package versions and React Native runtime compatibility before pinning.                                                                                       |
| D02 | `pg` as Kysely PostgreSQL dialect driver                                                                                      | A driver is still needed underneath Kysely; no second query abstraction.                                                                                                                                                                                    |
| D03 | Kysely's built-in Migrator via repository command; explicit initial database interfaces with migration/integration assertions | Avoids another runner/codegen dependency for the small operational schema. Migrations remain authoritative; types are not evidence of SQL correctness.                                                                                                      |
| D04 | Colima with Docker CLI/Compose, explicitly approved by user                                                                   | Coordinator owns host installation. Official PostGIS image currently requires amd64; use a pinned official image with linux/amd64 on Apple Silicon, Colima VZ/Rosetta compatibility, and verify actual startup. Do not silently adopt another image vendor. |
| D05 | Operational import-run schema plus fixture job only; no event catalog tables/API                                              | Provides real worker/database behavior without prematurely committing to provider-dependent event semantics. Deterministic sample event inputs may live only in development/test fixtures. Full event seeding follows later catalog schema work.            |

## Technical references checked during planning

- [Fastify type providers](https://fastify.dev/docs/latest/Reference/Type-Providers/) documents schema-derived route types and TypeBox integration. Exact installed-version compatibility remains an implementation check.
- [Kysely migrations](https://kysely.dev/docs/migrations) describes its migration facilities.
- [Fastify Swagger](https://github.com/fastify/fastify-swagger) documents schema-based OpenAPI generation.

## Remaining decisions outside this task

Provider selection and permitted reuse, matching/conflict rules, production import timing/retry policies, API catalog schemas/filter ordering/cursors, production deployment and abuse controls remain explicitly open. Foundation health/error contracts do not decide the eventual event schema.

## Host setup evidence from coordinator

Colima 0.10.3, Docker 29.8.0, Compose 5.5.1, and Lima 2.2.0 installed. Dedicated Colima profile `mireqo` startup underway with VZ/Rosetta, 2 CPUs, 4 GiB memory, and 20 GiB disk. Host installation belongs to coordinator; implementer records repository Compose resources separately. Runtime startup is not yet evidence of successful database tests. Official image architecture reference: [docker-postgis](https://github.com/postgis/docker-postgis).
