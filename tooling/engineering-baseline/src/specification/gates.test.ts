import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { validateGateRecord } from "./gates.js";

const approved = (digest: string) => `# Gate
**Status**: Approved
| Artifact | SHA-256 |
| --- | --- |
| spec.md | ${digest} |
**Decision**: Approved
**Approver**: Owner
**Decision date**: 2026-09-10
`;

describe("human gate validation", () => {
  it("accepts an approved current artifact set", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "baseline-gate-"));
    await writeFile(path.join(root, "spec.md"), "approved\n", "utf8");
    const { sha256 } = await import("../core/index.js");

    await expect(validateGateRecord(approved(sha256("approved\n")), root)).resolves.toEqual([]);
  });

  it.each([
    ["missing", "GATE_DECISION_MISSING"],
    ["rejected", "GATE_NOT_APPROVED"],
    ["stale", "GATE_ARTIFACT_STALE"],
  ] as const)("rejects a %s gate", async (kind, code) => {
    const root = await mkdtemp(path.join(tmpdir(), "baseline-gate-"));
    await mkdir(root, { recursive: true });
    await writeFile(path.join(root, "spec.md"), "current\n", "utf8");
    const text =
      kind === "missing"
        ? "# Gate\n**Status**: Pending\n"
        : kind === "rejected"
          ? approved("0".repeat(64)).replaceAll("Approved", "Rejected")
          : approved("0".repeat(64));

    await expect(validateGateRecord(text, root)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ code })]),
    );
  });
});
