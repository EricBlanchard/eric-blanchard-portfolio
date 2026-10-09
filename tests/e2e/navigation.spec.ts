import { expect, test } from "@playwright/test";
import { allRoutes, projects } from "./routes";

test("home page introduces Eric and lists every project", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Eric Blanchard/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Eric\s*Blanchard/);
  const work = page.locator("#work").locator("xpath=ancestor::section");
  await expect(work.getByRole("article")).toHaveCount(projects.length);
});

test("every route renders one main heading and no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
  page.on("pageerror", (err) => errors.push(err.message));
  for (const route of allRoutes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }), route).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

test("a visitor can open a project from the index and move to the next one", async ({ page }) => {
  await page.goto("/");
  const first = projects[0]!;
  const second = projects[1]!;
  await page.getByRole("link", { name: first.title, exact: true }).click();
  await expect(page).toHaveURL(`/work/${first.slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(first.title);
  await page.getByRole("link", { name: new RegExp(`Next project\\s*${second.title}`) }).click();
  await expect(page).toHaveURL(`/work/${second.slug}`);
});

test("main navigation reaches each section", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  await nav.getByRole("link", { name: "Engineering" }).click();
  await expect(page).toHaveURL("/engineering");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Engineering");
  await nav.getByRole("link", { name: "Studio" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Deleptual");
  await nav.getByRole("link", { name: "Contact" }).click();
  await expect(page.getByRole("heading", { name: "Let’s talk" })).toBeInViewport();
});

test("keyboard users can skip straight to the content", async ({ page, isMobile }) => {
  test.skip(isMobile, "No hardware keyboard on the mobile profile");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("unknown pages return a real 404", async ({ page }) => {
  const response = await page.goto("/work/not-a-project");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Off the map" })).toBeVisible();
});

test("the page never scrolls sideways", async ({ page }) => {
  for (const route of allRoutes) {
    await page.goto(route);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, route).toBeLessThanOrEqual(0);
  }
});

test("the hero map stays still for people who prefer reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const animation = await page
    .locator(".hex-tile")
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(animation).toBe("none");
});
