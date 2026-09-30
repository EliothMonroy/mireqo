# Balance the large-screen website implementation

Authoritative worktree: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/website-large-balance`
Branch: `codex/website-large-balance`
Base: `39af1ac64b10e22fe4035ad15627bd74b931997a`

## Changes

- From 1200px, the header spans the window and the intro is a centered column of at most 78rem.
- The headline, supporting copy, and button stack and center. The three screenshots sit in an even row underneath, each capped at 24rem.
- The page fills the viewport height and centers the main content between the header and footer when the window is taller than the page.
- Phone snap strip and the 768px grid are unchanged.

## Files

- `apps/website/public/index.html`
- `apps/website/public/styles.css`
- `apps/website/test/page.test.mjs`

## Checks

- `mise exec -- node --test apps/website/test/page.test.mjs` — 8 passed
- Preview: `http://127.0.0.1:4294/`

## Handoff

Ready for independent tester verification of AC01–AC03.
