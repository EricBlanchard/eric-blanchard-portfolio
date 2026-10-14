import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { ScreenshotGallery } from "./ScreenshotGallery";

const meta = {
  title: "Work/ScreenshotGallery",
  component: ScreenshotGallery,
  args: {
    shots: [
      {
        src: "/icon.svg",
        alt: "A desktop screen",
        width: 1440,
        height: 900,
        device: "desktop",
        caption: "Desktop shots get the full width.",
      },
      { src: "/icon.svg", alt: "A phone screen", width: 390, height: 844, device: "phone" },
      { src: "/icon.svg", alt: "Another phone screen", width: 390, height: 844, device: "phone" },
    ],
  },
} satisfies Meta<typeof ScreenshotGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopAndPhones: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("img")).toHaveLength(3);
    await expect(canvas.getByText("Desktop shots get the full width.")).toBeVisible();
    // Phones share a grid row; desktop shots don't.
    const phone = canvas.getByAltText("A phone screen").closest("figure")!;
    await expect(phone.parentElement?.className).toMatch(/grid/);
  },
};

export const PhonesOnly: Story = {
  args: {
    shots: [{ src: "/icon.svg", alt: "A phone screen", width: 390, height: 844, device: "phone" }],
  },
};

export const Empty: Story = {
  args: { shots: [] },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("figure")).toBeNull();
  },
};
