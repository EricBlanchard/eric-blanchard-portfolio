import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { clientWork } from "@/content/clientWork";
import { ClientWork } from "./ClientWork";

const meta = {
  title: "Work/ClientWork",
  component: ClientWork,
  args: { engagements: clientWork },
} satisfies Meta<typeof ClientWork>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllClients: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("heading", { level: 3 })).toHaveLength(clientWork.length);
    await expect(canvas.getByRole("link", { name: "Book a walkthrough" })).toHaveAttribute(
      "href",
      "/contact",
    );
  },
};

export const OneLineEntry: Story = {
  args: { engagements: [{ client: "UHN", what: "Internal tools", detail: "", stack: [] }] },
  play: async ({ canvasElement }) => {
    // No description and no empty tag list for a one-line entry.
    await expect(within(canvasElement).queryByRole("list", { name: /technology/ })).toBeNull();
  },
};
