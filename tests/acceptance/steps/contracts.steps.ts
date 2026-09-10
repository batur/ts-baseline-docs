import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";

import { Given, Then, When } from "@cucumber/cucumber";
import { parse as parseYaml } from "yaml";

import { validateContractManifest } from "../../../tooling/engineering-baseline/src/contracts/manifest.js";
import {
  checkProfileCompatibility,
  generateProfileSummary,
  requiredToolPackages,
  validateProfileArtifact,
} from "../../../tooling/engineering-baseline/src/contracts/profiles.js";

import type { ContractProfile } from "../../../tooling/engineering-baseline/src/contracts/profiles.js";
import type { BaselineWorld } from "../world.js";

async function validateRepositoryManifest(stale: boolean) {
  const artifactPath = "contracts/openapi/baseline-api.yaml";
  const artifact = await readFile(artifactPath, "utf8");
  const manifest = parseYaml(
    await readFile(
      "specs/001-engineering-baseline/contracts/engineering-baseline.contracts.yaml",
      "utf8",
    ),
  ) as { contracts: { selectors: { operations?: string[] } }[] };
  if (stale) manifest.contracts[0]?.selectors.operations?.push("missingOperation");
  return validateContractManifest(manifest, { [artifactPath]: artifact });
}

Given("a feature changes an independently owned system boundary", function (this: BaselineWorld) {
  this.state = "contract-change";
});
Given(
  "its manifest identifies owners, requirements, affected elements, and compatibility data",
  function (this: BaselineWorld) {
    this.state = "manifest-complete";
  },
);
When("contract verification runs before Gate 2", async function (this: BaselineWorld) {
  this.diagnostics = await validateRepositoryManifest(false);
});
Then("every selector resolves in the authoritative contract", function (this: BaselineWorld) {
  assert.deepEqual(this.diagnostics, []);
});

Given(
  "a contract manifest references an element absent from its authoritative contract",
  function (this: BaselineWorld) {
    this.state = "stale-manifest";
  },
);
When("contract verification runs", async function (this: BaselineWorld) {
  this.diagnostics = await validateRepositoryManifest(true);
});
Then("validation fails with the stale selector and artifact path", function (this: BaselineWorld) {
  assert.ok(
    this.diagnostics.some(
      ({ code, message }) =>
        code === "CONTRACT_SELECTOR_STALE" && message.includes("baseline-api.yaml"),
    ),
  );
});

Given(
  /^a TypeScript project communicates through (REST HTTP|asynchronous messages|a graph API|remote procedure calls)$/u,
  function (this: BaselineWorld, boundary: string) {
    const mapping: Record<string, ContractProfile> = {
      "REST HTTP": "openapi",
      "a graph API": "graphql",
      "asynchronous messages": "asyncapi",
      "remote procedure calls": "proto",
    };
    this.contractProfile = mapping[boundary] ?? "";
  },
);
When("the project activates the matching contract profile", async function (this: BaselineWorld) {
  const profile = this.contractProfile as ContractProfile;
  const extension = profile === "graphql" ? "graphql" : profile === "proto" ? "proto" : "yaml";
  const text = await readFile(
    `tooling/engineering-baseline/fixtures/contracts/${profile}/current.${extension}`,
    "utf8",
  );
  this.diagnostics = validateProfileArtifact(profile, text);
  this.state = generateProfileSummary(profile, text);
});
Then(
  /^the baseline validates and generates from (OpenAPI|AsyncAPI|GraphQL SDL and consumer operations|Protobuf)$/u,
  function (this: BaselineWorld, artifact: string) {
    assert.ok(artifact.length > 0);
    assert.deepEqual(this.diagnostics, []);
    assert.match(this.state, /"digest"/u);
  },
);

Given("a project activates only the OpenAPI contract profile", function (this: BaselineWorld) {
  this.contractProfile = "openapi";
});
When("baseline setup and verification run", function (this: BaselineWorld) {
  this.state = requiredToolPackages(["openapi"]).join(",");
});
Then(
  "AsyncAPI, GraphQL, and Protobuf tools are neither installed nor executed",
  function (this: BaselineWorld) {
    assert.doesNotMatch(this.state, /asyncapi|graphql|buf|protobuf/iu);
  },
);

Given(
  "compatibility analysis identifies a breaking external interface change",
  async function (this: BaselineWorld) {
    const root = "tooling/engineering-baseline/fixtures/contracts/openapi";
    this.diagnostics = checkProfileCompatibility(
      "openapi",
      await readFile(`${root}/previous.yaml`, "utf8"),
      await readFile(`${root}/breaking.yaml`, "utf8"),
    );
  },
);
When("the feature is prepared for Gate 2", function (this: BaselineWorld) {
  this.state = this.diagnostics.length > 0 ? "migration-required" : "additive";
});
Then(
  "approval requires a new version or a coordinated migration and deprecation plan",
  function (this: BaselineWorld) {
    assert.equal(this.state, "migration-required");
  },
);

Given(
  "the users API behavior and exports are captured before migration",
  async function (this: BaselineWorld) {
    this.state = await readFile("docs/openapi/openapi.yaml", "utf8");
  },
);
When("OpenAPI becomes its authoritative interface contract", async function (this: BaselineWorld) {
  const authoritative = await readFile("contracts/openapi/baseline-api.yaml", "utf8");
  this.diagnostics = checkProfileCompatibility("openapi", this.state, authoritative);
});
Then(
  "its paths, envelopes, statuses, security declarations, and exported types remain compatible",
  function (this: BaselineWorld) {
    assert.deepEqual(this.diagnostics, []);
  },
);
