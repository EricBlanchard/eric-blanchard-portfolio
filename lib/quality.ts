/**
 * The quality report shown on the site. It is written by scripts/collect-quality.mjs
 * from the CI run that builds the site, and validated here so a missing or partial
 * report degrades to "not measured" rather than breaking the build.
 */

export interface LighthouseScores {
  performance: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  seo: number | null;
}

export interface QualityReport {
  generatedAt: string | null;
  commit: string | null;
  runUrl: string | null;
  unit: { tests: number | null; passed: number | null; files: number | null };
  coverage: {
    lines: number | null;
    statements: number | null;
    functions: number | null;
    branches: number | null;
  };
  stories: { count: number | null; components: number | null };
  e2e: { tests: number | null; passed: number | null };
  a11y: { pages: number | null; violations: number | null };
  lighthouse: LighthouseScores;
  /** Compressed JavaScript transferred when loading the home page, in kB. */
  homeJsKb: number | null;
}

export const emptyReport: QualityReport = {
  generatedAt: null,
  commit: null,
  runUrl: null,
  unit: { tests: null, passed: null, files: null },
  coverage: { lines: null, statements: null, functions: null, branches: null },
  stories: { count: null, components: null },
  e2e: { tests: null, passed: null },
  a11y: { pages: null, violations: null },
  lighthouse: {
    performance: null,
    accessibility: null,
    bestPractices: null,
    seo: null,
  },
  homeJsKb: null,
};

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function obj(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

/** Accepts anything and returns a well-formed report, keeping only valid fields. */
export function parseQuality(raw: unknown): QualityReport {
  const r = obj(raw);
  const unit = obj(r.unit);
  const coverage = obj(r.coverage);
  const stories = obj(r.stories);
  const e2e = obj(r.e2e);
  const a11y = obj(r.a11y);
  const lh = obj(r.lighthouse);
  return {
    generatedAt: str(r.generatedAt),
    commit: str(r.commit),
    runUrl: str(r.runUrl),
    unit: {
      tests: num(unit.tests),
      passed: num(unit.passed),
      files: num(unit.files),
    },
    coverage: {
      lines: num(coverage.lines),
      statements: num(coverage.statements),
      functions: num(coverage.functions),
      branches: num(coverage.branches),
    },
    stories: { count: num(stories.count), components: num(stories.components) },
    e2e: { tests: num(e2e.tests), passed: num(e2e.passed) },
    a11y: { pages: num(a11y.pages), violations: num(a11y.violations) },
    lighthouse: {
      performance: num(lh.performance),
      accessibility: num(lh.accessibility),
      bestPractices: num(lh.bestPractices),
      seo: num(lh.seo),
    },
    homeJsKb: num(r.homeJsKb),
  };
}

/** Lighthouse reports 0–1; people read 0–100. */
export function formatScore(score: number | null): string {
  return score === null ? "–" : String(Math.round(score * 100));
}

export function formatPercent(value: number | null, digits = 0): string {
  return value === null ? "–" : `${value.toFixed(digits)}%`;
}

export function formatCount(value: number | null): string {
  return value === null ? "–" : value.toLocaleString("en-CA");
}

export function shortCommit(commit: string | null): string | null {
  return commit ? commit.slice(0, 7) : null;
}

export function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Toronto",
  });
}

/** True when every test that ran passed and at least one ran. */
export function allPassing(suite: { tests: number | null; passed: number | null }): boolean {
  return suite.tests !== null && suite.tests > 0 && suite.passed === suite.tests;
}
