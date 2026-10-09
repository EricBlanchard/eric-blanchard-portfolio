import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { emptyReport, measuredReport } from "@/lib/fixtures";
import { Pipeline } from "./Pipeline";

const meta = {
  title: "Engineering/Pipeline",
  component: Pipeline,
  args: { quality: measuredReport },
} satisfies Meta<typeof Pipeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Measured: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("listitem")).toHaveLength(8);
    await expect(canvas.getByText("128 tests, 97% line coverage")).toBeVisible();
    await expect(canvas.getByText("Live build 3bc88c1")).toBeVisible();
  },
};

export const NotMeasuredYet: Story = {
  args: { quality: emptyReport },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText(/line coverage/)).toBeNull();
  },
};
