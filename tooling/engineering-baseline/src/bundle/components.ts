import { access, readFile } from "node:fs/promises";
import path from "node:path";

import { parse as parseYaml } from "yaml";

import { sortDiagnostics } from "../core/index.js";

import type { Diagnostic } from "../core/index.js";

export async function validateBundleComponents(bundleRoot: string): Promise<Diagnostic[]> {
  const files = [
    "bundle.yml",
    "presets/typescript-baseline-sdd/preset.yml",
    "extensions/engineering-baseline-verify/extension.yml",
    "workflows/typescript-delivery/workflow.yml",
  ];
  const diagnostics: Diagnostic[] = [];
  for (const file of files) {
    try {
      await access(path.join(bundleRoot, file));
    } catch {
      diagnostics.push({
        code: "BUNDLE_COMPONENT_MISSING",
        message: `${file} is missing.`,
        path: file,
      });
    }
  }
  if (diagnostics.length > 0) return sortDiagnostics(diagnostics);

  const parsedFiles = await Promise.all(
    files.map(async (file) => ({
      file,
      text: await readFile(path.join(bundleRoot, file), "utf8"),
    })),
  );
  for (const { file, text } of parsedFiles) {
    let document: unknown;
    try {
      document = parseYaml(text);
    } catch (error: unknown) {
      diagnostics.push({
        code: "BUNDLE_COMPONENT_INVALID",
        message: error instanceof Error ? error.message : "Invalid YAML.",
        path: file,
      });
      continue;
    }
    if (typeof document !== "object" || document === null)
      diagnostics.push({
        code: "BUNDLE_COMPONENT_INVALID",
        message: "Component must be a mapping.",
        path: file,
      });
    if (!text.includes("0.1.0") || !text.includes('speckit_version: "==1.0.5"'))
      diagnostics.push({
        code: "BUNDLE_VERSION_UNPINNED",
        message: "Owned version and Spec Kit 1.0.5 must be exact.",
        path: file,
      });
  }

  const workflow = parsedFiles.find(({ file }) => file.endsWith("workflow.yml"))?.text ?? "";
  for (const line of workflow.split("\n").filter((line) => line.trimStart().startsWith("run:"))) {
    if (!/^\s*run:\s+pnpm baseline:(?:verify|check)\s*$/u.test(line) || line.includes("{{")) {
      diagnostics.push({
        code: "WORKFLOW_UNSAFE_SHELL",
        message: "Workflow shell steps must call fixed baseline scripts without interpolation.",
        path: "workflows/typescript-delivery/workflow.yml",
      });
    }
  }
  return sortDiagnostics(diagnostics);
}
