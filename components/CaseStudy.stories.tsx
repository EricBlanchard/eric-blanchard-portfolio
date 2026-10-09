import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { getProject } from "@/content/projects";
import { CaseStudy } from "./CaseStudy";

const stepContest = getProject("step-contest")!;

const meta = {
  title: "Work/CaseStudy",
  component: CaseStudy,
  args: { blocks: stepContest.caseStudy },
} satisfies Meta<typeof CaseStudy>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllBlockTypes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("table")).toBeVisible();
    await expect(canvas.getByRole("rowheader", { name: "Site admin" })).toBeVisible();
    await expect(canvas.getByRole("heading", { name: "The leaderboard" })).toHaveAttribute(
      "id",
      "the-leaderboard",
    );
  },
};

export const TextOnly: Story = {
  args: {
    blocks: [
      { type: "text", heading: "Why this project", body: ["One paragraph.", "And another."] },
    ],
  },
};

export const ListWithoutIntro: Story = {
  args: { blocks: [{ type: "list", heading: "Steps", items: ["First", "Second"] }] },
};

export const TableWithoutIntro: Story = {
  args: {
    blocks: [
      {
        type: "table",
        heading: "Budgets",
        columns: ["Metric", "Budget"],
        rows: [
          ["Performance", "95"],
          ["Accessibility", "100"],
        ],
      },
    ],
  },
};
