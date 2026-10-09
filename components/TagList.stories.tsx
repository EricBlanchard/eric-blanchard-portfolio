import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { TagList } from "./TagList";

const meta = {
  title: "Content/TagList",
  component: TagList,
  args: { label: "Technology", items: ["Next.js 16", "TypeScript", "Firestore", "Netlify"] },
} satisfies Meta<typeof TagList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole("list", { name: "Technology" });
    await expect(within(list).getAllByRole("listitem")).toHaveLength(4);
  },
};
