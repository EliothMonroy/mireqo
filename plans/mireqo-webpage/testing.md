# Mireqo product webpage testing

Status: required verification passed on the uncommitted worktree. This is not a final feature-success verdict.

## Tested code state

- Worktree: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/mireqo-webpage`
- Branch: `codex/mireqo-webpage`
- Base HEAD: `54d0ea1676a227e7e528b03d94b5be996d0761a8` (main)
- Implementation is uncommitted (modified `architecture.md`, `build.md`, `package.json`, `pnpm-lock.yaml`; untracked `apps/website/` and `plans/mireqo-webpage/`)
- Preview origin used: `http://127.0.0.1:4280/` (existing process already serving the worktree)

## Commands

| Command                                                     | Outcome                                                      |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| `mise exec -- pnpm --filter @mireqo/website test`           | 8 passed, 0 failed, duration ~43ms                           |
| Independent word count of visible/tag-stripped page text    | 156 words                                                    |
| `shasum -a 256` of original vs public full-size screenshots | Identical hashes for discover, event-details, and saved PNGs |
| `curl` of `/`, `/favicon.svg`, `/mireqo-logo.svg` on :4280  | HTTP 200                                                     |

Native Android/iOS, PostgreSQL, and `pnpm check` were not required for this static page and were not rerun. Mobile and backend application sources were not modified.

## Acceptance

| ID   | Result | Evidence                                                                                                                                                                                                                                     |
| ---- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC01 | Pass   | Hero heading/description present. Three figures use the supplied screenshots with the specified headings and supporting copy.                                                                                                                |
| AC02 | Pass   | Demo disclosure and exact Coacalco/Tultitlán/Mexico City sentence are visible. No download, store, waitlist, or API copy. Supporting line is in-development for iOS and Android.                                                             |
| AC03 | Pass   | Independent layout measurements in the implementer preview plus tester re-check of CSS: 320/390 snap strip; 768+ grid; `max-width: 1120px`; 200% text zoom without page overflow (implementer CDP evidence, CSS still contains those rules). |
| AC04 | Pass   | Native links for home, Features, Coverage, primary action, and full-size screenshots. `.preview-strip` is keyboard-focusable. `:focus-visible` styles present. Nav/button min-height 2.75rem.                                                |
| AC05 | Pass   | Local relative image/icon URLs. Original screenshot hashes match `assets/screenshots/`. Preview origin returned 200 for HTML, favicon SVG, and logo. Full-size Discover PNG previously opened at 1206×2622.                                  |
| AC06 | Pass   | 156 words including title text, under 250. No `<script>` in the page. No `/v1/` or API URL. Informational content is in HTML.                                                                                                                |
| AC07 | Pass   | Header `mireqo-logo.svg`, footer `mireqo-mark.svg` with `aria-hidden="true"`, favicon SVG/ICO and apple-touch-icon links.                                                                                                                    |
| AC08 | Pass   | `header`, `nav`, `main`, `section`, `figure`/`figcaption`, `footer`; one `h1`; title and description as specified; `theme-color` `#93442C`.                                                                                                  |
| AC09 | Pass   | Website tests pass. `architecture.md` lists `apps/website` as a static introduction without catalog coupling. `build.md` documents `pnpm run website`. Root `package.json` has the `website` script.                                         |

## Limitations recorded, not failures

- Default documented preview port 4173 was occupied by an unrelated site on this host; verification used 4280.
- Automated click of a screenshot link inside the nested strip did not always navigate; the file was verified by direct URL and matching checksums.

Passing verification. Ready for independent review of this worktree.
