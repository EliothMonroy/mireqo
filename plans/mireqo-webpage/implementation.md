# Mireqo product webpage implementation

Status: implemented and verified in the feature worktree. Ready for independent tester.

## Workspace

- Base main: `54d0ea1676a227e7e528b03d94b5be996d0761a8`
- Authoritative worktree: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/mireqo-webpage`
- Branch: `codex/mireqo-webpage`
- No implementer commit or push

Planning records were copied here from the planner checkout before application changes. This worktree is the authoritative copy for implementation notes.

## Changes

- Added `@mireqo/website` as a static HTML/CSS page under `apps/website/public`.
- Copied Open City brand files and the three original screenshots into the website public directory. Display uses 600px-wide preview PNGs; full-size links open the original 1206×2622 files.
- Header uses `mireqo-logo.svg` (160px, 4:1) with accessible name “Mireqo — home.” Optional Features/Coverage nav, no hamburger.
- Hero, three feature cards, demo disclosure, exact Coacalco/Tultitlán/Mexico City coverage, and decorative footer mark match the handoff copy.
- Small viewports use a contained scroll-snap strip with a “Swipe to explore” hint. From 768px the cards are a grid capped at 300px wide. Content max-width is 1120px.
- Favicon, apple-touch-icon, theme-color, and optional web manifest are relative to the site root.
- `serve.mjs` is a loopback static preview (default `127.0.0.1:4173`, override with `PORT`). No page JavaScript.
- Root `pnpm run website` forwards to the package preview script. `architecture.md` and `build.md` record `apps/website` without coupling it to the catalog API.
- `pnpm-lock.yaml` lists an empty `apps/website` importer; the package has no runtime dependencies.

## Checks

| Command                                                                          | Result                                                                                    |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `mise exec -- pnpm --filter @mireqo/website test`                                | 8 passed, 0 failed                                                                        |
| `mise exec -- pnpm exec prettier --write` on website sources                     | Clean                                                                                     |
| Browser preview `PORT=4280` (4173 was already in use by an unrelated local site) | Page, favicon, logo, screenshots, and manifest returned 200 from `http://127.0.0.1:4280/` |

Layout measurements on the preview origin:

| Width                                    | Notes                                                                      |
| ---------------------------------------- | -------------------------------------------------------------------------- |
| 320                                      | No page overflow; logo 160px; snap strip; swipe hint visible; cards ~225px |
| 390                                      | No page overflow; snap strip; cards ~279px                                 |
| 768                                      | CSS grid; swipe hint hidden; no page overflow; cards ~224px                |
| 1440                                     | Centered 1120px wrap; grid; cards 300px; no page overflow                  |
| 320 at 200% text (`html` font-size 32px) | No page overflow; strip still internally scrollable                        |

Coverage `#coverage` navigation resolved. Full-size Discover PNG opened at 1206×2622. Resource checks on the PNG response were empty of HTTP errors. Favicon SVG/ICO, apple-touch-icon, and manifest URLs resolved on the preview origin.

Native Android/iOS and PostgreSQL checks were not run; those packages were not changed except documentation.

## Limitations

- Default preview port 4173 may already be taken; use `PORT=4280 mise exec -- pnpm run website`.
- Screenshot link click inside the nested snap strip was not always followed by the browser automation; the destination file was verified by direct URL and HTTP 200.
- No deployment.

## Handoff

Tester should verify AC01–AC09 against this uncommitted worktree, including `apps/website/**`, `package.json`, `pnpm-lock.yaml`, `architecture.md`, `build.md`, and `plans/mireqo-webpage/*`.
