import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SectionHeading } from "./SectionHeading";

const meta = {
  title: "Layout/SectionHeading",
  component: SectionHeading,
  args: { id: "work", title: "Selected work" },
} satisfies Meta<typeof SectionHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithIntro: Story = {
  args: { children: <p>Each project links to a write-up of the decisions behind it.</p> },
};

export const TitleOnly: Story = {};
