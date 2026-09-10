import path from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./src/apps/web-vite/vite.config.js";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir: path.join(projectRoot, "src/apps/web-vite/.storybook"),
              storybookScript: "pnpm storybook:vite -- --no-open",
            }),
          ],
          test: {
            browser: {
              enabled: true,
              headless: true,
              instances: [{ browser: "chromium" }],
              provider: playwright({}),
            },
            name: "storybook-vite",
          },
        },
        {
          plugins: [
            storybookTest({
              configDir: path.join(projectRoot, "src/apps/web-next/.storybook"),
              storybookScript: "pnpm storybook:next -- --no-open",
            }),
          ],
          test: {
            browser: {
              enabled: true,
              headless: true,
              instances: [{ browser: "chromium" }],
              provider: playwright({}),
            },
            name: "storybook-next",
          },
        },
      ],
    },
  }),
);
