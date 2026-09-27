# Wider large-screen website layout implementation

Authoritative worktree: `/Users/eliothmonroy/Documents/Github/mireqo/.worktrees/website-wide-layout`
Branch: `codex/website-wide-layout`
Base: `998aac8cb1f92eab067e297bf9af876043108e47`

## Changes

- From 1200px, the shared content column grows from 1120px to 1800px.
- Screenshot tracks grow with that column, capped at 26rem, so a wide monitor no longer leaves the phones at about 230px.
- Hero copy stays in a column up to 24rem and aligns to the top of the screenshot group.
- Mobile snap strip and the 768px grid are unchanged.

## Files

- `apps/website/public/styles.css`
- `apps/website/test/page.test.mjs`

## Checks

- `mise exec -- node --test apps/website/test/page.test.mjs` — 8 passed
- Preview: `http://127.0.0.1:4292/`

## Handoff

Ready for independent tester verification of AC01–AC03.
