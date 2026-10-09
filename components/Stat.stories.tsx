import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Stat, StatGrid } from "./Stat";

const meta = {
  title: "Engineering/Stat",
  component: Stat,
  args: { value: "100", label: "Lighthouse performance", note: "Budget: 95 or the build fails" },
  decorators: [
    (Story) => (
      <StatGrid>
        <Story />
      </StatGrid>
    ),
  ],
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithNote: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Lighthouse performance").tagName).toBe("DT");
    await expect(canvas.getByText("100").tagName).toBe("DD");
  },
};

export const WithoutNote: Story = { args: { note: undefined, value: "–", label: "Line coverage" } };

export const Grid: Story = {
  render: () => (
    <>
      <Stat value="100" label="Performance" />
      <Stat value="0" label="Accessibility violations" note="Across 9 pages" />
      <Stat value="128" label="Tests" />
      <Stat value="97%" label="Line coverage" />
    </>
  ),
};
