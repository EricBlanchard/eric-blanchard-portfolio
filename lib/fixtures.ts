import type { QualityReport } from "./quality";
import { emptyReport } from "./quality";

/** A fully measured report, for stories and tests. */
export const measuredReport: QualityReport = {
  generatedAt: "2026-10-09T14:00:00.000Z",
  commit: "3bc88c1a9e0f4d2b7c6e5a4f3d2c1b0a99887766",
  runUrl: "https://github.com/EricBlanchard/eric-blanchard-portfolio/actions/runs/1",
  unit: { tests: 128, passed: 128, files: 14 },
  coverage: { lines: 97.4, statements: 96.8, functions: 95.2, branches: 91.1 },
  stories: { count: 34, components: 13 },
  e2e: { tests: 42, passed: 42 },
  a11y: { pages: 9, violations: 0 },
  lighthouse: { performance: 1, accessibility: 1, bestPractices: 1, seo: 1 },
  homeJsKb: 96.3,
};

export { emptyReport };
