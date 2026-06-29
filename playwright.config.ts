import { defineConfig } from "@playwright/test";

export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  testDir: "./tests/e2e",
  use: {
    trace: "on-first-retry",
  },
});
