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
          "The hero map: generated terrain with a solar array, rendered as server-side SVG. The reveal is pure CSS and switches off under reduced motion.",
      },
    },
  },
} satisfies Meta<typeof HexField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector("svg");
    await expect(svg).toHaveAttribute("aria-hidden", "true");
    await expect(canvasElement.querySelectorAll('[data-kind="panel"]').length).toBeGreaterThan(0);
  },
};

export const Small: Story = { args: { cols: 6, rows: 5, seed: 42 } };

export const Still: Story = {
  args: { animate: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".hex-still")).not.toBeNull();
  },
};
