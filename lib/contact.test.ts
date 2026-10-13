import { describe, expect, it } from "vitest";
import {
  LIMITS,
  emptyContact,
  isSpam,
  readEmailJsConfig,
  toTemplateParams,
  validateContact,
  type ContactInput,
} from "./contact";

const valid: ContactInput = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  topic: "hiring",
  message: "We have a remote role you might like.",
  website: "",
};

describe("validateContact", () => {
  it("accepts a complete message", () => {
    expect(validateContact(valid)).toEqual({});
  });

  it("asks for every required field when the form is empty", () => {
    expect(Object.keys(validateContact(emptyContact)).sort()).toEqual([
      "email",
      "message",
      "name",
      "topic",
    ]);
  });

  it("treats whitespace as empty", () => {
    const errors = validateContact({ ...valid, name: "   ", message: "  \n " });
    expect(errors.name).toBe("Enter your name.");
    expect(errors.message).toBe("Write a message.");
  });

  it.each(["ada", "ada@", "ada@example", "ada @example.com", "@example.com"])(
    "rejects the malformed email %s",
    (email) => {
      expect(validateContact({ ...valid, email }).email).toMatch(/like name@example.com/);
    },
  );

  it("only accepts the listed topics", () => {
    expect(validateContact({ ...valid, topic: "spam" }).topic).toBe("Choose what this is about.");
  });

  it("enforces message and name lengths", () => {
    expect(validateContact({ ...valid, message: "Hi" }).message).toMatch(/at least 10/);
    expect(validateContact({ ...valid, message: "x".repeat(LIMITS.message + 1) }).message).toMatch(
      /under 5,000/,
    );
    expect(validateContact({ ...valid, name: "x".repeat(LIMITS.name + 1) }).name).toMatch(
      /under 100/,
    );
    expect(
      validateContact({ ...valid, email: `${"x".repeat(250)}@example.com` }).email,
    ).toBeDefined();
  });
});

describe("isSpam", () => {
  it("flags submissions that fill the hidden field", () => {
    expect(isSpam(valid)).toBe(false);
    expect(isSpam({ ...valid, website: "http://spam.example" })).toBe(true);
  });
});

describe("toTemplateParams", () => {
  it("maps the form to the EmailJS template variables, trimmed", () => {
    expect(toTemplateParams({ ...valid, name: "  Ada Lovelace " })).toEqual({
      from_name: "Ada Lovelace",
      reply_to: "ada@example.com",
      company: "Analytical Engines",
      topic: "A role I'm hiring for",
      message: "We have a remote role you might like.",
    });
  });

  it("marks a missing company and passes unknown topics through", () => {
    const params = toTemplateParams({ ...valid, company: " ", topic: "custom" });
    expect(params.company).toBe("(not given)");
    expect(params.topic).toBe("custom");
  });
});

describe("readEmailJsConfig", () => {
  const env = {
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: "service_abc",
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: "template_xyz",
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: " key123 ",
  };

  it("returns the config when all three values are set", () => {
    expect(readEmailJsConfig(env)).toEqual({
      serviceId: "service_abc",
      templateId: "template_xyz",
      publicKey: "key123",
    });
  });

  it("returns null when any value is missing or blank", () => {
    expect(readEmailJsConfig({})).toBeNull();
    expect(readEmailJsConfig({ ...env, NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: "" })).toBeNull();
    expect(readEmailJsConfig({ ...env, NEXT_PUBLIC_EMAILJS_SERVICE_ID: undefined })).toBeNull();
  });
});
