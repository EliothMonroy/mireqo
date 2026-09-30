# Balance the large-screen website testing

Tested worktree: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/website-large-balance`
Branch: `codex/website-large-balance`
Base: `39af1ac64b10e22fe4035ad15627bd74b931997a`
Code state: uncommitted HTML, CSS, and page-test changes, plus these plan records.

## Checks

- `mise exec -- node --test apps/website/test/page.test.mjs` — 8 passed
- Local preview `http://127.0.0.1:4294/`

| Viewport | Result |
| --- | --- |
| 3440×1440 | Header spans the window. Intro is a centered 1248px column. Headline is centered. Screenshots are 384px with 40px gaps. No page overflow. |
| 1280×800 | Intro 1201px. Screenshots 384px. No page overflow. |
| 768×1024 | Stacked intro and a 3-up grid. Cards 222px. Swipe hint hidden. No page overflow. |
| 390×844 | Snap strip. Swipe hint visible. Document scroll width equals the viewport. |

## Acceptance

- AC01: Pass — on a wide screen the headline and screenshots share one centered column. The hero is not a narrow side column.
- AC02: Pass — the page uses the viewport height, with the header at the top and the footer after the main content.
- AC03: Pass — 390px keeps the snap strip, 768px keeps the 3-up grid, and copy and screenshot aspect ratio are unchanged.

Testing passed. Ready for reviewer.
