import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { ButtonLink } from "./ButtonLink";

const meta = {
  title: "Controls/ButtonLink",
  component: ButtonLink,
  args: { href: "/engineering", children: "How this site is built" },
} satisfies Meta<typeof ButtonLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Quiet: Story = { args: { variant: "quiet" } };

export const External: Story = {
  args: { href: "https://github.com/EricBlanchard", children: "GitHub" },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: "GitHub" });
    await expect(link).toHaveAttribute("rel", "noopener");
  },
};

export const ForcedExternal: Story = {
  args: { href: "/storybook/index.html", external: true, children: "Component library" },
};
