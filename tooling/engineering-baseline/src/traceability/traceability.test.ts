import { describe, expect, it } from "vitest";

import { generateTraceabilityReport } from "./traceability.js";

describe("traceability report", () => {
  it("joins and sorts requirement relationships deterministically", () => {
    const input = {
      contracts: [
        {
          artifact: "contracts/openapi/api.yaml",
          manifest: "specs/001/contracts/change.yaml",
          profile: "openapi" as const,
          requirementIds: ["FR-002"],
          selectors: ["operation:listItems"],
        },
      ],
      evidence: [
        { id: "VE-001", requirementIds: ["FR-001", "FR-002"], successCriterionIds: ["SC-001"] },
      ],
      feature: "001-example",
      requirementIds: ["FR-002", "FR-001"],
      scenarios: [{ name: "Visible result", path: "example.feature", requirementIds: ["FR-001"] }],
      successCriterionIds: ["SC-001"],
    };

    const first = generateTraceabilityReport(input);
    const second = generateTraceabilityReport(input);

    expect(first).toEqual(second);
    expect(first.relationships.map(({ requirementId }) => requirementId)).toEqual([
      "FR-001",
      "FR-002",
    ]);
    expect(first.relationships[0]).toMatchObject({
      evidence: ["VE-001"],
      scenarios: ["example.feature#Visible result"],
      successCriteria: ["SC-001"],
    });
  });
});
