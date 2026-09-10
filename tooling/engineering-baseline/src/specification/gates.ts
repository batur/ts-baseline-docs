import { readFile } from "node:fs/promises";
import path from "node:path";

import { sha256, sortDiagnostics } from "../core/index.js";

import type { Diagnostic } from "../core/index.js";

export async function validateGateRecord(
  gateText: string,
  artifactRoot: string,
  gatePath = "gate.md",
  repositoryRoot?: string,
): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  const status = /^\*\*Status\*\*:\s*(.+)$/mu.exec(gateText)?.[1]?.trim();
  const decision = /^\*\*Decision\*\*:\s*(.+)$/mu.exec(gateText)?.[1]?.trim();

  if (status === undefined || decision === undefined) {
    diagnostics.push({
      code: "GATE_DECISION_MISSING",
      message: "Gate status and human decision are required.",
      path: gatePath,
    });
    return diagnostics;
  }
  if (status !== "Approved" || decision !== "Approved") {
    diagnostics.push({
      code: "GATE_NOT_APPROVED",
      message: "Gate has not been approved.",
      path: gatePath,
    });
    return diagnostics;
  }

  for (const match of gateText.matchAll(/^\|\s*([^|]+?)\s*\|\s*([a-f\d]{64})\s*\|$/gmu)) {
    const artifact = match[1]?.trim();
    const expected = match[2];
    if (artifact === undefined || expected === undefined || artifact === "Artifact") continue;
    try {
      const resolvedArtifact =
        repositoryRoot !== undefined && artifact.startsWith("../")
          ? path.resolve(repositoryRoot, artifact.replace(/^(?:\.\.\/)+/u, ""))
          : path.resolve(artifactRoot, artifact);
      const current = sha256(await readFile(resolvedArtifact, "utf8"));
      if (current !== expected) {
        diagnostics.push({
          code: "GATE_ARTIFACT_STALE",
          message: `${artifact} changed after approval.`,
          path: gatePath,
        });
      }
    } catch {
      diagnostics.push({
        code: "GATE_ARTIFACT_MISSING",
        message: `${artifact} is missing.`,
        path: gatePath,
      });
    }
  }

  return sortDiagnostics(diagnostics);
}
