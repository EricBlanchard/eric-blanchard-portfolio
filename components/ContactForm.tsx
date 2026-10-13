"use client";

// Client component: the form validates as you submit and sends from the browser through
// EmailJS. The SDK is only downloaded when someone actually sends a message.

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  LIMITS,
  isSpam,
  readEmailJsConfig,
  toTemplateParams,
  topics,
  validateContact,
  type ContactInput,
  type FieldErrors,
} from "@/lib/contact";

export type SendMessage = (params: Record<string, string>) => Promise<void>;

export class NotConfiguredError extends Error {
  constructor() {
    super("The contact form isn't connected to EmailJS yet.");
    this.name = "NotConfiguredError";
  }
}

/** Next.js only inlines NEXT_PUBLIC_ values that are referenced literally. */
const config = readEmailJsConfig({
  NEXT_PUBLIC_EMAILJS_SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
  NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
  NEXT_PUBLIC_EMAILJS_PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
});

export const sendWithEmailJs: SendMessage = async (params) => {
  if (!config) throw new NotConfiguredError();
  const { default: emailjs } = await import("@emailjs/browser");
  await emailjs.send(config.serviceId, config.templateId, params, {
    publicKey: config.publicKey,
    blockHeadless: true,
    // One message per browser per 30 seconds.
    limitRate: { id: "contact", throttle: 30_000 },
  });
};

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; email: string }
  | { kind: "error"; notConfigured: boolean };

function readForm(form: HTMLFormElement): ContactInput {
  const data = new FormData(form);
  const get = (key: string) => String(data.get(key) ?? "");
  return {
    name: get("name"),
    email: get("email"),
    company: get("company"),
    topic: get("topic"),
    message: get("message"),
    website: get("website"),
  };
}

const fieldOrder = ["name", "email", "topic", "message"] as const;

const inputClass =
  "w-full rounded-md border-2 border-line bg-paper px-3 py-2.5 text-ink transition-colors hover:border-muted focus:border-spruce focus:outline-none aria-[invalid=true]:border-danger";

export interface ContactFormProps {
  /** Address shown as a fallback if sending fails. */
  email: string;
  /** Injected in stories and tests; defaults to EmailJS. */
  send?: SendMessage;
}

export function ContactForm({ email, send = sendWithEmailJs }: ContactFormProps) {
  const id = useId();
  const statusRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // Once the result has rendered, move focus to it so keyboard and screen reader users hear it.
  useEffect(() => {
    if (status.kind === "sent" || status.kind === "error") statusRef.current?.focus();
  }, [status]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "sending") return;
    const form = event.currentTarget;
    const input = readForm(form);
    const found = validateContact(input);
    setErrors(found);

    const firstInvalid = fieldOrder.find((key) => found[key]);
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setStatus({ kind: "sending" });
    try {
      // Bots that fill the hidden field get the same confirmation, and nothing is sent.
      if (!isSpam(input)) await send(toTemplateParams(input));
      form.reset();
      setStatus({ kind: "sent", email: input.email.trim() });
    } catch (error) {
      setStatus({ kind: "error", notConfigured: error instanceof NotConfiguredError });
    }
  }

  const describedBy = (key: keyof FieldErrors, hint?: string) =>
    [hint, errors[key] ? `${id}-${key}-error` : null].filter(Boolean).join(" ") || undefined;

  const fieldError = (key: keyof FieldErrors) =>
    errors[key] ? (
      <p id={`${id}-${key}-error`} className="mt-1.5 text-sm font-semibold text-danger">
        {errors[key]}
      </p>
    ) : null;

  if (status.kind === "sent") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="border-l-4 border-spruce bg-paper-sunk p-6 focus:outline-none"
      >
        <h2 className="display text-4xl">Message sent</h2>
        <p className="mt-3">
          Thanks. I&rsquo;ll reply to <strong>{status.email}</strong>.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="link mt-4 font-semibold"
        >
          Send another message
        </button>
      </div>
    );
  }

  const sending = status.kind === "sending";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-labelledby={`${id}-title`}
      className="flex flex-col gap-6"
    >
      <h2 id={`${id}-title`} className="sr-only">
        Send a message
      </h2>

      {status.kind === "error" && (
        <div
          ref={statusRef}
          tabIndex={-1}
          role="alert"
          className="border-l-4 border-danger bg-paper-sunk p-4 focus:outline-none"
        >
          <p className="font-semibold">Your message wasn&rsquo;t sent.</p>
          <p className="mt-1">
            {status.notConfigured
              ? "The form isn't connected yet. "
              : "Something went wrong on the way. Try again in a minute, or "}
            email me directly at{" "}
            <a className="link" href={`mailto:${email}`}>
              {email}
            </a>
            .
          </p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="mb-1.5 block font-semibold">
            Name
          </label>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            autoComplete="name"
            maxLength={LIMITS.name}
            required
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("name")}
            className={inputClass}
          />
          {fieldError("name")}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="mb-1.5 block font-semibold">
            Email
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            maxLength={LIMITS.email}
            required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy("email")}
            className={inputClass}
          />
          {fieldError("email")}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-company`} className="mb-1.5 block font-semibold">
            Company <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id={`${id}-company`}
            name="company"
            type="text"
            autoComplete="organization"
            maxLength={LIMITS.company}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${id}-topic`} className="mb-1.5 block font-semibold">
            What it&rsquo;s about
          </label>
          <select
            id={`${id}-topic`}
            name="topic"
            required
            defaultValue=""
            aria-invalid={errors.topic ? true : undefined}
            aria-describedby={describedBy("topic")}
            className={inputClass}
          >
            <option value="" disabled>
              Choose one
            </option>
            {topics.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {fieldError("topic")}
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-message`} className="mb-1.5 block font-semibold">
          Message
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={7}
          maxLength={LIMITS.message}
          required
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy("message")}
          className={`${inputClass} resize-y`}
        />
        {fieldError("message")}
      </div>

      {/* Honeypot. Off-screen rather than display:none, which some bots skip. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Leave this field empty</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          aria-disabled={sending || undefined}
          className="inline-flex min-h-11 items-center rounded-full border-2 border-ink bg-ink px-6 py-2 font-semibold text-paper transition-colors hover:border-spruce hover:bg-spruce aria-disabled:cursor-wait aria-disabled:opacity-70"
        >
          {sending ? "Sending…" : "Send message"}
        </button>
        <p className="text-sm text-muted">Your message goes straight to my inbox.</p>
      </div>
    </form>
  );
}
