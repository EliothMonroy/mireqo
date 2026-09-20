# Website large-screen layout testing

Tested worktree: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/website-large-screens`
Branch: `codex/website-large-screens`
Base: `79ea50a0d2080eda2985ebdfd65b242a023c1dd1`
Code state: uncommitted HTML/CSS/test changes in `apps/website/` plus these plan records.

## Checks

- `mise exec -- node --test apps/website/test/page.test.mjs` — 8 passed
- Local preview `http://127.0.0.1:4290/` with CDP viewports:

| Viewport | Result |
| --- | --- |
| 1440×900 | Intro is two columns (352px copy, 728px previews). Cards 232×232×232 with 16px gaps, start-aligned. No document overflow. Features `#app` still reachable. |
| 768×1024 | Hero stacked above a 3-up grid. Cards ~227px, ~20px gaps, `justify-content: start`. Swipe hint hidden. No overflow. |
| 390×844 | Snap strip (`flex`, `scroll-snap-type: x mandatory`). Swipe hint visible. No document overflow. |
| 320×568 | Same snap strip. Cards overflow only inside the strip. No document overflow. |

## Acceptance

- AC01: Pass — at 1440 the hero and three previews share the intro row; cards are not spaced to the content edges.
- AC02: Pass — 320/390 keep the snap strip; 768 keeps a 3-up grid; no page overflow.
- AC03: Pass — screenshot aspect, 1120px cap, relative assets, and public copy unchanged.

Testing passed. Ready for reviewer.
