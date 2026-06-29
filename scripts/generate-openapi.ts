import { mkdir, writeFile } from "node:fs/promises";

import { format, resolveConfig } from "prettier";
import { stringify } from "yaml";
import { z } from "zod";

import { APP_API_ROUTES } from "../src/openapi.js";

import type { ApiRouteMetadata, HttpStatusCode } from "../src/shared/http/index.js";

type JsonPrimitive = boolean | number | string | null;
type JsonValue = JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue };
type MutableJsonObject = Record<string, JsonValue>;

const OPENAPI_OUTPUT_DIR = "docs/openapi";

const commonResponseDescriptions = new Map<HttpStatusCode, string>([
  [400, "Malformed or structurally invalid request."],
  [401, "Missing or invalid authentication."],
  [403, "Authenticated but not authorized."],
  [404, "Resource not found."],
  [409, "Conflict."],
  [412, "Optimistic concurrency mismatch."],
  [415, "Unsupported media type."],
  [422, "Semantic or domain validation failure."],
  [429, "Rate limited."],
  [500, "Internal server error."],
  [502, "External provider failure."],
  [503, "Service unavailable."],
  [504, "Upstream timeout."],
]);

function schemaToJson(schema: z.ZodType): JsonValue {
  return z.toJSONSchema(schema, {
    target: "draft-7",
  }) as JsonValue;
}

function createOpenApiDocument(routes: readonly ApiRouteMetadata[]): JsonValue {
  return {
    components: {
      securitySchemes: {
        bearerAuth: {
          bearerFormat: "JWT",
          scheme: "bearer",
          type: "http",
        },
      },
    },
    info: {
      title: "TypeScript Baseline API",
      version: "1.0.0",
    },
    openapi: "3.1.0",
    paths: createPaths(routes),
  };
}

function createPaths(routes: readonly ApiRouteMetadata[]): JsonValue {
  const paths: Record<string, MutableJsonObject> = {};

  for (const route of routes) {
    const pathItem = paths[route.path] ?? {};
    pathItem[route.method.toLowerCase()] = createOperation(route);
    paths[route.path] = pathItem;
  }

  return paths;
}

function createOperation(route: ApiRouteMetadata): JsonValue {
  return {
    operationId: route.operationId,
    parameters: route.parameters.map((parameter) => ({
      description: parameter.description,
      in: parameter.in,
      name: parameter.name,
      required: parameter.required,
      schema: schemaToJson(parameter.schema),
    })),
    ...(route.requestBodySchema === undefined
      ? {}
      : {
          requestBody: {
            content: {
              "application/json": {
                schema: schemaToJson(route.requestBodySchema),
              },
            },
            required: true,
          },
        }),
    responses: createResponses(route),
    security: route.security.map((requirement) => ({
      [requirement.scheme]: [],
    })),
    summary: route.summary,
    tags: route.tags,
  };
}

function createResponses(route: ApiRouteMetadata): JsonValue {
  const responses: MutableJsonObject = {};

  for (const [status, schema] of Object.entries(route.responses)) {
    const statusCode = Number(status) as HttpStatusCode;
    responses[status] = {
      content: {
        "application/json": {
          schema: schemaToJson(schema),
        },
      },
      description: commonResponseDescriptions.get(statusCode) ?? "Successful response.",
    };
  }

  return responses;
}

const document = createOpenApiDocument(APP_API_ROUTES);
const documentJson = JSON.stringify(document, null, 2);
const prettierOptions = (await resolveConfig(".")) ?? {};

await mkdir(OPENAPI_OUTPUT_DIR, {
  recursive: true,
});
await writeFile(
  `${OPENAPI_OUTPUT_DIR}/openapi.json`,
  await format(documentJson, {
    ...prettierOptions,
    parser: "json",
  }),
);
await writeFile(
  `${OPENAPI_OUTPUT_DIR}/openapi.yaml`,
  await format(stringify(document), {
    ...prettierOptions,
    parser: "yaml",
  }),
);
