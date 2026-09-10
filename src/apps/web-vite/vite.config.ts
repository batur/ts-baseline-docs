import { resolve } from "node:path";

import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const projectRoot = resolve(import.meta.dirname);
const repositoryRoot = resolve(projectRoot, "../../..");

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: resolve(repositoryRoot, "dist/apps/web-vite"),
  },
  plugins: [
    tanstackRouter({
      autoCodeSplitting: true,
      generatedRouteTree: "./route-tree.gen.ts",
      routesDirectory: "./routes",
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  root: projectRoot,
});
