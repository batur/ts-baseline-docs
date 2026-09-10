import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { After } from "@cucumber/cucumber";

import type { BaselineWorld } from "./world.js";

After(async function (this: BaselineWorld) {
  if (this.projectRoot.startsWith(`${tmpdir()}${path.sep}baseline-acceptance-`)) {
    await rm(this.projectRoot, { force: true, recursive: true });
  }
});
