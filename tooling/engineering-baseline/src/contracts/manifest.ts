import { Kind, parse as parseGraphql } from "graphql";
import { parse as parseYaml } from "yaml";

import { sha256, sortDiagnostics } from "../core/index.js";
import { CONTRACT_MANIFEST_SCHEMA } from "../model/index.js";

import type { Diagnostic } from "../core/index.js";

function collectOpenApiSelectors(text: string): Set<string> {
  const document = parseYaml(text) as {
    components?: { schemas?: Record<string, unknown> };
    paths?: Record<string, Record<string, { operationId?: string }>>;
  };
  const selectors = new Set<string>();
  for (const pathItem of Object.values(document.paths ?? {})) {
    for (const operation of Object.values(pathItem)) {
      if (typeof operation === "object" && typeof operation.operationId === "string") {
        selectors.add(`operations:${operation.operationId}`);
      }
    }
  }
  for (const name of Object.keys(document.components?.schemas ?? {}))
    selectors.add(`types:${name}`);
  return selectors;
}

function collectAsyncApiSelectors(text: string): Set<string> {
  const document = parseYaml(text) as {
    components?: { messages?: Record<string, unknown>; schemas?: Record<string, unknown> };
    channels?: Record<string, { messages?: Record<string, { $ref?: string }> }>;
  };
  const selectors = new Set<string>();
  for (const name of Object.keys(document.components?.messages ?? {}))
    selectors.add(`messages:${name}`);
  for (const name of Object.keys(document.components?.schemas ?? {}))
    selectors.add(`types:${name}`);
  return selectors;
}

function collectGraphqlSelectors(text: string): Set<string> {
  const document = parseGraphql(text);
  const selectors = new Set<string>();
  for (const definition of document.definitions) {
    if (
      (definition.kind === Kind.OBJECT_TYPE_DEFINITION ||
        definition.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION ||
        definition.kind === Kind.ENUM_TYPE_DEFINITION) &&
      definition.name.value
    ) {
      selectors.add(`types:${definition.name.value}`);
      if ("fields" in definition) {
        for (const field of definition.fields ?? [])
          selectors.add(`fields:${definition.name.value}.${field.name.value}`);
      }
    }
  }
  return selectors;
}

function collectProtoSelectors(text: string): Set<string> {
  const selectors = new Set<string>();
  for (const match of text.matchAll(/\b(?:message|enum|service)\s+(\w+)/gu))
    selectors.add(`types:${match[1] ?? ""}`);
  for (const match of text.matchAll(/\brpc\s+(\w+)\s*\(/gu))
    selectors.add(`rpcMethods:${match[1] ?? ""}`);
  for (const match of text.matchAll(/^\s*(?:repeated\s+)?[\w.]+\s+(\w+)\s*=\s*\d+/gmu))
    selectors.add(`fields:${match[1] ?? ""}`);
  return selectors;
}

function selectorsFor(
  profile: "asyncapi" | "graphql" | "grpc" | "openapi",
  text: string,
): Set<string> {
  if (profile === "openapi") return collectOpenApiSelectors(text);
  if (profile === "asyncapi") return collectAsyncApiSelectors(text);
  if (profile === "graphql") return collectGraphqlSelectors(text);
  return collectProtoSelectors(text);
}

export function validateContractManifest(
  manifestInput: unknown,
  artifacts: Readonly<Record<string, string>>,
  manifestPath = "contract-manifest.yaml",
): Diagnostic[] {
  const parsed = CONTRACT_MANIFEST_SCHEMA.safeParse(manifestInput);
  if (!parsed.success) {
    return parsed.error.issues.map((issue) => ({
      code: "CONTRACT_MANIFEST_INVALID",
      message: issue.message,
      path: manifestPath,
    }));
  }

  const diagnostics: Diagnostic[] = [];
  for (const contract of parsed.data.contracts) {
    const artifact = artifacts[contract.artifact];
    if (artifact === undefined) {
      diagnostics.push({
        code: "CONTRACT_ARTIFACT_MISSING",
        message: `Missing ${contract.artifact}.`,
        path: manifestPath,
      });
      continue;
    }
    if (sha256(artifact) !== contract.artifactSha256) {
      diagnostics.push({
        code: "CONTRACT_DIGEST_STALE",
        message: `Digest does not match ${contract.artifact}.`,
        path: manifestPath,
      });
    }

    let available: Set<string>;
    try {
      available = selectorsFor(contract.profile, artifact);
    } catch (error: unknown) {
      diagnostics.push({
        code: "CONTRACT_ARTIFACT_INVALID",
        message: error instanceof Error ? error.message : "Contract parsing failed.",
        path: contract.artifact,
      });
      continue;
    }
    for (const [kind, values] of Object.entries(contract.selectors)) {
      for (const value of values ?? []) {
        if (!available.has(`${kind}:${value}`)) {
          diagnostics.push({
            code: "CONTRACT_SELECTOR_STALE",
            message: `${kind}:${value} does not resolve in ${contract.artifact}.`,
            path: manifestPath,
          });
        }
      }
    }
  }
  return sortDiagnostics(diagnostics);
}
