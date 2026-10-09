import type { Preview } from "@storybook/nextjs-vite";
import { fontVariables } from "../app/fonts";
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: { matchers: { color: /(background|color)$/i } },
    // Accessibility violations fail the story's test, locally and in CI.
    a11y: { test: "error" },
    backgrounds: { disable: true },
  },
  decorators: [
    (Story) => (
      <div className={`${fontVariables} bg-paper font-sans text-ink`}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default preview;
