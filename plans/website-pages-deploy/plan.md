# GitHub Pages website deploy

Status: planning complete; user authorized fixing `.github/workflows/static.yml` so it deploys the product website correctly.

## Goal

Publish only the static Mireqo product page (`apps/website/public`) to GitHub Pages. The current starter workflow uploads the repository root, which has no `index.html` and would expose the rest of the project.

## Scope

- Change the Pages artifact path to `apps/website/public`.
- Run website page tests in CI before deploy, using Node 24.20.0 (mise pin) without a full workspace install.
- Document the GitHub Pages publish path in `build.md`.
- Add a host test that the workflow publishes that folder and not `.`.

Excluded: custom domain, service worker, changing page copy, mobile/backend, enabling Pages in the GitHub UI (already implied by the existing workflow).

## Acceptance

| ID   | Observable outcome                                                                                                             |
| ---- | ------------------------------------------------------------------------------------------------------------------------------ |
| AC01 | The workflow uploads `apps/website/public`, not the repository root.                                                           |
| AC02 | The published directory contains `index.html` and the copied brand/screenshot assets used by the page.                         |
| AC03 | CI runs website page tests before deploy.                                                                                      |
| AC04 | Relative asset URLs on the page remain valid when the site is served from the Pages root (project-site subdirectory included). |
| AC05 | `build.md` describes Pages as publishing `apps/website/public`.                                                                |

## Verification

- `node --test scripts/pages-workflow.test.mjs apps/website/test/page.test.mjs` (or `pnpm test` subset).
- Inspect the workflow YAML and confirm `index.html` exists at the artifact path.
- Do not claim a live Pages URL until a post-merge Actions run is observed.
