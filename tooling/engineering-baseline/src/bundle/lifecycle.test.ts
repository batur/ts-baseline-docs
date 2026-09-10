import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { installBundle, managedTreeDigest, removeBundle, updateBundle } from "./lifecycle.js";

const source = path.resolve("tooling/spec-kit/typescript-engineering-baseline");

async function freshFixture(integration: "codex" | "copilot" | "opencode") {
  const root = await mkdtemp(path.join(tmpdir(), `baseline-${integration}-`));
  await writeFile(path.join(root, "package.json"), '{"type":"module"}\n', "utf8");
  return root;
}

describe("bundle lifecycle", () => {
  it.each(["codex", "copilot", "opencode"] as const)(
    "installs into a fresh %s project idempotently",
    async (integration) => {
      const root = await freshFixture(integration);
      await installBundle({ integration, projectRoot: root, sourceRoot: source });
      const once = await managedTreeDigest(root);
      await installBundle({ integration, projectRoot: root, sourceRoot: source });
      expect(await managedTreeDigest(root)).toBe(once);
      expect(await readFile(path.join(root, ".specify/baseline-managed.json"), "utf8")).toContain(
        '"version": "0.1.0"',
      );
    },
  );

  it("preserves unrelated brownfield source, configuration, and skills", async () => {
    const root = await freshFixture("codex");
    await mkdir(path.join(root, "src"));
    await mkdir(path.join(root, ".agents/skills/existing"), { recursive: true });
    await writeFile(path.join(root, "src/index.ts"), "export const preserved = true;\n", "utf8");
    await writeFile(path.join(root, ".agents/skills/existing/SKILL.md"), "existing\n", "utf8");
    const before = await Promise.all([
      readFile(path.join(root, "src/index.ts"), "utf8"),
      readFile(path.join(root, ".agents/skills/existing/SKILL.md"), "utf8"),
    ]);

    await installBundle({ integration: "codex", projectRoot: root, sourceRoot: source });

    await expect(
      Promise.all([
        readFile(path.join(root, "src/index.ts"), "utf8"),
        readFile(path.join(root, ".agents/skills/existing/SKILL.md"), "utf8"),
      ]),
    ).resolves.toEqual(before);
  });

  it("preserves unrelated OpenCode commands in a brownfield project", async () => {
    const root = await freshFixture("opencode");
    await mkdir(path.join(root, ".opencode/commands"), { recursive: true });
    await writeFile(path.join(root, ".opencode/commands/custom.md"), "custom\n", "utf8");
    const before = await readFile(path.join(root, ".opencode/commands/custom.md"), "utf8");

    await installBundle({ integration: "opencode", projectRoot: root, sourceRoot: source });

    await expect(readFile(path.join(root, ".opencode/commands/custom.md"), "utf8")).resolves.toBe(
      before,
    );
  });

  it("updates, removes, and reinstalls to the clean managed tree", async () => {
    const root = await freshFixture("codex");
    await installBundle({ integration: "codex", projectRoot: root, sourceRoot: source });
    const clean = await managedTreeDigest(root);
    await updateBundle({ integration: "codex", projectRoot: root, sourceRoot: source });
    await removeBundle(root);
    await expect(
      readFile(path.join(root, ".specify/baseline-managed.json"), "utf8"),
    ).rejects.toThrow();
    await installBundle({ integration: "codex", projectRoot: root, sourceRoot: source });
    expect(await managedTreeDigest(root)).toBe(clean);
  });
});
