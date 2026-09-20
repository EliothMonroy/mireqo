# Mireqo product webpage

Status: planning complete; implementation authorized by the user request to implement `handoffs/mireqo-webpage/spec.md` under `apps/website`. The reviewer determines success after independent testing.

## Goal and authority

Deliver a single-page, mobile-first product introduction for Mireqo. A visitor should understand what the app does within a few seconds through concise English copy and the three supplied in-app screenshots. This is a static product page, not a browser version of the app and not a deployment.

Follow AGENTS.md, implement_new_feature.md, and each assigned persona. Product authority for this page is [handoffs/mireqo-webpage/spec.md](../../handoffs/mireqo-webpage/spec.md). Claim boundaries in that handoff override future-scope wording in the mobile product specs. Visual tokens start from the handoff palette and the existing light theme in `apps/mobile/src/ui/theme.ts`. Brand assets live in `assets/brand/`; screenshots live in `assets/screenshots/`.

User direction: implement the handoff under a new `apps/website` folder. That destination is authorized even though `architecture.md` currently lists only `apps/mobile` and `apps/backend`. Record the addition in architecture and build guidance; do not change the mobile app, backend, contracts, or catalog.

## Scope

- One static HTML page with CSS, copied brand/favicon/screenshot assets, and a local preview command.
- Compact header with the approved Open City SVG logo (home link), optional Features/Coverage text links, hero, three screenshot feature cards (`#app`), coverage/footer (`#coverage`).
- Exact initial geography, development/demo disclosure, and claim boundaries from the handoff. Public copy under 250 words excluding screenshot text and accessibility descriptions.
- Mobile-first layout: 320px start, horizontally scroll-snapping feature cards on small viewports with a “Swipe to explore” hint, CSS grid from ~768px, content capped near 1120px.
- Semantic HTML, visible focus, 44px control targets, 4.5:1 normal-text contrast, 200% text zoom, `prefers-reduced-motion`. Informational content available without JavaScript.
- Host checks that assert structure, copy, assets, word budget, and no catalog/API coupling.

Excluded: deployment/hosting, service worker, install prompt, analytics, accounts, newsletter, live catalog, waitlist, store badges, download buttons, testimonials, invented URLs/social accounts, mobile-app or backend changes, dark theme switcher, lightbox, autoplay, parallax.

## Existing integration points

- Base main is `54d0ea1676a227e7e528b03d94b5be996d0761a8`. Root checkout is on `main` with no other worktrees.
- pnpm workspace already includes `apps/*` (`pnpm-workspace.yaml`), so `apps/website` joins the workspace when it has a `package.json`. Name it `@mireqo/website` to match `@mireqo/mobile` and `@mireqo/backend`.
- Root `pnpm run check` runs recursive `lint`/`typecheck`/`test` with `--if-present`, plus format check. A website `test` script is picked up automatically. Do not add a website `build` that would change the contracts/backend-only root `build`.
- `architecture.md` workspace tree currently omits a website. Update it to list `apps/website` as a static product introduction with no API coupling. `build.md` currently documents only mobile/backend commands; add preview and website test notes.
- Required source assets exist: `assets/brand/mireqo-logo.svg`, `mireqo-mark.svg`, `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, optional `site.webmanifest` plus `web-icon-192.png`, `web-icon-512.png`, `web-maskable-512.png`; screenshots `assets/screenshots/{discover,event-details,saved}.png` at 1206×2622.
- No existing webpage, HTML package, or web framework is present. Do not reuse React Native components.

## Proposed changes

Create `apps/website` as a static site served from its own directory root:

```text
apps/website/
  package.json
  serve.mjs                 # loopback static preview; no extra runtime dependency
  test/page.test.mjs        # node:test checks of the delivered page and assets
  public/
    index.html
    styles.css
    favicon.svg
    favicon.ico
    apple-touch-icon.png
    site.webmanifest
    web-icon-192.png
    web-icon-512.png
    web-maskable-512.png
    mireqo-logo.svg
    mireqo-mark.svg
    screenshots/
      discover.png
      event-details.png
      saved.png
      discover-preview.png      # optional display-sized copy
      event-details-preview.png
      saved-preview.png
```

Copy required brand and screenshot files into `public/` rather than linking repository filesystem paths. Keep original screenshot PNGs available for full-size image links. Display-sized copies are allowed if they preserve content and readability.

Page behavior:

- Header logo is `mireqo-logo.svg`, ~140–176px wide, 4:1 aspect, linked to `#top` (or the document top) with accessible name “Mireqo — home.” Do not typeset a replacement wordmark.
- Optional nav: Features → `#app`, Coverage → `#coverage`. Visible on mobile; no hamburger.
- Hero uses the handoff copy. Primary action “See how it works” → `#app`. Supporting line “In development for iOS and Android.” No store badges or Download button.
- Feature section `id="app"`: heading “Discover. Explore. Save.” Three figures with the specified screenshots, headings, and supporting copy. Caption: “Actual development screens. Events shown are fictional examples.” Screenshot `<a>` links open the full-size local PNG and name the screen plus that they open a full-size image. Do not recreate in-app buttons as webpage controls.
- Small viewports: cards in a horizontally scrollable, scroll-snapping strip inside the page; glimpse of the next card; “Swipe to explore” hint. Keyboard reachable (tab order / scroll). No auto-advance. From ~768px, CSS grid, no horizontal strip.
- Coverage `id="coverage"`: “Starting close to home.” plus the exact Coacalco / Tultitlán / Mexico City sentence and browse-without-account line. Footer uses decorative `mireqo-mark.svg` (`alt=""`, `aria-hidden="true"`) beside “Mireqo — a little closer to what’s on.”
- Favicon/theme-color/apple-touch-icon (and optional manifest) use copied files. Relative URLs so preview at `/` and a subdirectory both resolve. `theme-color` `#93442C`.
- System sans-serif. Light theme only. Cream background `#F7F3EB`, surfaces `#FFFCF6`, terracotta accent `#93442C`, restrained borders/shadows around screenshots. No stock photos, device mockup frames, or decorative gradients.
- Hero screenshot is not required; keep the first feature previews near the first phone screen. Logo loads normally; feature screenshots may use `loading="lazy"` with reserved width/height.
- No JavaScript is required for the page. Preview `serve.mjs` is a development helper only.

Root `package.json` may add a `website` script that forwards to `@mireqo/website`. Do not add Vite, React, or other web frameworks. Do not add a lockfile-only dependency unless a preview/test cannot use Node’s standard library.

## Data flow and contracts

The page has no catalog, API, or backend contract. It must not fetch Mireqo API URLs, environment API bases, or demo event JSON. Screenshots are static files. Tests read local HTML/CSS/assets from `apps/website/public`.

Mobile, backend, database, worker, and `packages/contracts` are unaffected.

## Acceptance criteria

| ID   | Observable outcome                                                                                                                                                                                                                                                                                                                                                                                       |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC01 | Page communicates Mireqo’s purpose immediately (hero heading and description) and includes all three supplied screenshots with the specified feature headings and supporting copy.                                                                                                                                                                                                                       |
| AC02 | Development/demo disclosure (“Actual development screens. Events shown are fictional examples.”) and exact initial geography (Coacalco and Tultitlán in Estado de México, plus all of Mexico City) remain visible and accurate. Copy does not imply a public release, store download, GPS auto-discovery, accounts/sync, tickets, search, Settings, or coverage of all Estado de México / all of Mexico. |
| AC03 | Layouts at 320, 390, 768, and 1440px widths, including 200% text zoom, have no page overflow or clipped copy. Phone widths use a contained horizontal snap strip for the three cards; ~768px+ uses a grid. Content is capped near 1120px on wide viewports.                                                                                                                                              |
| AC04 | Touch and keyboard users can reach every feature card, nav destination, home logo, primary action, and full-size screenshot. Focus is visible. Controls meet ~44px targets.                                                                                                                                                                                                                              |
| AC05 | Images load from local website paths, keep screenshot proportions, and remain useful at displayed size. Logo/favicon/touch-icon/manifest URLs resolve from the preview origin. No placeholder `#` links except in-page fragment targets that exist.                                                                                                                                                      |
| AC06 | Public copy stays under 250 words excluding screenshot internals and alt text. The page has no runtime JS requirement for information. It does not depend on a running Mireqo API. Browser console has no implementation errors when previewed.                                                                                                                                                          |
| AC07 | Header uses approved `mireqo-logo.svg`; footer uses `mireqo-mark.svg`; tab uses the arch favicon. No substitute typeset logo.                                                                                                                                                                                                                                                                            |
| AC08 | Semantic landmark structure (header, nav if present, main, sections, figures/captions, footer), one `h1`, logical heading order, meaningful alts, `theme-color`, and title “Mireqo — Discover local events” with a concise description based on the hero.                                                                                                                                                |
| AC09 | Workspace still typechecks/lints/tests unaffected packages. Website tests pass. Architecture/build docs mention `apps/website` preview without implying mobile/API coupling.                                                                                                                                                                                                                             |

## Risks

- Large original screenshots can shift layout or overflow if dimensions are not reserved.
- Horizontal card strip can overflow the _page_ if not contained.
- Copy drift past the word budget if extra marketing sentences are added.
- Absolute `/favicon.svg` paths fail when the preview is not at domain root; use consistent relative URLs.
- Accidentally promoting future mobile features from the product specs rather than the handoff claim boundaries.

## Verification expectations

Implementer:

- `mise exec -- pnpm --filter @mireqo/website test` (or equivalent) for structure, assets, word count, claim-boundary strings, fragment ids, and absence of API/script-src requirements.
- `mise exec -- pnpm run format:check` on changed formatted files; `mise exec -- pnpm run check` if lockfile/workspace scripts change, otherwise website tests plus format/check of touched JS/HTML/CSS.
- Manual or browser preview at 320, 390, 768, 1440px and 200% zoom: no overflow, snap strip vs grid, visible focus, local image/favicon URLs.
- Record preview command (`mise exec -- pnpm --filter @mireqo/website preview` or root `pnpm website`) and any remaining limitations.

Tester independently repeats automated checks and browser/layout verification against the handoff acceptance list. Native Android/iOS and PostgreSQL checks are out of scope unless the implementation accidentally changed those packages.

Reviewer inspects the uncommitted website, evidence, architecture/build updates, and claim-boundary copy, then delivers after a Successful verdict.
