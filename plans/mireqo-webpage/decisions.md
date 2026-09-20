# Mireqo product webpage decisions

## Confirmed

- D01: User directed implementation of `handoffs/mireqo-webpage/spec.md` under a new `apps/website` folder, following `implement_new_feature.md`. Destination is authorized. Deployment is not authorized.
- D02: User did not authorize mobile-app, backend, contracts, database, or import-worker changes. The page must not depend on a running Mireqo API.
- D03: Product copy, geography, screenshots, logo/favicon mapping, layout breakpoints, accessibility, and claim boundaries in the handoff are the public-page requirements. Future mobile features in the product specs are out of scope and must not be promoted.

## Routine scoped interpretations

These follow the simplest reading of the handoff and existing workspace conventions. They are not new product inventions.

- D04: Implement a static HTML + CSS page with a Node standard-library preview script. Do not add a web framework (Vite, React, Astro, Next) or a service worker. Informational content must work without JavaScript.
- D05: Register the folder as pnpm package `@mireqo/website` so `apps/*` workspace membership and `pnpm -r --if-present test` pick it up. Add a root `website` script that starts the local preview. Do not add a website step to root `pnpm build`.
- D06: Include the handoff’s optional Features/Coverage nav (no hamburger) and optional `site.webmanifest` plus its 192/512 icons, because the assets already exist and the spec allows them without creating an install flow.
- D07: Copy required files from `assets/brand/` and `assets/screenshots/` into `apps/website/public/`. Use relative asset URLs so the preview origin and a possible subdirectory both resolve. Keep original screenshot PNGs for full-size links; display-sized copies are allowed if they preserve content.
- D08: Update `architecture.md` and `build.md` to record `apps/website` as a static product introduction. This is documentation alignment with the authorized destination, not a new service or shared package.
- D09: Use the handoff’s default English copy with only light editorial changes that preserve meaning. Keep public copy under 250 words excluding screenshot internals and alt text.
- D10: Verify with `node:test` over the delivered files plus browser/layout checks at 320/390/768/1440px and 200% zoom. Native mobile and PostgreSQL checks are unchanged and not required for this page.

No unresolved product question blocks implementation. Material new ambiguity returns to the planner/user before dependent implementation.
