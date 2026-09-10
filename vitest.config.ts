import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        "coverage/**",
        "dist/**",
        "node_modules/**",
        "playwright-report/**",
        "test-results/**",
      ],
      provider: "v8",
      reporter: ["text", "lcov"],
    },
    environment: "node",
    globals: false,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "tests/**/*.test.ts", "tests/**/*.test.tsx"],
    passWithNoTests: true,
  },
});
