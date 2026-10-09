import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Container } from "./Container";

const meta = {
  title: "Layout/Container",
  component: Container,
  parameters: { layout: "fullscreen" },
  args: {
    children: (
      <p className="bg-paper-sunk p-4">
        Content is centred, capped at 78rem, with a 16px gutter on phones.
      </p>
    ),
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithExtraClasses: Story = { args: { className: "py-10" } };
