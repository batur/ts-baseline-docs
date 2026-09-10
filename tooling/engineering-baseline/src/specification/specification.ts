import { parseMarkdownDocument, sortDiagnostics } from "../core/index.js";

import type { Diagnostic } from "../core/index.js";

export interface FeatureSource {
  readonly path: string;
  readonly text: string;
}

export interface ParsedScenario {
  readonly name: string;
  readonly path: string;
  readonly requirementIds: readonly string[];
  readonly wip: boolean;
}

export interface ParsedSpecification {
  readonly lane: string;
  readonly requirementIds: readonly string[];
  readonly scenarios: readonly ParsedScenario[];
  readonly status: string;
  readonly successCriterionIds: readonly string[];
}

function definitionIds(body: string, prefix: "FR" | "SC"): { id: string; line: number }[] {
  const pattern = new RegExp(`^- \\*\\*(${prefix}-\\d{3})\\*\\*:`, "u");
  return body.split("\n").flatMap((line, index) => {
    const match = pattern.exec(line);
    return match === null ? [] : [{ id: match[1] ?? "", line: index + 1 }];
  });
}

export function parseFeatureSources(sources: readonly FeatureSource[]): ParsedScenario[] {
  return sources.flatMap((source) => {
    let pendingTags: string[] = [];
    let featureTags: string[] = [];
    const scenarios: ParsedScenario[] = [];

    for (const line of source.text.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("@")) {
        pendingTags.push(...trimmed.split(/\s+/u));
      } else if (trimmed.startsWith("Feature:")) {
        featureTags = pendingTags;
        pendingTags = [];
      } else if (/^Scenario(?: Outline)?:/u.test(trimmed)) {
        const tags = [...featureTags, ...pendingTags];
        scenarios.push({
          name: trimmed.replace(/^Scenario(?: Outline)?:\s*/u, ""),
          path: source.path,
          requirementIds: tags.filter((tag) => /^@FR-\d{3}$/u.test(tag)).map((tag) => tag.slice(1)),
          wip: tags.includes("@wip"),
        });
        pendingTags = [];
      } else if (trimmed.length > 0 && !trimmed.startsWith("#")) {
        pendingTags = [];
      }
    }

    return scenarios;
  });
}

export function parseSpecificationText(
  specText: string,
  featureSources: readonly FeatureSource[],
): ParsedSpecification {
  const document = parseMarkdownDocument(specText);
  const lane = document.frontmatter.lane;
  const status = document.frontmatter.status;
  return {
    lane: typeof lane === "string" ? lane : "",
    requirementIds: definitionIds(document.body, "FR").map(({ id }) => id),
    scenarios: parseFeatureSources(featureSources),
    status: typeof status === "string" ? status : "",
    successCriterionIds: definitionIds(document.body, "SC").map(({ id }) => id),
  };
}

export function validateSpecificationText(
  specText: string,
  featureSources: readonly FeatureSource[],
  specPath = "spec.md",
): Diagnostic[] {
  const document = parseMarkdownDocument(specText);
  const requirements = definitionIds(document.body, "FR");
  const criteria = definitionIds(document.body, "SC");
  const parsed = parseSpecificationText(specText, featureSources);
  const diagnostics: Diagnostic[] = [];

  for (const group of [requirements, criteria]) {
    const seen = new Set<string>();
    for (const definition of group) {
      if (seen.has(definition.id)) {
        diagnostics.push({
          code: "SPEC_DUPLICATE_ID",
          line: definition.line,
          message: `Duplicate identifier ${definition.id}.`,
          path: specPath,
        });
      }
      seen.add(definition.id);
    }
  }

  const requirementSet = new Set(parsed.requirementIds);
  for (const scenario of parsed.scenarios) {
    for (const requirementId of scenario.requirementIds) {
      if (!requirementSet.has(requirementId)) {
        diagnostics.push({
          code: "GHERKIN_DANGLING_REQUIREMENT",
          message: `Scenario '${scenario.name}' references unknown ${requirementId}.`,
          path: scenario.path,
        });
      }
    }
    if (parsed.status === "complete" && scenario.wip) {
      diagnostics.push({
        code: "GHERKIN_COMPLETED_WIP",
        message: `Completed feature scenario '${scenario.name}' is marked @wip.`,
        path: scenario.path,
      });
    }
  }

  if (parsed.lane === "full") {
    const scenarioRequirements = new Set(
      parsed.scenarios.flatMap(({ requirementIds }) => requirementIds),
    );
    for (const requirementId of parsed.requirementIds) {
      if (!scenarioRequirements.has(requirementId)) {
        diagnostics.push({
          code: "GHERKIN_MISSING_SCENARIO",
          message: `${requirementId} has no tagged scenario.`,
          path: specPath,
        });
      }
    }
  }

  for (const { id, line } of criteria) {
    const evidencePattern = new RegExp(`^\\|\\s*${id}\\s*\\|\\s*[^|\\s][^|]*\\|`, "mu");
    if (!evidencePattern.test(document.body)) {
      diagnostics.push({
        code: "SPEC_MISSING_EVIDENCE",
        line,
        message: `${id} has no declared evidence.`,
        path: specPath,
      });
    }
  }

  document.body.split("\n").forEach((line, index) => {
    if (/\[NEEDS CLARIFICATION(?::[^\]]*)?\]|\b(?:TODO|TBD|PLACEHOLDER)\b/u.test(line)) {
      diagnostics.push({
        code: "SPEC_UNRESOLVED_CLARIFICATION",
        line: index + 1,
        message: "Unresolved clarification marker.",
        path: specPath,
      });
    }
  });

  return sortDiagnostics(diagnostics);
}
