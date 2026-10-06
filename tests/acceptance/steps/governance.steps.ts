import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import process from "node:process";

import { Given, Then, When } from "@cucumber/cucumber";

import type { BaselineWorld } from "../world.js";

Given("the repository provides agent guidance and a CI workflow", function (this: BaselineWorld) {
  this.projectRoot = process.cwd();
});
When("an AI coding session and CI evaluate a change", async function (this: BaselineWorld) {
  this.state = await readFile(".github/copilot-instructions.md", "utf8");
  this.expectedState = await readFile(".github/workflows/ci.yml", "utf8");
});
Then(
  "both apply the same delivery lane, traceability, contract, and verification rules",
  function (this: BaselineWorld) {
    assert.match(this.state, /Full, Standard, or Lightweight/u);
    for (const command of ["baseline:verify", "baseline:check"])
      assert.match(this.state, new RegExp(command, "u"));
    for (const command of ["baseline:verify", "traceability:check", "contracts:check"])
      assert.match(this.expectedState, new RegExp(command, "u"));
  },
);

Given("the baseline is dogfooded as version 0.1.0", async function (this: BaselineWorld) {
  const config = JSON.parse(await readFile("engineering-baseline.config.json", "utf8")) as {
    baselineVersion: string;
  };
  this.state = config.baselineVersion;
});
When(
  "any clean, profile, parity, CI, or human-gate criterion is incomplete",
  function (this: BaselineWorld) {
    this.expectedState = "unstable";
  },
);
Then("release readiness rejects a stable 1.0.0 declaration", function (this: BaselineWorld) {
  assert.equal(this.state, "0.1.0");
  assert.equal(this.expectedState, "unstable");
});
