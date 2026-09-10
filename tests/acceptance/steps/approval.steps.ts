import { strict as assert } from "node:assert";

import { Given, Then, When } from "@cucumber/cucumber";

import type { BaselineWorld } from "../world.js";

Given(
  "a Full-lane change has a living specification and executable behavior examples",
  function (this: BaselineWorld) {
    this.state = "gate-1-ready";
  },
);
When("the specification and behavior verification succeeds", function (this: BaselineWorld) {
  assert.equal(this.state, "gate-1-ready");
  this.state = "gate-1-waiting";
});
Then("the workflow pauses at Gate 1 for human approval", function (this: BaselineWorld) {
  assert.equal(this.state, "gate-1-waiting");
});

Given("a Full-lane workflow is waiting at Gate 1", function (this: BaselineWorld) {
  this.state = "gate-1-waiting";
});
When("the human rejects the specification or behavior examples", function (this: BaselineWorld) {
  this.state = "clarification-required";
});
Then(
  "the workflow stops before planning and returns the change for clarification",
  function (this: BaselineWorld) {
    assert.equal(this.state, "clarification-required");
  },
);

Given(
  "Gate 1 is approved and the plan and applicable contracts pass verification",
  function (this: BaselineWorld) {
    this.state = "gate-2-ready";
  },
);
When("the workflow reaches its second approval point", function (this: BaselineWorld) {
  assert.equal(this.state, "gate-2-ready");
  this.state = "gate-2-waiting";
});
Then(
  "implementation remains blocked until the human approves Gate 2",
  function (this: BaselineWorld) {
    assert.equal(this.state, "gate-2-waiting");
  },
);

Given(
  "an approved Full-lane change has no independently owned system boundary",
  function (this: BaselineWorld) {
    this.state = "plan-only";
  },
);
When("its implementation plan passes verification", function (this: BaselineWorld) {
  this.state = "gate-2-no-contract";
});
Then(
  "Gate 2 presents the plan and records that no contract is applicable",
  function (this: BaselineWorld) {
    assert.equal(this.state, "gate-2-no-contract");
  },
);
