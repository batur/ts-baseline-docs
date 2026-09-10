import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { validateContractManifest } from "./manifest.js";

const artifact = `openapi: 3.1.0
info: { title: Example, version: 1.0.0 }
paths:
  /items:
    get:
      operationId: listItems
      responses:
        '200': { description: OK }
components:
  schemas:
    Item: { type: object }
`;

const digest = createHash("sha256").update(artifact).digest("hex");
const manifest = {
  contracts: [
    {
      artifact: "contracts/openapi/api.yaml",
      artifactSha256: digest,
      compatibility: { baseline: null, classification: "additive", rationale: "New contract." },
      deprecation: { deprecatedElements: [], intendedRemovalRelease: null, notes: "None." },
      id: "items-api",
      migration: {
        deadline: null,
        required: false,
        rolloutNotes: "None.",
        strategy: "No migration.",
      },
      owners: { consumers: ["@consumer"], provider: ["@provider"] },
      profile: "openapi",
      requirementIds: ["FR-001"],
      selectors: { operations: ["listItems"], types: ["Item"] },
      successCriterionIds: ["SC-001"],
    },
  ],
  feature: "001-example",
  schemaVersion: 1,
};

describe("contract manifest validation", () => {
  it("accepts a complete manifest with resolvable selectors", () => {
    expect(
      validateContractManifest(manifest, {
        "contracts/openapi/api.yaml": artifact,
      }),
    ).toEqual([]);
  });

  it("rejects missing artifacts", () => {
    expect(validateContractManifest(manifest, {})).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "CONTRACT_ARTIFACT_MISSING" })]),
    );
  });

  it("rejects stale digests", () => {
    expect(
      validateContractManifest(
        {
          ...manifest,
          contracts: [{ ...manifest.contracts[0], artifactSha256: "0".repeat(64) }],
        },
        { "contracts/openapi/api.yaml": artifact },
      ),
    ).toEqual(expect.arrayContaining([expect.objectContaining({ code: "CONTRACT_DIGEST_STALE" })]));
  });

  it("rejects unresolved selectors", () => {
    expect(
      validateContractManifest(
        {
          ...manifest,
          contracts: [
            {
              ...manifest.contracts[0],
              selectors: { operations: ["deleteEverything"], types: ["Missing"] },
            },
          ],
        },
        { "contracts/openapi/api.yaml": artifact },
      ).map(({ code }) => code),
    ).toContain("CONTRACT_SELECTOR_STALE");
  });
});
