import { describe, expect, it } from "vitest";

import { validateSpecificationText } from "./specification.js";

const validSpec = `---
feature: example
lane: full
status: complete
---
# Example
- **FR-001**: Deliver behavior.
- **SC-001**: Behavior passes.
## Verification Evidence
| Success criterion | Required evidence |
| --- | --- |
| SC-001 | Automated check |
`;

const validFeature = `@FR-001
Feature: Example
  Scenario: Observable outcome
    Given a valid state
    When behavior runs
    Then the outcome is visible
`;

describe("specification validation", () => {
  it("accepts unique, traced, evidenced completed behavior", () => {
    expect(
      validateSpecificationText(validSpec, [{ path: "example.feature", text: validFeature }]),
    ).toEqual([]);
  });

  it.each([
    [
      "duplicate requirement identifier",
      `${validSpec}\n- **FR-001**: Duplicate.\n`,
      validFeature,
      "SPEC_DUPLICATE_ID",
    ],
    [
      "dangling scenario requirement tag",
      validSpec,
      validFeature.replace("@FR-001", "@FR-999"),
      "GHERKIN_DANGLING_REQUIREMENT",
    ],
    [
      "Full-lane requirement without a scenario",
      validSpec,
      validFeature.replace("@FR-001\n", ""),
      "GHERKIN_MISSING_SCENARIO",
    ],
    [
      "success criterion without evidence",
      validSpec.replace("| SC-001 | Automated check |", ""),
      validFeature,
      "SPEC_MISSING_EVIDENCE",
    ],
    [
      "unresolved clarification marker",
      `${validSpec}\n[NEEDS CLARIFICATION: owner]\n`,
      validFeature,
      "SPEC_UNRESOLVED_CLARIFICATION",
    ],
    ["completed wip scenario", validSpec, `@wip\n${validFeature}`, "GHERKIN_COMPLETED_WIP"],
  ] as const)("rejects %s", (_name, spec, feature, code) => {
    expect(validateSpecificationText(spec, [{ path: "example.feature", text: feature }])).toEqual(
      expect.arrayContaining([expect.objectContaining({ code })]),
    );
  });

  it("allows draft wip behavior", () => {
    expect(
      validateSpecificationText(validSpec.replace("status: complete", "status: draft"), [
        { path: "example.feature", text: `@wip\n${validFeature}` },
      ]).map(({ code }) => code),
    ).not.toContain("GHERKIN_COMPLETED_WIP");
  });
});
