#!/usr/bin/env node
/**
 * Runs Lighthouse against the production build and enforces the performance budgets.
 * Three runs per page. Each budget is checked against the median of that number across the
 * runs, as Lighthouse recommends, so one noisy run can't pass or fail a page on its own.
 * The median run (by performance score) is the report that gets published.
 * The CPU slowdown is calibrated to this machine first (lib/lighthouseCalibration.ts), so a
 * slow CI runner and a fast laptop measure the same simulated phone.
 * Writes reports/lighthouse/manifest.json for scripts/collect-quality.mjs.
 *
 * Usage: npm run build && npm run lighthouse
 */
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import { cpuSlowdownFor, medianOf } from "../lib/lighthouseCalibration.ts";

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

/** Middle value of a list of numbers; NaN if none are numbers. */
function middle(values) {
  const sorted = values.filter((v) => typeof v === "number").sort((a, b) => a - b);
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : Number.NaN;
}

function check(path, lhrs) {
  const failures = [];
  for (const [id, min] of Object.entries(BUDGETS.categories)) {
    const score = middle(lhrs.map((lhr) => lhr.categories[id]?.score));
    if (!(score >= min)) failures.push(`${path}: ${id} ${score} is below ${min}`);
  }
  for (const [id, max] of Object.entries(BUDGETS.audits)) {
    const value = middle(lhrs.map((lhr) => lhr.audits[id]?.numericValue));
    if (!(value <= max)) failures.push(`${path}: ${id} ${Math.round(value)} is over ${max}`);
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
async function measure(url, settings = {}, attempts = 3) {
  for (let attempt = 1; ; attempt++) {
    const result = await lighthouse(
      url,
      { port: chrome.port, output: "html", logLevel: "error" },
      { extends: "lighthouse:default", settings: { skipAudits: SKIP, ...settings } },
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

  // Calibrate: read this machine's benchmark index a few times and pick the CPU slowdown.
  const readings = [];
  for (let i = 0; i < 3; i++) {
    const run = await measure(ORIGIN, { onlyAudits: ["first-contentful-paint"] });
    readings.push(run.lhr.environment.benchmarkIndex);
  }
  const benchmarkIndex = Math.round(medianOf(readings));
  const cpuSlowdownMultiplier = cpuSlowdownFor(benchmarkIndex);
  const throttling = { cpuSlowdownMultiplier };
  console.log(
    `This machine's benchmark index is ${benchmarkIndex} (readings ${readings.map(Math.round).join(", ")}),` +
      ` so the CPU is slowed ${cpuSlowdownMultiplier}x (Lighthouse's default is 4x on a fast desktop).\n`,
  );

  mkdirSync(OUT, { recursive: true });
  const manifest = [];
  const failures = [];

  for (const path of PAGES) {
    const url = `${ORIGIN}${path}`;
    const runs = [];
    await fetch(url); // warm up
    for (let i = 0; i < RUNS; i++) runs.push(await measure(url, { throttling }));

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
        benchmarkIndex,
        cpuSlowdownMultiplier,
      });
    });

    const s = summarize(representative.lhr);
    console.log(
      `${path.padEnd(22)} performance ${Math.round(s.performance * 100)}  accessibility ${Math.round(s.accessibility * 100)}  best practices ${Math.round(s["best-practices"] * 100)}  SEO ${Math.round(s.seo * 100)}`,
    );
    failures.push(
      ...check(
        path,
        runs.map((run) => run.lhr),
      ),
    );
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
