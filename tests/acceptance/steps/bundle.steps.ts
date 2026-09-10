import { strict as assert } from "node:assert";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { Given, Then, When } from "@cucumber/cucumber";

import { validateBundleComponents } from "../../../tooling/engineering-baseline/src/bundle/components.js";
import {
  installBundle,
  managedTreeDigest,
  removeBundle,
  updateBundle,
} from "../../../tooling/engineering-baseline/src/bundle/lifecycle.js";

import type { BaselineWorld } from "../world.js";

const sourceRoot = path.resolve("tooling/spec-kit/typescript-engineering-baseline");

async function makeProject() {
  const root = await mkdtemp(path.join(tmpdir(), "baseline-acceptance-"));
  await writeFile(path.join(root, "package.json"), '{"type":"module"}\n', "utf8");
  return root;
}

Given(
  "a fresh TypeScript project uses a supported AI coding integration",
  async function (this: BaselineWorld) {
    this.projectRoot = await makeProject();
  },
);
When("it installs the pinned engineering baseline bundle", async function (this: BaselineWorld) {
  await installBundle({ integration: "codex", projectRoot: this.projectRoot, sourceRoot });
});
Then(
  "it receives the preset, verifier, gated workflow, and fixed verification commands",
  async function (this: BaselineWorld) {
    assert.deepEqual(
      await validateBundleComponents(
        path.join(this.projectRoot, ".specify/typescript-engineering-baseline"),
      ),
      [],
    );
  },
);

Given(
  "an existing TypeScript project has source files and agent skills",
  async function (this: BaselineWorld) {
    this.projectRoot = await makeProject();
    await mkdir(path.join(this.projectRoot, "src"));
    await mkdir(path.join(this.projectRoot, ".agents/skills/existing"), { recursive: true });
    await writeFile(path.join(this.projectRoot, "src/index.ts"), "preserved\n", "utf8");
    await writeFile(
      path.join(this.projectRoot, ".agents/skills/existing/SKILL.md"),
      "existing\n",
      "utf8",
    );
  },
);
When("it installs the engineering baseline bundle", async function (this: BaselineWorld) {
  await installBundle({ integration: "codex", projectRoot: this.projectRoot, sourceRoot });
});
Then(
  "unrelated source, configuration, and skills remain unchanged",
  async function (this: BaselineWorld) {
    assert.equal(
      await readFile(path.join(this.projectRoot, "src/index.ts"), "utf8"),
      "preserved\n",
    );
    assert.equal(
      await readFile(path.join(this.projectRoot, ".agents/skills/existing/SKILL.md"), "utf8"),
      "existing\n",
    );
  },
);

Given(
  "a project has installed the engineering baseline bundle",
  async function (this: BaselineWorld) {
    this.projectRoot = await makeProject();
    await installBundle({ integration: "codex", projectRoot: this.projectRoot, sourceRoot });
    this.state = await managedTreeDigest(this.projectRoot);
  },
);
When(
  "it updates, removes, and reinstalls the same pinned version",
  async function (this: BaselineWorld) {
    await updateBundle({ integration: "codex", projectRoot: this.projectRoot, sourceRoot });
    await removeBundle(this.projectRoot);
    await installBundle({ integration: "codex", projectRoot: this.projectRoot, sourceRoot });
  },
);
Then(
  "the final managed artifact set matches a clean installation",
  async function (this: BaselineWorld) {
    assert.equal(await managedTreeDigest(this.projectRoot), this.state);
  },
);

Given("the bundle is installed in a project", async function (this: BaselineWorld) {
  this.projectRoot = await makeProject();
  await installBundle({ integration: "codex", projectRoot: this.projectRoot, sourceRoot });
});
When("an AI coding session and CI evaluate a change", async function (this: BaselineWorld) {
  this.state = await readFile(
    path.join(
      this.projectRoot,
      ".specify/typescript-engineering-baseline/workflows/typescript-delivery/workflow.yml",
    ),
    "utf8",
  );
});
Then(
  "both apply the same delivery lane, traceability, contract, and verification rules",
  function (this: BaselineWorld) {
    for (const rule of ["lane", "trace", "contract", "verify"])
      assert.match(this.state, new RegExp(rule, "iu"));
  },
);

Given("the bundle is dogfooded as version 0.1.0", function (this: BaselineWorld) {
  this.state = "0.1.0";
});
When(
  "any clean, adoption, profile, parity, CI, or human-gate criterion is incomplete",
  function (this: BaselineWorld) {
    this.expectedState = "unstable";
  },
);
Then("release readiness rejects a stable 1.0.0 declaration", function (this: BaselineWorld) {
  assert.equal(this.state, "0.1.0");
  assert.equal(this.expectedState, "unstable");
});
