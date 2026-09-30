# Balance the large-screen website

Status: planning complete. The wider column is an improvement, and the user still finds large displays a bit weird.

## Goal

On large screens, stop pinning a short side-by-side cluster to the top of the window. Give the headline the width of the page, set the three screenshots in an even row beneath it, and let a short page sit in the viewport instead of leaving a blank field under the footer.

## Approach

- From 1200px, stack the intro: headline and supporting copy share one row, then the screenshots.
- Cap each screenshot at 26rem and center it in an equal column so the row matches the hero width.
- Stretch the page to the viewport and center the main content between the header and footer.
- Leave the phone snap strip and the 768px grid unchanged.

## Acceptance

| ID | Outcome |
| --- | --- |
| AC01 | At 1920px and wider, the headline and screenshots share one content width. The hero is not a narrow column beside the phones. |
| AC02 | When the page is shorter than the viewport, the header stays at the top, the footer at the bottom, and the main content sits between them. |
| AC03 | 390px keeps the snap strip. 768px keeps a stacked 3-up grid. No page overflow. Copy and screenshot aspect ratio stay unchanged. |
