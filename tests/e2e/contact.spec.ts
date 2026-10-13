import { expect, test } from "@playwright/test";

// The verify build has no EmailJS keys (only the deploy job does), so the form
// reports that it isn't connected and offers the email address instead.

test("the contact page is reachable from the main navigation", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Contact" })
    .click();
  await expect(page).toHaveURL("/contact");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Contact");
});

test("the form explains what's missing and focuses the first problem", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Enter your name.")).toBeVisible();
  await expect(page.getByText("Enter your email address so I can reply.")).toBeVisible();
  await expect(page.getByLabel("Name")).toBeFocused();

  await page.getByLabel("Email").fill("not-an-email");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Enter an email address like name@example.com.")).toBeVisible();
});

test("without EmailJS keys, a valid message points to email instead", async ({ page }) => {
  const sent: string[] = [];
  page.on("request", (r) => r.url().includes("emailjs") && sent.push(r.url()));
  await page.goto("/contact");
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("What it’s about").selectOption("project");
  await page.getByLabel("Message", { exact: true }).fill("I need a web app built for our team.");
  await page.getByRole("button", { name: "Send message" }).click();

  const alert = page.getByRole("main").getByRole("alert");
  await expect(alert).toContainText("The form isn't connected yet.");
  await expect(alert.getByRole("link", { name: "eric.blanchard@deleptual.ca" })).toHaveAttribute(
    "href",
    "mailto:eric.blanchard@deleptual.ca",
  );
  expect(sent).toEqual([]);
});

test("the email address is listed for people who prefer their own mail app", async ({ page }) => {
  await page.goto("/contact");
  await expect(
    page.getByRole("main").getByRole("link", { name: "eric.blanchard@deleptual.ca" }).first(),
  ).toHaveAttribute("href", "mailto:eric.blanchard@deleptual.ca");
});
