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
- **Lighthouse** with performance, accessibility and weight budgets, its CPU slowdown calibrated to the machine running it (`lib/lighthouseCalibration.ts`)
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

## Contact form

`/contact` sends messages from the browser through [EmailJS](https://www.emailjs.com). The recipient is set in the EmailJS template, not in the page. The SDK only loads when someone presses **Send message**.

### EmailJS template

| Field      | Value                                     |
| ---------- | ----------------------------------------- |
| Subject    | `Portfolio: {{topic}} from {{from_name}}` |
| To Email   | `eric.blanchard@deleptual.ca`             |
| From Name  | `{{from_name}}`                           |
| From Email | Use Default Email Address                 |
| Reply To   | `{{reply_to}}`                            |

The form sends exactly these variables: `{{from_name}}`, `{{reply_to}}`, `{{company}}`, `{{topic}}` and `{{message}}`. Anything else in the template (such as `{{name}}` or `{{title}}` from EmailJS's starter template) arrives blank.

Under **Account → Security**, restrict allowed origins to `https://ericblanchard.ca` (add `http://localhost:3000` to test locally).

### Where the IDs go

The service ID, template ID and public key are **not secrets**: they end up in the page's JavaScript, and EmailJS limits their use by allowed origin. They're needed when the site is **built**, which happens in GitHub Actions. Put them in one place:

- **GitHub** (simplest): repository **variables** `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`.
- **Netlify**: site environment variables `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`, with values for **all deploy contexts**. Builds run by the Netlify CLI use the Local development context.

GitHub values take effect only when set, so they never blank out Netlify's. For local testing, put the `NEXT_PUBLIC_` names in `.env.local`.

Spam protection: a hidden honeypot field, EmailJS's headless-browser blocking, a 30-second per-browser rate limit, and the origin allowlist. If the form can't send, it shows the email address instead.

## Adding a project

Add an entry to `content/projects.ts`. Client work, which has nothing public to show, lives in `content/clientWork.ts`.

## Screenshots

Screenshots are captured from the live apps on your own computer, reviewed, then imported as optimized WebP: see [screenshots/README.md](screenshots/README.md). In short: `npm run screenshots:capture -- <app>`, check `screenshots/inbox/`, then `npm run screenshots:import`.
