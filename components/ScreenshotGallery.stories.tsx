import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { ScreenshotGallery } from "./ScreenshotGallery";

const meta = {
  title: "Work/ScreenshotGallery",
  component: ScreenshotGallery,
  args: {
    shots: [
      { src: "/icon.svg", alt: "The site icon", width: 64, height: 64, caption: "With a caption" },
      { src: "/icon.svg", alt: "The site icon again", width: 64, height: 64 },
    ],
  },
} satisfies Meta<typeof ScreenshotGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoShots: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole("img")).toHaveLength(2);
  },
};

export const Empty: Story = {
  args: { shots: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("figure")).toBeNull();
  },
};
