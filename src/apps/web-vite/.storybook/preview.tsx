import "../styles.css";

import type { Preview } from "@storybook/react-vite";

const preview = {
  parameters: {
    a11y: {
      test: "error",
    },
    controls: {
      matchers: {
        color: /(background|color)$/u,
        date: /Date$/u,
      },
    },
  },
} satisfies Preview;

export default preview;
