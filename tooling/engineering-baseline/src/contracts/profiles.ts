import { buildSchema, findBreakingChanges } from "graphql";
import { parse as parseYaml } from "yaml";

import { sha256, sortDiagnostics } from "../core/index.js";

import type { Diagnostic } from "../core/index.js";

export type ContractProfile = "asyncapi" | "graphql" | "openapi" | "proto";

const TOOL_PACKAGES = {
  asyncapi: ["@asyncapi/cli", "@asyncapi/modelina"],
  graphql: [
    "@graphql-codegen/cli",
    "@graphql-eslint/eslint-plugin",
    "@graphql-inspector/cli",
    "graphql",
  ],
  openapi: ["@redocly/cli", "@stoplight/prism-cli", "orval", "oasdiff"],
  proto: ["@bufbuild/buf", "@bufbuild/protoc-gen-es"],
} as const;

function sortedObjectKeys(value: unknown, key: string): string[] {
  if (typeof value !== "object" || value === null) return [];
  const child = (value as Record<string, unknown>)[key];
  return typeof child === "object" && child !== null ? Object.keys(child).sort() : [];
}

function openApiSurface(text: string): string[] {
  const document = parseYaml(text) as {
    components?: { schemas?: Record<string, unknown> };
    paths?: Record<string, Record<string, { operationId?: string }>>;
  };
  const operations = Object.values(document.paths ?? {}).flatMap((pathItem) =>
    Object.values(pathItem).flatMap((operation) =>
      typeof operation === "object" && typeof operation.operationId === "string"
        ? [`operation:${operation.operationId}`]
        : [],
    ),
  );
  const types = Object.keys(document.components?.schemas ?? {}).map((name) => `type:${name}`);
  return [...operations, ...types].sort();
}

function asyncApiSurface(text: string): string[] {
  const document: unknown = parseYaml(text);
  if (typeof document !== "object" || document === null) return [];
  const record = document as Record<string, unknown>;
  const components =
    typeof record.components === "object" && record.components !== null ? record.components : {};
  return [
    ...sortedObjectKeys(record, "channels").map((name) => `channel:${name}`),
    ...sortedObjectKeys(record, "operations").map((name) => `operation:${name}`),
    ...sortedObjectKeys(components, "messages").map((name) => `message:${name}`),
    ...sortedObjectKeys(components, "schemas").map((name) => `type:${name}`),
  ].sort();
}

interface ProtoSurface {
  readonly fields: ReadonlyMap<string, string>;
  readonly members: readonly string[];
}

function protoSurface(text: string): ProtoSurface {
  const members = [
    ...Array.from(
      text.matchAll(/\b(?:message|enum|service)\s+(\w+)/gu),
      (match) => `type:${match[1] ?? ""}`,
    ),
    ...Array.from(text.matchAll(/\brpc\s+(\w+)\s*\(/gu), (match) => `rpc:${match[1] ?? ""}`),
  ].sort();
  const fields = new Map<string, string>();
  for (const match of text.matchAll(
    /^\s*(?:optional\s+|repeated\s+)?[\w.]+\s+(\w+)\s*=\s*(\d+)/gmu,
  )) {
    fields.set(match[2] ?? "", match[1] ?? "");
  }
  return { fields, members };
}

function surface(profile: ContractProfile, text: string): string[] {
  if (profile === "openapi") return openApiSurface(text);
  if (profile === "asyncapi") return asyncApiSurface(text);
  if (profile === "graphql") {
    const schema = buildSchema(text);
    return Object.keys(schema.getTypeMap())
      .filter((name) => !name.startsWith("__"))
      .sort()
      .map((name) => `type:${name}`);
  }
  return [...protoSurface(text).members];
}

export function requiredToolPackages(profiles: readonly ContractProfile[]): string[] {
  return [...new Set(profiles.flatMap((profile) => TOOL_PACKAGES[profile]))].sort((left, right) => {
    const openApiOrder = TOOL_PACKAGES.openapi as readonly string[];
    if (profiles.length === 1 && profiles[0] === "openapi")
      return openApiOrder.indexOf(left) - openApiOrder.indexOf(right);
    return left.localeCompare(right);
  });
}

export function validateProfileArtifact(profile: ContractProfile, text: string): Diagnostic[] {
  try {
    const parsedSurface = surface(profile, text);
    const validHeader =
      profile === "openapi"
        ? /^openapi:\s*3\.1\./mu.test(text)
        : profile === "asyncapi"
          ? /^asyncapi:\s*3\./mu.test(text)
          : profile === "proto"
            ? /^syntax\s*=\s*"proto3";/mu.test(text)
            : parsedSurface.length > 0;
    return validHeader
      ? []
      : [
          {
            code: "CONTRACT_ARTIFACT_INVALID",
            message: `Invalid ${profile} contract header.`,
            path: profile,
          },
        ];
  } catch (error: unknown) {
    return [
      {
        code: "CONTRACT_ARTIFACT_INVALID",
        message: error instanceof Error ? error.message : "Contract parsing failed.",
        path: profile,
      },
    ];
  }
}

export function checkProfileCompatibility(
  profile: ContractProfile,
  previous: string,
  current: string,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (profile === "graphql") {
    for (const change of findBreakingChanges(buildSchema(previous), buildSchema(current))) {
      diagnostics.push({
        code: "CONTRACT_BREAKING_CHANGE",
        message: change.description,
        path: profile,
      });
    }
    return sortDiagnostics(diagnostics);
  }

  const previousSurface = surface(profile, previous);
  const currentSurface = new Set(surface(profile, current));
  for (const removed of previousSurface.filter((entry) => !currentSurface.has(entry))) {
    diagnostics.push({
      code: "CONTRACT_BREAKING_CHANGE",
      message: `Removed ${removed}.`,
      path: profile,
    });
  }

  if (profile === "proto") {
    const previousProto = protoSurface(previous);
    const currentProto = protoSurface(current);
    for (const [number, name] of previousProto.fields) {
      const currentName = currentProto.fields.get(number);
      if (currentName !== undefined && currentName !== name) {
        diagnostics.push({
          code: "CONTRACT_BREAKING_CHANGE",
          message: `Protobuf field ${number} changed from ${name} to ${currentName}; removed numbers and names must be reserved.`,
          path: profile,
        });
      }
    }
  }
  return sortDiagnostics(diagnostics);
}

export function generateProfileSummary(profile: ContractProfile, text: string): string {
  return `${JSON.stringify({ digest: sha256(text), profile, surface: surface(profile, text) }, null, 2)}\n`;
}
