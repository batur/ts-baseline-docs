import { defineConfig } from "orval";

export default defineConfig({
  usersClient: {
    input: {
      target: "contracts/openapi/baseline-api.yaml",
    },
    output: {
      client: "fetch",
      clean: true,
      mock: true,
      mode: "split",
      schemas: "src/generated/openapi/models",
      target: "src/generated/openapi/client.ts",
    },
  },
  usersZod: {
    input: {
      target: "contracts/openapi/baseline-api.yaml",
    },
    output: {
      client: "zod",
      mode: "single",
      target: "src/generated/openapi/zod.ts",
    },
  },
});
