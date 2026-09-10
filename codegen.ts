import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  documents: "tooling/engineering-baseline/fixtures/contracts/graphql/operations.graphql",
  generates: {
    "tooling/engineering-baseline/generated/graphql/types.ts": {
      plugins: ["typescript", "typescript-operations"],
    },
  },
  schema: "tooling/engineering-baseline/fixtures/contracts/graphql/current.graphql",
};

export default config;
