#!/usr/bin/env node
/**
 * Runs Lighthouse against the production build and enforces the performance budgets.
 * Three runs per page; the median run (by performance score) is the one that counts.
 * Writes reports/lighthouse/manifest.json for scripts/collect-quality.mjs.
 *
 * Usage: npm run build && npm run lighthouse
 */
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";

const PORT = 3300;
const ORIGIN = `http://localhost:${PORT}`;
const PAGES = ["/", "/engineering", "/work/step-contest", "/contact"];
const RUNS = 3;
const OUT = "reports/lighthouse";

/** Category scores are 0–1. Metric budgets use Core Web Vitals "good" thresholds. */
const BUDGETS = {
  categories: { performance: 0.95, accessibility: 1, "best-practices": 0.95, seo: 0.95 },
  audits: {
    "largest-contentful-paint": 2500,
    "cumulative-layout-shift": 0.1,
    "total-blocking-time": 200,
    "total-byte-weight": 400_000,
  },
};

// Localhost is plain HTTP; these audits are about the production host.
const SKIP = ["is-on-https", "redirects-http"];

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // not up yet
    }
    await sleep(250);
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs / 1000}s`);
}

function summarize(lhr) {
  const summary = {};
  for (const [id, cat] of Object.entries(lhr.categories)) summary[id] = cat.score;
  return summary;
}

function median(runs) {
  const sorted = [...runs].sort(
    (a, b) => a.lhr.categories.performance.score - b.lhr.categories.performance.score,
  );
  return sorted[Math.floor(sorted.length / 2)];
}

function check(path, lhr) {
  const failures = [];
  for (const [id, min] of Object.entries(BUDGETS.categories)) {
    const score = lhr.categories[id]?.score;
    if (typeof score !== "number" || score < min)
      failures.push(`${path}: ${id} ${score} is below ${min}`);
  }
  for (const [id, max] of Object.entries(BUDGETS.audits)) {
    const value = lhr.audits[id]?.numericValue;
    if (typeof value !== "number" || value > max)
      failures.push(`${path}: ${id} ${Math.round(value)} is over ${max}`);
  }
  return failures;
}

async function assertPortFree() {
  try {
    await fetch(ORIGIN);
  } catch {
    return;
  }
  throw new Error(
    `Something is already listening on port ${PORT}. Stop it first, or Lighthouse would measure a stale build.`,
  );
}

/** Start `next start` directly (not through npx) so we own the process we stop. */
function startServer() {
  const nextBin = new URL("../node_modules/next/dist/bin/next", import.meta.url);
  return spawn(
    process.execPath,
    [nextBin.pathname.replace(/^\/([A-Za-z]:)/, "$1"), "start", "-p", String(PORT)],
    {
      stdio: "ignore",
      // Own process group on POSIX, so the whole tree can be stopped together.
      detached: process.platform !== "win32",
    },
  );
}

function stopServer(child) {
  if (child.exitCode !== null) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
  }
}

/** One Lighthouse run, retried when Chrome fails to record a trace (a known intermittent error). */
async function measure(url, attempts = 3) {
  for (let attempt = 1; ; attempt++) {
    const result = await lighthouse(
      url,
      { port: chrome.port, output: "html", logLevel: "error" },
      { extends: "lighthouse:default", settings: { skipAudits: SKIP } },
    );
    const error = result?.lhr?.runtimeError;
    if (result?.lhr && !error) return result;
    if (attempt >= attempts) throw new Error(`Lighthouse failed on ${url}: ${error?.message}`);
    console.warn(`Retrying ${url} after: ${error?.code ?? "no result"}`);
  }
}

await assertPortFree();
const server = startServer();
let chrome;

try {
  await waitForServer(ORIGIN);
  chrome = await chromeLauncher.launch({
    chromePath: process.env.PW_CHROMIUM_PATH || undefined,
    chromeFlags: ["--headless=new", "--no-sandbox"],
  });

  mkdirSync(OUT, { recursive: true });
  const manifest = [];
  const failures = [];

  for (const path of PAGES) {
    const url = `${ORIGIN}${path}`;
    const runs = [];
    await fetch(url); // warm up
    for (let i = 0; i < RUNS; i++) runs.push(await measure(url));

    const representative = median(runs);
    const slug = path === "/" ? "home" : path.slice(1).replaceAll("/", "-");
    runs.forEach((run, i) => {
      const isRepresentativeRun = run === representative;
      const base = `${OUT}/${slug}-${i + 1}`;
      writeFileSync(`${base}.html`, run.report);
      writeFileSync(`${base}.json`, JSON.stringify(run.lhr));
      manifest.push({
        url,
        isRepresentativeRun,
        htmlPath: `${base}.html`,
        jsonPath: `${base}.json`,
        summary: summarize(run.lhr),
      });
    });

    const s = summarize(representative.lhr);
    console.log(
      `${path.padEnd(22)} performance ${Math.round(s.performance * 100)}  accessibility ${Math.round(s.accessibility * 100)}  best practices ${Math.round(s["best-practices"] * 100)}  SEO ${Math.round(s.seo * 100)}`,
    );
    failures.push(...check(path, representative.lhr));
  }

  writeFileSync(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 2));

  if (failures.length > 0) {
    console.error("\nLighthouse budgets failed:");
    for (const f of failures) console.error(`  ${f}`);
    process.exitCode = 1;
  } else {
    console.log("\nAll Lighthouse budgets met.");
  }
} finally {
  await chrome?.kill();
  stopServer(server);
}
