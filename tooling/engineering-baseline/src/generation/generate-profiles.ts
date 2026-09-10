import { mkdir, readFile, writeFile } from "node:fs/promises";

import { TypeScriptGenerator } from "@asyncapi/modelina";
import { parse as parseYaml } from "yaml";

import { generateProfileSummary } from "../contracts/profiles.js";

const asyncApiPath = "tooling/engineering-baseline/fixtures/contracts/asyncapi/current.yaml";
const asyncApi = await readFile(asyncApiPath, "utf8");
const outputRoot = "tooling/engineering-baseline/generated";
await mkdir(`${outputRoot}/asyncapi`, { recursive: true });
const generator = new TypeScriptGenerator();
const models = await generator.generate(parseYaml(asyncApi));
await writeFile(
  `${outputRoot}/asyncapi/models.ts`,
  `${models.map(({ result }) => result).join("\n\n")}\n`,
  "utf8",
);

for (const profile of ["openapi", "asyncapi", "graphql", "proto"] as const) {
  const extension = profile === "graphql" ? "graphql" : profile === "proto" ? "proto" : "yaml";
  const text = await readFile(
    `tooling/engineering-baseline/fixtures/contracts/${profile}/current.${extension}`,
    "utf8",
  );
  await mkdir(`${outputRoot}/summaries`, { recursive: true });
  await writeFile(
    `${outputRoot}/summaries/${profile}.json`,
    generateProfileSummary(profile, text),
    "utf8",
  );
}
