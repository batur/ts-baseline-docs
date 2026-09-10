import { sha256 } from "../core/index.js";

export interface TraceabilityInput {
  readonly contracts: readonly {
    readonly artifact: string;
    readonly manifest: string;
    readonly profile: "asyncapi" | "graphql" | "grpc" | "openapi";
    readonly requirementIds: readonly string[];
    readonly selectors: readonly string[];
  }[];
  readonly evidence: readonly {
    readonly id: string;
    readonly requirementIds: readonly string[];
    readonly successCriterionIds: readonly string[];
  }[];
  readonly feature: string;
  readonly requirementIds: readonly string[];
  readonly scenarios: readonly {
    readonly name: string;
    readonly path: string;
    readonly requirementIds: readonly string[];
  }[];
  readonly successCriterionIds: readonly string[];
}

export interface TraceabilityReport {
  readonly feature: string;
  readonly relationships: readonly {
    readonly contractElements: readonly {
      artifact: string;
      manifest: string;
      profile: string;
      selector: string;
    }[];
    readonly evidence: readonly string[];
    readonly requirementId: string;
    readonly scenarios: readonly string[];
    readonly successCriteria: readonly string[];
  }[];
  readonly schemaVersion: 1;
  readonly sourceDigest: string;
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

export function generateTraceabilityReport(input: TraceabilityInput): TraceabilityReport {
  const normalized = {
    contracts: [...input.contracts].sort((left, right) =>
      left.artifact.localeCompare(right.artifact),
    ),
    evidence: [...input.evidence].sort((left, right) => left.id.localeCompare(right.id)),
    feature: input.feature,
    requirementIds: uniqueSorted(input.requirementIds),
    scenarios: [...input.scenarios].sort((left, right) =>
      `${left.path}#${left.name}`.localeCompare(`${right.path}#${right.name}`),
    ),
    successCriterionIds: uniqueSorted(input.successCriterionIds),
  };

  return {
    feature: input.feature,
    relationships: normalized.requirementIds.map((requirementId) => ({
      contractElements: normalized.contracts
        .filter((contract) => contract.requirementIds.includes(requirementId))
        .flatMap((contract) =>
          contract.selectors.map((selector) => ({
            artifact: contract.artifact,
            manifest: contract.manifest,
            profile: contract.profile,
            selector,
          })),
        )
        .sort((left, right) =>
          `${left.artifact}:${left.selector}`.localeCompare(`${right.artifact}:${right.selector}`),
        ),
      evidence: uniqueSorted(
        normalized.evidence
          .filter(({ requirementIds }) => requirementIds.includes(requirementId))
          .map(({ id }) => id),
      ),
      requirementId,
      scenarios: uniqueSorted(
        normalized.scenarios
          .filter(({ requirementIds }) => requirementIds.includes(requirementId))
          .map(({ name, path }) => `${path}#${name}`),
      ),
      successCriteria: uniqueSorted(
        normalized.evidence
          .filter(({ requirementIds }) => requirementIds.includes(requirementId))
          .flatMap(({ successCriterionIds }) => successCriterionIds),
      ),
    })),
    schemaVersion: 1,
    sourceDigest: sha256(`${JSON.stringify(normalized)}\n`),
  };
}
