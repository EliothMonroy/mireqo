# Website large-screen layout implementation

Authoritative worktree: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/website-large-screens`
Branch: `codex/website-large-screens`
Base: `79ea50a0d2080eda2985ebdfd65b242a023c1dd1`

## Changes

- Wrap hero and feature previews in `.intro.wrap` so they can share one contained row on wide screens.
- At 768px+, keep the 3-up screenshot grid but start-align it with a 1.25rem gap instead of stretching cards with `space-between`.
- At 1200px+, place hero copy beside the three cards. 1024px was too narrow to keep screenshots in the 220–300px spec range next to a copy column, so the two-column intro starts at 1200px.
- Remove the 18ch heading cap, use `overflow-wrap: break-word`, and widen the lede to 42ch so the title can sit on one line when there is room.
- Keep the mobile snap strip, relative assets, 1120px cap, screenshot aspect ratio, and all public copy.

## Files

- `apps/website/public/index.html`
- `apps/website/public/styles.css`
- `apps/website/test/page.test.mjs`

## Checks

- `mise exec -- node --test apps/website/test/page.test.mjs` — 8 passed
- Local preview: `PORT=4290 mise exec -- pnpm run website` → `http://127.0.0.1:4290/`
- Browser geometry (no page overflow):
  - 1440: intro grid 352px + 728px; cards 232px with 16px gaps; hero and features heading share y=92
  - 768: stacked; 3-up start-aligned cards ~227px with ~20px gaps
  - 390/320: flex snap strip; swipe hint visible; document scrollWidth equals viewport

## Handoff

Ready for independent tester verification of AC01–AC03 at 320, 768, and 1440.
