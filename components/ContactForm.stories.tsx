import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ContactForm, NotConfiguredError } from "./ContactForm";

const meta = {
  title: "Contact/ContactForm",
  component: ContactForm,
  args: {
    email: "eric.blanchard@deleptual.ca",
    send: fn(async () => {}),
  },
  parameters: {
    docs: {
      description: {
        component:
          "Sends through EmailJS from the browser. The SDK loads only when someone sends. In stories, sending is replaced with a mock.",
      },
    },
  },
} satisfies Meta<typeof ContactForm>;

export default meta;
type Story = StoryObj<typeof meta>;

async function fillValid(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByLabelText("Name"), "Ada Lovelace");
  await userEvent.type(canvas.getByLabelText("Email"), "ada@example.com");
  await userEvent.type(canvas.getByLabelText(/Company/), "Analytical Engines");
  await userEvent.selectOptions(canvas.getByLabelText("What it’s about"), "hiring");
  await userEvent.type(canvas.getByLabelText("Message"), "We have a remote role you might like.");
}

export const Empty: Story = {};

export const ShowsErrors: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await expect(canvas.getByText("Enter your name.")).toBeVisible();
    await expect(canvas.getByText("Choose what this is about.")).toBeVisible();
    // Focus moves to the first problem, and the error is tied to its field.
    const name = canvas.getByLabelText("Name");
    await expect(name).toHaveFocus();
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toHaveAccessibleDescription("Enter your name.");
    await expect(args.send).not.toHaveBeenCalled();
  },
};

export const Sent: Story = {
  play: async ({ canvasElement, args }) => {
    await fillValid(canvasElement);
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await expect(await canvas.findByRole("status")).toHaveTextContent(
      "I’ll reply to ada@example.com",
    );
    await expect(args.send).toHaveBeenCalledWith({
      from_name: "Ada Lovelace",
      reply_to: "ada@example.com",
      company: "Analytical Engines",
      topic: "A role I'm hiring for",
      message: "We have a remote role you might like.",
    });
    await waitFor(() => expect(canvas.getByRole("status")).toHaveFocus());
    await userEvent.click(canvas.getByRole("button", { name: "Send another message" }));
    await expect(canvas.getByLabelText("Name")).toHaveValue("");
  },
};

export const SendFails: Story = {
  args: { send: fn(async () => Promise.reject(new Error("Network down"))) },
  play: async ({ canvasElement }) => {
    await fillValid(canvasElement);
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    const alert = await canvas.findByRole("alert");
    await expect(alert).toHaveTextContent("Your message wasn’t sent.");
    await expect(alert).toHaveTextContent("Try again in a minute");
    await expect(within(alert).getByRole("link")).toHaveAttribute(
      "href",
      "mailto:eric.blanchard@deleptual.ca",
    );
    // What they typed is kept so they can try again.
    await expect(canvas.getByLabelText("Name")).toHaveValue("Ada Lovelace");
  },
};

export const NotConnected: Story = {
  args: { send: fn(async () => Promise.reject(new NotConfiguredError())) },
  play: async ({ canvasElement }) => {
    await fillValid(canvasElement);
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "The form isn't connected yet.",
    );
  },
};

export const IgnoresBots: Story = {
  play: async ({ canvasElement, args }) => {
    await fillValid(canvasElement);
    const honeypot = canvasElement.querySelector<HTMLInputElement>('input[name="website"]')!;
    await userEvent.type(honeypot, "http://spam.example");
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await expect(await canvas.findByRole("status")).toBeVisible();
    await expect(args.send).not.toHaveBeenCalled();
  },
};

export const Sending: Story = {
  args: { send: fn(() => new Promise<void>(() => {})) },
  play: async ({ canvasElement, args }) => {
    await fillValid(canvasElement);
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Send message" });
    await userEvent.click(button);
    await expect(await canvas.findByRole("button", { name: "Sending…" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    // A second click while sending does nothing.
    await userEvent.click(canvas.getByRole("button", { name: "Sending…" }));
    await expect(args.send).toHaveBeenCalledTimes(1);
  },
};
