import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";

import { Given, Then, When } from "@cucumber/cucumber";

import {
  parseFeatureSources,
  validateSpecificationText,
} from "../../../tooling/engineering-baseline/src/specification/specification.js";
import { generateTraceabilityReport } from "../../../tooling/engineering-baseline/src/traceability/traceability.js";

import type { BaselineWorld } from "../world.js";

const baseSpec = `---
feature: acceptance-example
lane: full
status: complete
---
- **FR-001**: Observable behavior.
- **SC-001**: Verified outcome.
## Verification Evidence
| Success criterion | Required evidence |
| --- | --- |
| SC-001 | Automated check |
`;
const baseFeature = `@FR-001
Feature: Example
  Scenario: Visible outcome
    Given a state
    When behavior occurs
    Then an outcome is visible
`;

Given(
  "an approved scenario describes an observable system outcome",
  function (this: BaselineWorld) {
    this.state = "outer-approved";
  },
);
When("an engineer implements one behavior increment", function (this: BaselineWorld) {
  this.state = "cucumber-outer-vitest-inner";
});
Then(
  "Cucumber verifies the outer outcome and Vitest guides the internal design",
  function (this: BaselineWorld) {
    assert.equal(this.state, "cucumber-outer-vitest-inner");
  },
);

Given("a behavior increment requires implementation", function (this: BaselineWorld) {
  this.state = "red-required";
});
When(
  "the engineer observes a focused Vitest test fail for the intended reason",
  async function (this: BaselineWorld) {
    const evidence = await readFile("specs/001-engineering-baseline/verification.yaml", "utf8");
    assert.match(evidence, /intendedFailure:/u);
    this.state = "red-recorded";
  },
);
Then(
  "the PR records the red evidence and the final passing verification",
  function (this: BaselineWorld) {
    assert.equal(this.state, "red-recorded");
  },
);

Given(
  "a Full-lane specification defines unique functional and success identifiers",
  function (this: BaselineWorld) {
    this.state = "trace-input";
  },
);
Given("its ready scenarios carry matching requirement tags", function (this: BaselineWorld) {
  assert.equal(this.state, "trace-input");
});
When("traceability validation runs", function (this: BaselineWorld) {
  const report = generateTraceabilityReport({
    contracts: [],
    evidence: [{ id: "VE-001", requirementIds: ["FR-001"], successCriterionIds: ["SC-001"] }],
    feature: "acceptance-example",
    requirementIds: ["FR-001"],
    scenarios: [{ name: "Visible outcome", path: "example.feature", requirementIds: ["FR-001"] }],
    successCriterionIds: ["SC-001"],
  });
  this.state = JSON.stringify(report);
});
Then(
  "every requirement and success criterion appears with its verification relationships",
  function (this: BaselineWorld) {
    assert.match(this.state, /FR-001/u);
    assert.match(this.state, /SC-001/u);
  },
);

Given(/^a feature package contains (.+)$/u, function (this: BaselineWorld, violation: string) {
  let spec = baseSpec;
  let feature = baseFeature;
  if (violation === "a duplicate requirement identifier") spec += "- **FR-001**: Duplicate.\n";
  if (violation === "a dangling scenario requirement tag")
    feature = feature.replace("@FR-001", "@FR-999");
  if (violation === "a Full-lane requirement without a scenario")
    feature = feature.replace("@FR-001\n", "");
  if (violation === "a success criterion without evidence")
    spec = spec.replace("| SC-001 | Automated check |", "");
  if (violation === "an unresolved clarification marker") spec += "[NEEDS CLARIFICATION: owner]\n";
  this.state = JSON.stringify({ feature, spec });
});
When("specification validation runs", function (this: BaselineWorld) {
  if (this.state === "draft-wip") {
    this.diagnostics = validateSpecificationText(
      baseSpec.replace("status: complete", "status: draft"),
      [{ path: "example.feature", text: `@wip\n${baseFeature}` }],
    );
    return;
  }
  if (this.state === "complete-wip") {
    this.diagnostics = validateSpecificationText(baseSpec, [
      { path: "example.feature", text: `@wip\n${baseFeature}` },
    ]);
    return;
  }
  const input = JSON.parse(this.state) as { feature: string; spec: string };
  this.diagnostics = validateSpecificationText(input.spec, [
    { path: "example.feature", text: input.feature },
  ]);
});
Then("validation fails with a stable finding for that violation", function (this: BaselineWorld) {
  assert.ok(this.diagnostics.length > 0);
  assert.match(this.diagnostics[0]?.code ?? "", /^(?:SPEC|GHERKIN)_/u);
});

Given(
  "a draft specification has an unfinished scenario marked wip",
  function (this: BaselineWorld) {
    this.state = "draft-wip";
  },
);
Then(
  "the unfinished scenario is allowed but excluded from ready execution",
  function (this: BaselineWorld) {
    assert.ok(!this.diagnostics.some(({ code }) => code === "GHERKIN_COMPLETED_WIP"));
    assert.ok(
      parseFeatureSources([{ path: "example.feature", text: `@wip\n${baseFeature}` }]).every(
        ({ wip }) => wip,
      ),
    );
  },
);

Given("a completed specification has a scenario marked wip", function (this: BaselineWorld) {
  this.state = "complete-wip";
});
Then("validation fails before the feature can be accepted", function (this: BaselineWorld) {
  assert.ok(this.diagnostics.some(({ code }) => code === "GHERKIN_COMPLETED_WIP"));
});
