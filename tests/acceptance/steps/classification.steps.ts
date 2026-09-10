import { strict as assert } from "node:assert";

import { Given, Then, When } from "@cucumber/cucumber";

import {
  classifyChange,
  requiredArtifactsForLane,
} from "../../../tooling/engineering-baseline/src/specification/classification.js";

import type { BaselineWorld } from "../world.js";

Given(/^a proposed change is (.+)$/u, function (this: BaselineWorld, change: string) {
  this.change = change;
});
When("the baseline classifies its delivery risk", function (this: BaselineWorld) {
  this.lane = classifyChange(this.change);
});
Then(
  /^the required lane is (Full|Standard|Lightweight)$/u,
  function (this: BaselineWorld, lane: string) {
    assert.equal(this.lane, lane.toLowerCase());
  },
);

Given("a Standard-lane defect changes an observable rule", function (this: BaselineWorld) {
  this.lane = "standard";
});
When("its regression protection is prepared", function (this: BaselineWorld) {
  this.state = requiredArtifactsForLane("standard", true).join(",");
});
Then(
  "its living specification and Gherkin example are reconciled before TDD implementation",
  function (this: BaselineWorld) {
    assert.ok(this.state.includes("specification"));
    assert.ok(this.state.includes("gherkin"));
    assert.ok(this.state.indexOf("gherkin") < this.state.indexOf("tdd"));
  },
);

Given("a change is editorial or demonstrably behavior-preserving", function (this: BaselineWorld) {
  this.lane = "lightweight";
});
When("its intent and invariants are recorded", function (this: BaselineWorld) {
  this.state = requiredArtifactsForLane("lightweight", false).join(",");
});
Then(
  "the workflow requires relevant checks without inventing Gherkin or external contracts",
  function (this: BaselineWorld) {
    assert.equal(this.state, "intent,invariants,checks");
  },
);
