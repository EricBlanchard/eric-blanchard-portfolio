# Screenshots

Project screenshots are captured on your own computer, reviewed by you, then imported. Nothing is published until you import it and push.

```
shots.json  →  npm run screenshots:capture  →  screenshots/inbox/  →  you review  →  npm run screenshots:import  →  public/work/
```

## One-time setup

```bash
npm install
npx playwright install chromium   # only needed if Google Chrome isn't installed
```

The capture script prefers your installed Google Chrome, because Google sign-in tends to refuse Playwright's own browser.

## Capturing

1. Fill in `baseUrl` (and any `vars`) for the app in `shots.json`.
2. Run `npm run screenshots:capture -- <app>`, for example `npm run screenshots:capture -- daric`.
   - For apps with `"signIn": true`, a Chrome window opens on the first run. Sign in there, then press Enter in the terminal. The sign-in is kept in `.screenshots/profiles/` (git-ignored); use `--login` to sign in again.
   - Leave the window alone while it works. It opens each page at a fixed size (desktop 1440×900, phone 390×844, at 2x) and saves `screenshots/inbox/<app>/<file>.png`.
3. Look through every image in `screenshots/inbox/`. Delete anything you wouldn't want public.

Running it without an app name captures every app that has a `baseUrl`.

For dashboards, capture panels rather than screens: give a shot a `section` (the panel's heading) and the image is cropped to that panel, scrolled into view, so it shows the data instead of the page header. Fleet Pulse's shots all work this way.

## Keeping real people out of screenshots

Daric, the step contest and the studio simulator hold real people's data. In order of preference:

1. **Use demo data.** A demo contest, a demo game instance, a list with nothing personal on it.
2. **Swap names.** Create `screenshots/redactions.local.json` (git-ignored, so the real names never reach the repository):

   ```json
   {
     "*": { "Eric Blanchard": "Alex Rivera", "Eric": "Alex", "Blanchard": "Rivera" },
     "step-contest": { "Jordan Smith": "Sam Lee", "Jordan": "Sam", "Smith": "Lee" }
   }
   ```

   Names are swapped in the page before each capture: in text, form fields, tooltips and labels. List first names and surnames separately as well as full names, since a page often splits a name across lines or elements. Avatars and photos are not changed.

3. **Leave the screen out.** The shot list already skips Daric's People and Weight modules and every signed-in studio simulator page.

## Taking screenshots by hand

For Unity (Hexploration) or anything the script can't reach, save PNGs into `screenshots/inbox/<app>/` using the `file` names in `shots.json`, and write the `alt` text for each.

## Importing

```bash
npm run screenshots:import
```

This converts each inbox image into an optimized WebP in `public/work/<app>/` (at most 2400 px wide for desktop, 780 px for phone), strips image metadata, and updates `content/screenshots.generated.ts`. Project pages pick the images up from there, in the order of `shots.json`: desktop shots full width, phone shots side by side.

A shot without alt text is not imported; the command says which ones. Once imported, the inbox can be emptied. Re-running the import keeps what's already in `public/work/`, and removes images for shots that have been taken out of `shots.json`.

## Adding a shot

Add an entry to the app's `shots` in `shots.json`:

| Field      | Meaning                                                                                             |
| ---------- | --------------------------------------------------------------------------------------------------- |
| `file`     | Output name: lowercase letters, numbers and hyphens                                                 |
| `path`     | Page to open, starting with `/`. `{name}` is filled from the app's `vars`                           |
| `device`   | `desktop` or `phone`                                                                                |
| `alt`      | What the image shows, for people who can't see it. Required                                         |
| `caption`  | Optional line under the image                                                                       |
| `section`  | Capture one panel instead of the screen: the section with this heading or label, e.g. `"Fleet map"` |
| `width`    | Window width in CSS px, when a panel's table needs more room than 1440                              |
| `fullPage` | Capture the whole scrolling page                                                                    |
| `click`    | A CSS selector to click first, e.g. to open the first item in a list                                |

A unit test checks the shot list on every run of `npm test`.
