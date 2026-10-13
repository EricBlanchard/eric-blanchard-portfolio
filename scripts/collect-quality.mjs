#!/usr/bin/env node
/**
 * Gathers the reports produced by the pipeline into generated/quality.json,
 * which the site renders on /engineering and in the pipeline section.
 * Missing reports are recorded as null so a partial run never breaks the build.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function readJson(path) {
  const full = join(root, path);
  if (!existsSync(full)) {
    console.warn(`collect-quality: ${path} not found, skipping`);
    return null;
  }
  return JSON.parse(readFileSync(full, "utf8"));
}

function round(n, digits = 1) {
  return typeof n === "number" ? Math.round(n * 10 ** digits) / 10 ** digits : null;
}

// Vitest: unit and story tests together.
const vitest = readJson("reports/vitest.json");
const unit = vitest
  ? {
      tests: vitest.numTotalTests,
      passed: vitest.numPassedTests,
      files: vitest.testResults?.length ?? null,
    }
  : { tests: null, passed: null, files: null };

// Coverage summary from v8.
const cov = readJson("coverage/coverage-summary.json")?.total;
const coverage = {
  lines: round(cov?.lines?.pct),
  statements: round(cov?.statements?.pct),
  functions: round(cov?.functions?.pct),
  branches: round(cov?.branches?.pct),
};

// Storybook index: count stories (not docs pages) and the components they cover.
const sb = readJson("public/storybook/index.json");
const entries = sb ? Object.values(sb.entries ?? {}) : [];
const storyEntries = entries.filter((e) => e.type === "story");
const stories = sb
  ? {
      count: storyEntries.length,
      components: new Set(storyEntries.map((e) => e.title)).size,
    }
  : { count: null, components: null };

// Playwright.
const pw = readJson("reports/playwright.json");
const e2e = pw
  ? {
      tests: (pw.stats?.expected ?? 0) + (pw.stats?.unexpected ?? 0) + (pw.stats?.flaky ?? 0),
      passed: (pw.stats?.expected ?? 0) + (pw.stats?.flaky ?? 0),
    }
  : { tests: null, passed: null };

const a11yReport = readJson("reports/a11y.json");
const a11y = {
  pages: a11yReport?.pages ?? null,
  violations: a11yReport?.violations ?? null,
};

const perf = readJson("reports/perf.json");

// Lighthouse: use each page's representative (median) run, then the lowest page, so we never overstate.
let lighthouse = { performance: null, accessibility: null, bestPractices: null, seo: null };
const lhDir = join(root, "reports/lighthouse");
if (existsSync(lhDir)) {
  const manifest = readJson("reports/lighthouse/manifest.json");
  const all = manifest ?? [];
  const representative = all.filter((m) => m.isRepresentativeRun);
  const runs = (representative.length > 0 ? representative : all).map((m) => m.summary);
  if (runs.length > 0) {
    const min = (key) => Math.min(...runs.map((r) => r[key]).filter((v) => typeof v === "number"));
    lighthouse = {
      performance: min("performance"),
      accessibility: min("accessibility"),
      bestPractices: min("best-practices"),
      seo: min("seo"),
    };
  }
} else {
  console.warn("collect-quality: reports/lighthouse not found, skipping");
}

const server = process.env.GITHUB_SERVER_URL;
const repo = process.env.GITHUB_REPOSITORY;
const runId = process.env.GITHUB_RUN_ID;

const report = {
  generatedAt: new Date().toISOString(),
  commit: process.env.GITHUB_SHA ?? null,
  runUrl: server && repo && runId ? `${server}/${repo}/actions/runs/${runId}` : null,
  unit,
  coverage,
  stories,
  e2e,
  a11y,
  lighthouse,
  homeJsKb: perf?.homeJsKb ?? null,
};

writeFileSync(join(root, "generated/quality.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log("collect-quality: wrote generated/quality.json");
console.log(JSON.stringify(report, null, 2));
