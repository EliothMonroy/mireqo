# GitHub Pages website deploy implementation

Status: implemented and verified. Ready for independent tester.

## Workspace

- Base: `d3d5d5697ed96afbe22b522d67b4f1fbefbed1e5`
- Worktree: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/website-pages-deploy`
- Branch: `codex/website-pages-deploy`

## Changes

- `.github/workflows/static.yml` uploads `apps/website/public` instead of the repository root, runs `node --test apps/website/test/page.test.mjs` with Node 24.20.0 first, and limits automatic runs to website/workflow path changes plus `workflow_dispatch`.
- `scripts/pages-workflow.test.mjs` asserts that artifact path and test command.
- `build.md` records that Pages publishes `apps/website/public`.

## Checks

`mise exec -- node --test scripts/pages-workflow.test.mjs apps/website/test/page.test.mjs` — 9 passed, 0 failed.

A live GitHub Pages URL is not claimed; that requires a post-merge Actions run with Pages enabled on the repository.
