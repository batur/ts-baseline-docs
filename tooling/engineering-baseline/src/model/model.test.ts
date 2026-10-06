import { describe, expect, it } from "vitest";

import { BASELINE_CONFIG_SCHEMA, CONTRACT_MANIFEST_SCHEMA, VERIFICATION_SCHEMA } from "./index.js";

describe("engineering baseline runtime models", () => {
  it("accepts a pinned selectable-profile configuration", () => {
    expect(
      BASELINE_CONFIG_SCHEMA.parse({
        baselineVersion: "0.1.0",
        profiles: {
          asyncapi: { artifacts: [], enabled: false },
          graphql: { artifacts: [], enabled: false },
          grpc: { artifacts: [], enabled: false },
          openapi: { artifacts: ["contracts/openapi/api.yaml"], enabled: true },
        },
        schemaVersion: 1,
      }).profiles.openapi.enabled,
    ).toBe(true);
  });

  it("rejects an enabled profile without an artifact", () => {
    expect(() =>
      BASELINE_CONFIG_SCHEMA.parse({
        baselineVersion: "0.1.0",
        profiles: {
          asyncapi: { artifacts: [], enabled: false },
          graphql: { artifacts: [], enabled: false },
          grpc: { artifacts: [], enabled: false },
          openapi: { artifacts: [], enabled: true },
        },
        schemaVersion: 1,
      }),
    ).toThrow();
  });

  it("requires complete contract ownership and migration metadata", () => {
    expect(() =>
      CONTRACT_MANIFEST_SCHEMA.parse({ feature: "001-example", schemaVersion: 1 }),
    ).toThrow();
  });

  it("validates evidence identifiers and relationships", () => {
    expect(
      VERIFICATION_SCHEMA.parse({
        evidence: [
          {
            command: "pnpm test",
            id: "VE-001",
            kind: "automated",
            requirementIds: ["FR-001"],
            result: "pass",
            successCriterionIds: ["SC-001"],
          },
        ],
        feature: "001-example",
        schemaVersion: 1,
      }).evidence,
    ).toHaveLength(1);
  });
});
