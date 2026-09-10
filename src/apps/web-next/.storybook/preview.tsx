import "../app/styles.css";

import type { Preview } from "@storybook/nextjs-vite";

const preview = {
  parameters: {
    a11y: {
      test: "error",
    },
  },
} satisfies Preview;

export default preview;
