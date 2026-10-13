import { afterEach, describe, expect, it, vi } from "vitest";

const send = vi.fn(async () => ({ status: 200, text: "OK" }));
vi.mock("@emailjs/browser", () => ({ default: { send } }));

async function loadWithEnv(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return import("./ContactForm");
}

afterEach(() => {
  vi.unstubAllEnvs();
  send.mockClear();
});

describe("sendWithEmailJs", () => {
  it("refuses to send when EmailJS isn't configured", async () => {
    const { sendWithEmailJs, NotConfiguredError } = await loadWithEnv({
      NEXT_PUBLIC_EMAILJS_SERVICE_ID: "",
      NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: "",
      NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: "",
    });
    await expect(sendWithEmailJs({ message: "hi" })).rejects.toBeInstanceOf(NotConfiguredError);
    expect(send).not.toHaveBeenCalled();
  });

  it("sends through EmailJS with rate limiting and headless blocking", async () => {
    const { sendWithEmailJs } = await loadWithEnv({
      NEXT_PUBLIC_EMAILJS_SERVICE_ID: "service_abc",
      NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: "template_xyz",
      NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: "key123",
    });
    await sendWithEmailJs({ from_name: "Ada" });
    expect(send).toHaveBeenCalledWith(
      "service_abc",
      "template_xyz",
      { from_name: "Ada" },
      { publicKey: "key123", blockHeadless: true, limitRate: { id: "contact", throttle: 30_000 } },
    );
  });

  it("passes EmailJS failures up to the form", async () => {
    send.mockRejectedValueOnce(new Error("429 Too Many Requests"));
    const { sendWithEmailJs } = await loadWithEnv({
      NEXT_PUBLIC_EMAILJS_SERVICE_ID: "s",
      NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: "t",
      NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: "k",
    });
    await expect(sendWithEmailJs({})).rejects.toThrow("429");
  });
});
