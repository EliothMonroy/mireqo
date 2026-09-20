# Website large-screen layout

Status: planning complete. The user asked to fix the product page looking bad on larger screens.

## Goal

Keep the mobile-first page, but make wide viewports feel composed: the hero should not sit in a thin column beside empty cream space, and the three screenshots should not be stretched apart across 1120px.

## Approach

- Wrap hero and feature previews in `.intro` so ≥1024px can place copy and the three cards side by side within the 1120px cap.
- From 768px, use a 3-column grid with a modest gap and start alignment instead of `space-between`.
- Keep screenshot width in the 220–300px range. Do not add mockups, extra sections, or copy.
- Soften heading wrap (`overflow-wrap: break-word`) so “Good things are close by.” can sit on one line when there is room.

## Acceptance

| ID | Outcome |
| --- | --- |
| AC01 | At 1440px, hero and three previews share the first screen as one intro group; cards are not spaced to the content edges with large gaps. |
| AC02 | 320/390 still use the snap strip; 768 still uses a 3-up grid. No page overflow. |
| AC03 | Screenshot proportions, 1120px cap, relative assets, and copy/claim boundaries unchanged. |
