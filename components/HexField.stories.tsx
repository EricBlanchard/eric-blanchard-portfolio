import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { HexField } from "./HexField";

const meta = {
  title: "Brand/HexField",
  component: HexField,
  args: { className: "w-full max-w-md" },
  parameters: {
    docs: {
      description: {
        component:
          "The hero map: generated terrain with a solar array, rendered as server-side SVG. The map itself is static; a curtain and an amber panel layer reveal it using only transform and opacity, so the browser animates them off the main thread. Both are skipped under reduced motion.",
      },
    },
  },
} satisfies Meta<typeof HexField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const field = canvasElement.querySelector('[data-testid="hex-field"]');
    await expect(field).toHaveAttribute("aria-hidden", "true");
    await expect(canvasElement.querySelectorAll('[data-kind="panel"]').length).toBeGreaterThan(0);
    await expect(canvasElement.querySelector(".hex-curtain")).not.toBeNull();
  },
};

export const Small: Story = { args: { cols: 6, rows: 5, seed: 42 } };

export const Still: Story = {
  args: { animate: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".hex-curtain")).toBeNull();
    await expect(canvasElement.querySelector(".hex-charge")).toBeNull();
  },
};
