import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3200);
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["json", { outputFile: "reports/playwright.json" }],
    ["html", { outputFolder: "reports/playwright", open: "never" }],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${port}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], launchOptions: { executablePath } },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], launchOptions: { executablePath } },
      // Layout and navigation matter on phones; the heavier audits run once on desktop.
      testIgnore: [
        "**/a11y.spec.ts",
        "**/performance.spec.ts",
        "**/seo.spec.ts",
        "**/security.spec.ts",
      ],
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npx next start -p ${port}`,
        port,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
