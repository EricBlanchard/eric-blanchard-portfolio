#!/usr/bin/env node
/**
 * Captures the shots in screenshots/shots.json into screenshots/inbox/<slug>/.
 * Runs on your own computer, in a real Chrome window, so you can sign in where needed.
 *
 *   npm run screenshots:capture                   every app that has a baseUrl
 *   npm run screenshots:capture -- daric          one app
 *   npm run screenshots:capture -- daric --login  sign in again first
 *
 * Sign-ins are kept per app in .screenshots/profiles/ (git-ignored). Real names listed in
 * screenshots/redactions.local.json (git-ignored) are swapped for demo names in the page
 * before each capture, so they never reach an image.
 */
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import { chromium, type BrowserContext } from "playwright";
import {
  VIEWPORTS,
  redactionPairs,
  viewportFor,
  resolvePath,
  shotListProblems,
  shotUrl,
  type ShotList,
} from "../../lib/screenshots.ts";

const list = JSON.parse(readFileSync("screenshots/shots.json", "utf8")) as ShotList;
const problems = shotListProblems(list);
if (problems.length > 0) {
  console.error("screenshots/shots.json has problems:\n  " + problems.join("\n  "));
  process.exit(1);
}

const args = process.argv.slice(2);
const forceLogin = args.includes("--login");
const requested = args.filter((a) => !a.startsWith("--"));
const slugs = requested.length > 0 ? requested : Object.keys(list.apps);

/** { "<slug>": { "Real Name": "Demo Name" }, "*": { ... } } */
const redactionsFile = join("screenshots", "redactions.local.json");
const redactions: Record<string, Record<string, string>> = existsSync(redactionsFile)
  ? JSON.parse(readFileSync(redactionsFile, "utf8"))
  : {};

async function launch(profile: string): Promise<BrowserContext> {
  const options = {
    headless: process.env.CAPTURE_HEADLESS === "1",
    viewport: VIEWPORTS.desktop,
    deviceScaleFactor: 2,
    // Google sign-in refuses windows that announce automation.
    ignoreDefaultArgs: ["--enable-automation"],
    args: ["--disable-blink-features=AutomationControlled"],
  };
  try {
    return await chromium.launchPersistentContext(profile, { ...options, channel: "chrome" });
  } catch {
    console.warn(
      "  Google Chrome wasn't found, so using Playwright's Chromium (npx playwright install chromium).\n" +
        "  Google sign-in may refuse it; if so, install Chrome or take those shots by hand.",
    );
    return chromium.launchPersistentContext(profile, {
      ...options,
      executablePath: process.env.PW_CHROMIUM_PATH || undefined,
    });
  }
}

/**
 * Runs in the page (so it can't import anything): swaps names in text, form values and
 * labels. Mirrors applyRedactions in lib/screenshots.ts; the pairs arrive longest first.
 */
function swapNames(pairs: Array<[string, string]>) {
  const swap = (text: string) => pairs.reduce((t, [from, to]) => t.split(from).join(to), text);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeValue) node.nodeValue = swap(node.nodeValue);
  }
  for (const el of document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    "input, textarea",
  )) {
    el.value = swap(el.value);
  }
  for (const el of document.querySelectorAll<HTMLElement>("[title], [aria-label], [alt]")) {
    for (const attr of ["title", "aria-label", "alt"]) {
      const value = el.getAttribute(attr);
      if (value) el.setAttribute(attr, swap(value));
    }
  }
}

const prompt = createInterface({ input: process.stdin, output: process.stdout });
let captured = 0;
let failed = 0;

for (const slug of slugs) {
  const app = list.apps[slug];
  if (!app) {
    console.error(`No app called "${slug}" in screenshots/shots.json.`);
    failed++;
    continue;
  }
  if (app.manual) {
    console.log(`\n${slug}: taken by hand. ${app.note ?? ""}`);
    continue;
  }
  if (!app.baseUrl.trim()) {
    console.log(`\n${slug}: skipped. Set its baseUrl in screenshots/shots.json first.`);
    continue;
  }

  console.log(`\n${slug}`);
  const profile = join(".screenshots", "profiles", slug);
  const firstRun = !existsSync(profile);
  const context = await launch(profile);
  const outDir = join("screenshots", "inbox", slug);
  mkdirSync(outDir, { recursive: true });

  if (app.signIn && (forceLogin || firstRun)) {
    const page = context.pages()[0] ?? (await context.newPage());
    await page.goto(app.baseUrl);
    await prompt.question(`  Sign in to ${slug} in the browser window, then press Enter here. `);
  }

  const pairs = redactionPairs({ ...redactions["*"], ...redactions[slug] });

  for (const shot of app.shots) {
    const target = join(outDir, `${shot.file}.png`);
    const page = await context.newPage();
    try {
      const url = shotUrl(app.baseUrl, resolvePath(shot.path ?? "/", app.vars));
      await page.setViewportSize(viewportFor(shot));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
      if (shot.click) {
        await page.locator(shot.click).first().click();
        await page.waitForLoadState("networkidle");
      }
      // Let realtime data, images and fonts settle.
      await page.waitForTimeout(1500);
      if (pairs.length > 0) await page.evaluate(swapNames, pairs);
      if (shot.section) {
        // One panel: the region named by its heading or aria-label.
        const panel = page.getByRole("region", { name: shot.section, exact: true }).first();
        await panel.waitFor({ state: "visible", timeout: 20_000 }).catch(() => {
          throw new Error(
            `no panel named "${shot.section}" on ${url}. Check the heading text in shots.json.`,
          );
        });
        await panel.scrollIntoViewIfNeeded();
        await page.waitForTimeout(800); // charts and map tiles finish drawing
        // Sticky headers and banners would be painted over a tall panel; hide everything
        // fixed or sticky outside it. Then report any table still too wide for the panel.
        const clipped = await panel.evaluate((target) => {
          for (const el of document.body.querySelectorAll<HTMLElement>("*")) {
            const { position } = getComputedStyle(el);
            if ((position === "fixed" || position === "sticky") && !target.contains(el)) {
              el.style.setProperty("visibility", "hidden", "important");
            }
          }
          return [...target.querySelectorAll<HTMLElement>("*")].filter((el) => {
            const { overflowX } = getComputedStyle(el);
            return (
              (overflowX === "auto" || overflowX === "scroll") &&
              el.scrollWidth > el.clientWidth + 1
            );
          }).length;
        });
        if (clipped > 0) {
          console.warn(
            `  warning ${shot.file}: ${clipped} table(s) are wider than the panel and will be cut off.` +
              ` Give this shot a larger "width" in shots.json.`,
          );
        }
        await panel.screenshot({ path: target, animations: "disabled" });
      } else {
        await page.screenshot({
          path: target,
          fullPage: shot.fullPage ?? false,
          animations: "disabled",
        });
      }
      console.log(`  captured ${shot.file}`);
      captured++;
    } catch (error) {
      console.error(`  failed ${shot.file}: ${(error as Error).message.split("\n")[0]}`);
      failed++;
    } finally {
      await page.close();
    }
  }
  await context.close();
}

prompt.close();
console.log(
  `\n${captured} captured, ${failed} failed. Look through screenshots/inbox/ before importing,` +
    `\nand delete anything you wouldn't want public. Then run: npm run screenshots:import`,
);
process.exitCode = failed > 0 ? 1 : 0;
