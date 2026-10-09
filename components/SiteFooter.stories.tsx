import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { emptyReport, measuredReport } from "@/lib/fixtures";
import { SiteFooter } from "./SiteFooter";

const meta = {
  title: "Layout/SiteFooter",
  component: SiteFooter,
  parameters: { layout: "fullscreen" },
  args: { quality: measuredReport },
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FromCI: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "3bc88c1" })).toBeVisible();
    await expect(canvas.getByText(/© 2026 Eric Blanchard/)).toBeVisible();
  },
};

export const LocalBuild: Story = {
  args: { quality: emptyReport },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/Local build/)).toBeVisible();
  },
};
