import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { parse as parseYaml } from "yaml";

import { validateContractManifest } from "./contracts/manifest.js";
import {
  checkProfileCompatibility,
  generateProfileSummary,
  validateProfileArtifact,
} from "./contracts/profiles.js";
import { normalizeRepositoryPath, sortDiagnostics } from "./core/index.js";
import { CONTRACT_MANIFEST_SCHEMA, VERIFICATION_SCHEMA } from "./model/index.js";
import { validateGateRecord } from "./specification/gates.js";
import {
  parseSpecificationText,
  validateSpecificationText,
} from "./specification/specification.js";
import { generateTraceabilityReport } from "./traceability/traceability.js";

import type { Diagnostic } from "./core/index.js";

const REPOSITORY_ROOT = process.cwd();
const FEATURE_ROOT = path.join(REPOSITORY_ROOT, "specs/001-engineering-baseline");
const TRACEABILITY_PATH = path.join(FEATURE_ROOT, "traceability.json");

async function loadFeatureSources() {
  const directory = path.join(FEATURE_ROOT, "acceptance");
  const names = (await readdir(directory)).filter((name) => name.endsWith(".feature")).sort();
  return Promise.all(
    names.map(async (name) => ({
      path: normalizeRepositoryPath(path.relative(REPOSITORY_ROOT, path.join(directory, name))),
      text: await readFile(path.join(directory, name), "utf8"),
    })),
  );
}

async function validateRepository(): Promise<Diagnostic[]> {
  const specText = await readFile(path.join(FEATURE_ROOT, "spec.md"), "utf8");
  const featureSources = await loadFeatureSources();
  const diagnostics = validateSpecificationText(
    specText,
    featureSources,
    "specs/001-engineering-baseline/spec.md",
  );
  diagnostics.push(
    ...(await validateGateRecord(
      await readFile(path.join(FEATURE_ROOT, "checklists/gate-1.md"), "utf8"),
      FEATURE_ROOT,
      "specs/001-engineering-baseline/checklists/gate-1.md",
    )),
  );
  diagnostics.push(
    ...(await validateGateRecord(
      await readFile(path.join(FEATURE_ROOT, "checklists/gate-2.md"), "utf8"),
      FEATURE_ROOT,
      "specs/001-engineering-baseline/checklists/gate-2.md",
      REPOSITORY_ROOT,
    )),
  );

  const manifestPath = path.join(FEATURE_ROOT, "contracts/engineering-baseline.contracts.yaml");
  const manifest: unknown = parseYaml(await readFile(manifestPath, "utf8"));
  const parsedManifest = CONTRACT_MANIFEST_SCHEMA.safeParse(manifest);
  if (parsedManifest.success) {
    const artifacts: Record<string, string> = {};
    for (const contract of parsedManifest.data.contracts)
      artifacts[contract.artifact] = await readFile(
        path.join(REPOSITORY_ROOT, contract.artifact),
        "utf8",
      );
    diagnostics.push(
      ...validateContractManifest(
        manifest,
        artifacts,
        normalizeRepositoryPath(path.relative(REPOSITORY_ROOT, manifestPath)),
      ),
    );

    const parsedSpec = parseSpecificationText(specText, featureSources);
    const requirementIds = new Set(parsedSpec.requirementIds);
    const criterionIds = new Set(parsedSpec.successCriterionIds);
    for (const contract of parsedManifest.data.contracts) {
      for (const id of contract.requirementIds)
        if (!requirementIds.has(id))
          diagnostics.push({
            code: "CONTRACT_DANGLING_REQUIREMENT",
            message: `${id} is not defined.`,
            path: normalizeRepositoryPath(path.relative(REPOSITORY_ROOT, manifestPath)),
          });
      for (const id of contract.successCriterionIds)
        if (!criterionIds.has(id))
          diagnostics.push({
            code: "CONTRACT_DANGLING_CRITERION",
            message: `${id} is not defined.`,
            path: normalizeRepositoryPath(path.relative(REPOSITORY_ROOT, manifestPath)),
          });
    }
  } else {
    diagnostics.push(
      ...validateContractManifest(
        manifest,
        {},
        normalizeRepositoryPath(path.relative(REPOSITORY_ROOT, manifestPath)),
      ),
    );
  }
  return sortDiagnostics(diagnostics);
}

async function traceabilityReport() {
  const specText = await readFile(path.join(FEATURE_ROOT, "spec.md"), "utf8");
  const featureSources = await loadFeatureSources();
  const parsedSpec = parseSpecificationText(specText, featureSources);
  const manifestPath = path.join(FEATURE_ROOT, "contracts/engineering-baseline.contracts.yaml");
  const manifest = CONTRACT_MANIFEST_SCHEMA.parse(parseYaml(await readFile(manifestPath, "utf8")));
  const verification = VERIFICATION_SCHEMA.parse(
    parseYaml(await readFile(path.join(FEATURE_ROOT, "verification.yaml"), "utf8")),
  );

  return generateTraceabilityReport({
    contracts: manifest.contracts.map((contract) => ({
      artifact: contract.artifact,
      manifest: normalizeRepositoryPath(path.relative(REPOSITORY_ROOT, manifestPath)),
      profile: contract.profile,
      requirementIds: contract.requirementIds,
      selectors: Object.entries(contract.selectors).flatMap(([kind, values]) =>
        (values ?? []).map((value) => `${kind}:${value}`),
      ),
    })),
    evidence: verification.evidence,
    feature: manifest.feature,
    requirementIds: parsedSpec.requirementIds,
    scenarios: parsedSpec.scenarios,
    successCriterionIds: parsedSpec.successCriterionIds,
  });
}

async function profileDiagnostics(): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  for (const profile of ["openapi", "asyncapi", "graphql", "proto"] as const) {
    const extension = profile === "graphql" ? "graphql" : profile === "proto" ? "proto" : "yaml";
    const root = path.join(
      REPOSITORY_ROOT,
      "tooling/engineering-baseline/fixtures/contracts",
      profile,
    );
    const previous = await readFile(path.join(root, `previous.${extension}`), "utf8");
    const current = await readFile(path.join(root, `current.${extension}`), "utf8");
    diagnostics.push(...validateProfileArtifact(profile, current));
    diagnostics.push(...checkProfileCompatibility(profile, previous, current));
    generateProfileSummary(profile, current);
  }
  return sortDiagnostics(diagnostics);
}

function printAndExit(diagnostics: readonly Diagnostic[]): void {
  if (diagnostics.length === 0) {
    process.stdout.write("Engineering baseline verification passed.\n");
    return;
  }
  for (const diagnostic of diagnostics)
    process.stderr.write(
      `${diagnostic.path}:${String(diagnostic.line ?? 1)} [${diagnostic.code}] ${diagnostic.message}\n`,
    );
  process.exitCode = 1;
}

async function main(): Promise<void> {
  const command = process.argv[2];
  if (command === "specification") {
    printAndExit(await validateRepository());
  } else if (command === "traceability-generate") {
    await writeFile(
      TRACEABILITY_PATH,
      `${JSON.stringify(await traceabilityReport(), null, 2)}\n`,
      "utf8",
    );
    process.stdout.write(
      `${normalizeRepositoryPath(path.relative(REPOSITORY_ROOT, TRACEABILITY_PATH))} generated.\n`,
    );
  } else if (command === "traceability-check") {
    const expected = `${JSON.stringify(await traceabilityReport(), null, 2)}\n`;
    const actual = await readFile(TRACEABILITY_PATH, "utf8").catch(() => "");
    printAndExit(
      actual === expected
        ? []
        : [
            {
              code: "TRACEABILITY_DRIFT",
              message: "Generated traceability report is stale.",
              path: normalizeRepositoryPath(path.relative(REPOSITORY_ROOT, TRACEABILITY_PATH)),
            },
          ],
    );
  } else if (command === "profiles") {
    printAndExit(await profileDiagnostics());
  } else {
    process.stderr.write(
      "Usage: cli.ts specification|traceability-generate|traceability-check|profiles\n",
    );
    process.exitCode = 2;
  }
}

await main();
