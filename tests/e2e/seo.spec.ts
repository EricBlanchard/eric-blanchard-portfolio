import { expect, test } from "@playwright/test";
import { allRoutes, projectRoutes } from "./routes";

test("every page has a unique title and a description", async ({ page }) => {
  const titles = new Set<string>();
  for (const route of allRoutes) {
    await page.goto(route);
    const title = await page.title();
    expect(titles.has(title), `duplicate title on ${route}`).toBe(false);
    titles.add(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{40,}/);
  }
});

test("the document declares Canadian English", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en-CA");
});

test("sitemap lists every page", async ({ request }) => {
  const body = await (await request.get("/sitemap.xml")).text();
  for (const route of projectRoutes) expect(body).toContain(route);
  expect(body).toContain("/engineering");
});

test("robots.txt allows crawling and points at the sitemap", async ({ request }) => {
  const body = await (await request.get("/robots.txt")).text();
  expect(body).toMatch(/Allow: \//);
  expect(body).toMatch(/Sitemap: .*\/sitemap\.xml/);
});

test("the social preview image renders", async ({ request }) => {
  const response = await request.get("/opengraph-image");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
});
