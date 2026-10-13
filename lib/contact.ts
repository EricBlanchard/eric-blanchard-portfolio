/**
 * Contact form logic, kept free of React and of the EmailJS SDK so it can be unit tested.
 *
 * Mail is sent with EmailJS from the browser. The recipient address lives in the EmailJS
 * template ("To Email"), not in the page, so it can't be changed by a visitor.
 */

export const topics = [
  { value: "hiring", label: "A role I'm hiring for" },
  { value: "project", label: "A project for Deleptual" },
  { value: "other", label: "Something else" },
] as const;

export type Topic = (typeof topics)[number]["value"];

export interface ContactInput {
  name: string;
  email: string;
  company: string;
  topic: string;
  message: string;
  /** Honeypot: hidden from people, filled in by naive bots. */
  website: string;
}

export type FieldErrors = Partial<Record<"name" | "email" | "topic" | "message", string>>;

export const LIMITS = { name: 100, email: 254, company: 120, message: 5000, minMessage: 10 };

// Deliberately loose: the real check is whether a reply arrives.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(input: ContactInput): FieldErrors {
  const errors: FieldErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!name) errors.name = "Enter your name.";
  else if (name.length > LIMITS.name)
    errors.name = `Keep your name under ${LIMITS.name} characters.`;

  if (!email) errors.email = "Enter your email address so I can reply.";
  else if (email.length > LIMITS.email || !EMAIL.test(email))
    errors.email = "Enter an email address like name@example.com.";

  if (!topics.some((t) => t.value === input.topic)) errors.topic = "Choose what this is about.";

  if (!message) errors.message = "Write a message.";
  else if (message.length < LIMITS.minMessage)
    errors.message = `Write at least ${LIMITS.minMessage} characters.`;
  else if (message.length > LIMITS.message)
    errors.message = `Keep your message under ${LIMITS.message.toLocaleString("en-CA")} characters.`;

  return errors;
}

export function isSpam(input: ContactInput): boolean {
  return input.website.trim().length > 0;
}

/** The variables the EmailJS template uses: {{from_name}}, {{reply_to}} and so on. */
export function toTemplateParams(input: ContactInput): Record<string, string> {
  const topic = topics.find((t) => t.value === input.topic)?.label ?? input.topic;
  return {
    from_name: input.name.trim(),
    reply_to: input.email.trim(),
    company: input.company.trim() || "(not given)",
    topic,
    message: input.message.trim(),
  };
}

export interface EmailJsConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

/**
 * Reads the EmailJS settings. They are public by design (EmailJS restricts use by
 * allowed origin), and Next.js inlines NEXT_PUBLIC_ values at build time.
 */
export function readEmailJsConfig(env: Record<string, string | undefined>): EmailJsConfig | null {
  const serviceId = env.NEXT_PUBLIC_EMAILJS_SERVICE_ID?.trim();
  const templateId = env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID?.trim();
  const publicKey = env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?.trim();
  if (!serviceId || !templateId || !publicKey) return null;
  return { serviceId, templateId, publicKey };
}

export const emptyContact: ContactInput = {
  name: "",
  email: "",
  company: "",
  topic: "",
  message: "",
  website: "",
};
