import { access, readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

import { validateBundleComponents } from "./components.js";

const bundleRoot = path.resolve("tooling/spec-kit/typescript-engineering-baseline");

describe("Spec Kit engineering baseline components", () => {
  it("dogfoods the official OpenCode integration", async () => {
    const {
      default_integration: defaultIntegration,
      installed_integrations: installedIntegrations,
    } = JSON.parse(await readFile(".specify/integration.json", "utf8")) as Record<string, unknown>;
    expect(defaultIntegration).toBe("opencode");
    expect(installedIntegrations).toContain("opencode");
    await access(".specify/integrations/opencode.manifest.json");
    await access(".opencode/commands/speckit.specify.md");
    await access(".opencode/commands/speckit.implement.md");
  });

  it("pins owned components to 0.1.0 and Spec Kit to 1.0.5", async () => {
    const diagnostics = await validateBundleComponents(bundleRoot);
    expect(diagnostics).toEqual([]);

    const bundle = parseYaml(await readFile(path.join(bundleRoot, "bundle.yml"), "utf8")) as {
      bundle: { version: string };
      requires: Readonly<Record<string, unknown>>;
    };
    expect(bundle.bundle.version).toBe("0.1.0");
    expect(bundle.requires.speckit_version).toBe("==1.0.5");
  });

  it("contains every delivery stage and both human gates", async () => {
    const workflow = await readFile(
      path.join(bundleRoot, "workflows/typescript-delivery/workflow.yml"),
      "utf8",
    );
    for (const stage of [
      "classify",
      "specify",
      "clarify",
      "formulate",
      "Gate 1",
      "plan",
      "contracts",
      "Gate 2",
      "tasks",
      "analyze",
      "implement",
      "verify",
      "converge",
    ]) {
      expect(workflow).toContain(stage);
    }
    expect(workflow).toContain("type: switch");
    expect(workflow).toContain("opencode");
  });

  it("allows only literal repository commands in shell steps", async () => {
    const workflow = await readFile(
      path.join(bundleRoot, "workflows/typescript-delivery/workflow.yml"),
      "utf8",
    );
    const shellLines = workflow.split("\n").filter((line) => line.trimStart().startsWith("run:"));
    expect(shellLines.length).toBeGreaterThan(0);
    expect(
      shellLines.every((line) => line.includes("pnpm baseline:") && !line.includes("{{")),
    ).toBe(true);
  });

  it("registers mandatory verification around implementation", async () => {
    const extension = await readFile(
      path.join(bundleRoot, "extensions/engineering-baseline-verify/extension.yml"),
      "utf8",
    );
    expect(extension).toContain("before_implement:");
    expect(extension).toContain("after_implement:");
    expect(extension.match(/optional: false/gu)).toHaveLength(2);
  });
});
