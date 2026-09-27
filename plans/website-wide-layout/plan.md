# Wider large-screen website layout

Status: planning complete. The user showed the live page on a large monitor: the centered 1120px intro is a small island, and the three screenshots stay about 230px wide.

## Goal

On large screens, grow the centered page so the hero and the three screenshots read as the page, with captions wide enough to wrap cleanly. Keep the mobile snap strip and the 768px 3-up grid.

## Spec note

The website brief caps content near 1120px and screenshots near 220–300px. That cap is what makes the attached large-screen screenshot look sparse. This change follows the user’s later direction and lets the column grow to 1800px, with each screenshot capped at 26rem so a single image still does not stretch across the viewport.

## Approach

- From 1200px, raise the shared `.wrap` cap from 1120px to 1800px.
- Keep the intro as copy plus screenshots, and let the screenshot tracks grow up to 26rem.
- Center the hero against the screenshot group.
- Leave 320px and 768px behavior unchanged.

## Acceptance

| ID | Outcome |
| --- | --- |
| AC01 | At 1920px and wider, the content column is wider than 1120px and each screenshot is wider than 300px, still capped so the row does not span the full viewport. |
| AC02 | 320px and 390px keep the snap strip. 768px keeps a 3-up grid inside the 1120px cap. No page overflow. |
| AC03 | Copy, screenshot aspect ratio, and relative assets stay unchanged. |
