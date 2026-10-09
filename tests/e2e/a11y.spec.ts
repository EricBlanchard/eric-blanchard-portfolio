import { writeFileSync, mkdirSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { allRoutes } from "./routes";

test.describe.configure({ mode: "serial" });

const results: Array<{ route: string; scheme: string; violations: number }> = [];

for (const scheme of ["light", "dark"] as const) {
  for (const route of allRoutes) {
    test(`${route} has no accessibility violations (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.goto(route);
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
        .analyze();
      results.push({ route, scheme, violations: violations.length });
      expect(
        violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
      ).toEqual([]);
    });
  }
}

test.afterAll(() => {
  mkdirSync("reports", { recursive: true });
  writeFileSync(
    "reports/a11y.json",
    JSON.stringify(
      {
        pages: new Set(results.map((r) => r.route)).size,
        violations: results.reduce((sum, r) => sum + r.violations, 0),
        results,
      },
      null,
      2,
    ),
  );
});
