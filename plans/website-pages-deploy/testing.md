# GitHub Pages website deploy testing

Status: required verification passed on the uncommitted worktree.

## Tested code state

- Worktree: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/website-pages-deploy`
- Branch: `codex/website-pages-deploy`
- Base HEAD: `d3d5d5697ed96afbe22b522d67b4f1fbefbed1e5`

## Commands

`mise exec -- node --test scripts/pages-workflow.test.mjs apps/website/test/page.test.mjs` — 9 passed, 0 failed.

`apps/website/public/index.html`, `favicon.svg`, and `screenshots/discover.png` exist. Workflow artifact path is `apps/website/public`. Page asset hrefs are relative, not repository-root `/...` paths.

Live GitHub Pages deployment was not observed; that remains a post-merge Actions check.

## Acceptance

| ID   | Result                                                                    |
| ---- | ------------------------------------------------------------------------- |
| AC01 | Pass                                                                      |
| AC02 | Pass                                                                      |
| AC03 | Pass (workflow contains the test command before deploy via `needs: test`) |
| AC04 | Pass (relative URLs in `index.html`)                                      |
| AC05 | Pass (`build.md` documents Pages publishing `apps/website/public`)        |
