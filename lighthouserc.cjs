/** Lighthouse CI: runs against the production build and enforces the budgets. */
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npx next start -p 3300",
      startServerReadyPattern: "Ready",
      url: [
        "http://localhost:3300/",
        "http://localhost:3300/engineering",
        "http://localhost:3300/work/step-contest",
      ],
      numberOfRuns: 3,
      chromePath: process.env.PW_CHROMIUM_PATH || undefined,
      settings: {
        chromeFlags: "--no-sandbox --headless=new",
        // Localhost is served over HTTP; this check is about the production host.
        skipAudits: ["is-on-https", "redirects-http"],
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        "total-byte-weight": ["error", { maxNumericValue: 400000 }],
        // Core Web Vitals "good" thresholds, under Lighthouse's throttled mobile profile.
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 200 }],
      },
    },
    upload: { target: "filesystem", outputDir: "reports/lighthouse" },
  },
};
