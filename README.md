# eric-blanchard-portfolio

The portfolio site of Eric Blanchard: software developer and founder of [Deleptual](https://deleptual.ca).

The site is its own case study. The pipeline that builds it measures it, and the `/engineering` page shows those numbers from the exact run that deployed it.

## Stack

- **Next.js 16** (App Router, Cache Components, Partial Prefetching), fully prerendered
- **TypeScript**, strict, with typed routes
- **Tailwind CSS 4**, design tokens in `app/globals.css`
- **Vitest** for unit tests, and Storybook stories run as browser tests via `@storybook/addon-vitest`
- **Storybook 10**, published with the site at `/storybook`
- **Playwright** + **axe** for end-to-end and accessibility tests, light and dark
- **Lighthouse** with performance, accessibility and weight budgets
- **GitHub Actions** for CI/CD, **Netlify** for hosting, **Dependabot** + **CodeQL** for upkeep

## Commands

| Command              | What it does                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `npm run dev`        | Dev server on http://localhost:3000                                                      |
| `npm run storybook`  | Component library on http://localhost:6006                                               |
| `npm test`           | Unit tests and story tests                                                               |
| `npm run e2e`        | Playwright against a production build (run `npm run build` first)                        |
| `npm run lighthouse` | Lighthouse budgets against a production build                                            |
| `npm run verify`     | Everything CI runs, in order, ending with a build that includes the fresh quality report |

Storybook tests and Playwright need Chromium: `npx playwright install chromium`.

## How the pipeline works

```
pull request ─▶ lint, types, format ─▶ unit + story tests (coverage) ─▶ Storybook build
             ─▶ next build ─▶ Playwright + axe ─▶ Lighthouse budgets ─▶ generated/quality.json
             ─▶ netlify deploy --build (preview for PRs, production for main)
```

- `scripts/collect-quality.mjs` turns the test, coverage, Storybook, axe, bundle and Lighthouse reports into `generated/quality.json`. The deploy job rebuilds with that file, so the published numbers describe the published build.
- A committed `generated/quality.json` holds the last local measurement, so `npm run dev` shows realistic numbers.

## Staying up to date on its own

1. **Dependabot** opens grouped update PRs every Monday morning (Toronto time), for npm packages and for the GitHub Actions themselves.
2. **Auto-merge**: patch and minor updates merge themselves once the `Verify` check passes. Major versions are labelled `needs review` and wait for a person.
3. **Weekly rebuild**: CI runs every Monday afternoon on `main`, re-measures, and redeploys, so merged updates go live and the quality report stays current.
4. **CodeQL** scans the code and the workflows on every PR and weekly. `npm audit` blocks high-severity advisories in production dependencies.

## One-time setup

1. Create the GitHub repository and push `main`.
2. On Netlify, create a site (no Git connection needed, or set **Build status: Stopped** if connected). Copy the **Site ID** and create a **personal access token**.
3. In the GitHub repository settings add secrets `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`. The public URL defaults to `https://ericblanchard.ca`; set a `SITE_URL` variable only to override it.
4. Run `scripts/setup-github.sh` once (needs the GitHub CLI). It enables auto-merge, Dependabot security updates, and branch protection that requires `Verify` to pass.

## Adding a project

Add an entry to `content/projects.ts`. Screenshots go in `public/work/<slug>/` and are listed in the project's `screenshots` array with alt text and dimensions; a unit test checks that every listed file exists.
