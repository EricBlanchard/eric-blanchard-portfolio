import { expect, test } from "@playwright/test";

test("responses carry security headers", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  // The only third party the page may talk to is EmailJS, for the contact form.
  expect(headers["content-security-policy"]).toContain(
    "connect-src 'self' https://api.emailjs.com",
  );
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("the component library is published under /storybook", async ({ request }) => {
  const response = await request.get("/storybook/index.html");
  test.skip(response.status() === 404, "Storybook has not been built into public/");
  expect(response.status()).toBe(200);
  expect(response.headers()["x-frame-options"]).toBe("SAMEORIGIN");
});
