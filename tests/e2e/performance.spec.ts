import { mkdirSync, writeFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

/** Compressed JavaScript allowed on the home page. */
const JS_BUDGET_KB = 150;

test("the home page stays inside its JavaScript budget", async ({ page, baseURL }) => {
  const scripts: Array<{ url: string; bytes: number }> = [];
  page.on("requestfinished", async (request) => {
    if (request.resourceType() !== "script") return;
    const sizes = await request.sizes();
    scripts.push({ url: request.url(), bytes: sizes.responseBodySize });
  });
  await page.goto("/", { waitUntil: "networkidle" });
  const totalKb = scripts.reduce((sum, s) => sum + s.bytes, 0) / 1024;

  mkdirSync("reports", { recursive: true });
  writeFileSync(
    "reports/perf.json",
    JSON.stringify({ homeJsKb: Math.round(totalKb * 10) / 10, baseURL, scripts }, null, 2),
  );
  expect(totalKb).toBeLessThan(JS_BUDGET_KB);
});

test("pages make no third-party requests", async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const foreign: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.protocol.startsWith("http") && url.origin !== origin) foreign.push(request.url());
  });
  for (const route of ["/", "/engineering", "/work/step-contest"]) {
    await page.goto(route, { waitUntil: "networkidle" });
  }
  expect(foreign).toEqual([]);
});

test("fonts are self-hosted and preloaded", async ({ page }) => {
  await page.goto("/");
  const preloads = await page
    .locator('link[rel="preload"][as="font"]')
    .evaluateAll((links) => links.map((l) => l.getAttribute("href")));
  expect(preloads.length).toBeGreaterThanOrEqual(2);
  for (const href of preloads) expect(href).toMatch(/^\/_next\//);
});
