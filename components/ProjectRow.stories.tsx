import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { projects } from "@/content/projects";
import { ProjectRow } from "./ProjectRow";

const meta = {
  title: "Work/ProjectRow",
  component: ProjectRow,
  args: { project: projects[1]! },
} satisfies Meta<typeof ProjectRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const link = within(canvasElement).getByRole("link", { name: args.project.title });
    await expect(link).toHaveAttribute("href", `/work/${args.project.slug}`);
  },
};

export const LongTitle: Story = { args: { project: projects[0]! } };
