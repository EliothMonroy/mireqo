# GitHub Pages website deploy decisions

## Confirmed

- D01: User asked to update the existing GitHub Actions workflow so it deploys the website correctly. Live Pages hosting of `apps/website` is authorized. Merging/publishing the workflow still requires the usual PR; this task does not merge itself.

## Routine scoped interpretations

- D02: Correct deploy input is `apps/website/public` (the static files the preview server already serves). Do not upload the repository root.
- D03: Keep relative asset URLs. They work at domain root and at a GitHub project-pages base path such as `/mireqo/`.
- D04: Run `node --test apps/website/test/page.test.mjs` in CI with Node 24.20.0 before deploy. No extra web framework or Pages build step.
- D05: Trigger on `main` pushes that touch the website or this workflow, plus `workflow_dispatch`.
