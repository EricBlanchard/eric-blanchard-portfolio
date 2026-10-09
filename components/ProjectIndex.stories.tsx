import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { projects } from "@/content/projects";
import { ProjectIndex } from "./ProjectIndex";

const meta = {
  title: "Work/ProjectIndex",
  component: ProjectIndex,
  args: { projects },
} satisfies Meta<typeof ProjectIndex>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllProjects: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole("article")).toHaveLength(projects.length);
  },
};

export const Empty: Story = {
  args: { projects: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Projects are on their way.")).toBeVisible();
  },
};
