import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const projectRoot = resolve(import.meta.dirname);

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: resolve(projectRoot, "dist/apps/web"),
  },
  plugins: [react()],
  root: resolve(projectRoot, "src/apps/web"),
});
