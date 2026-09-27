# Wider large-screen website layout testing

Tested worktree: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/website-wide-layout`
Branch: `codex/website-wide-layout`
Base: `998aac8cb1f92eab067e297bf9af876043108e47`
Code state: uncommitted CSS and page-test changes, plus these plan records.

## Checks

- `mise exec -- node --test apps/website/test/page.test.mjs` — 8 passed
- Local preview `http://127.0.0.1:4292/`

| Viewport | Result |
| --- | --- |
| 2560×1200 | Content column 1800px, side margin 380px. Screenshots 416px. Hero and feature heading share the top. No page overflow. |
| 1920×1080 | Content column 1800px, side margin 60px. Screenshots 416px with 28px gaps. No page overflow. |
| 768×1024 | Stacked intro. 3-up grid, cards 227px, inside a 720px column. Swipe hint hidden. No overflow. |
| 390×844 | Snap strip. Swipe hint visible. Document scroll width equals the viewport. |

## Acceptance

- AC01: Pass — above 1920px the column is 1800px and each screenshot is 416px, still capped inside the column.
- AC02: Pass — 390px keeps the snap strip; 768px keeps the 3-up grid inside the narrower cap.
- AC03: Pass — copy, aspect ratio, and assets unchanged.

Testing passed. Ready for reviewer.
