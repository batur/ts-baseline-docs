import type { HttpMethod, HttpStatusCode } from "./http-types.js";
import type { z } from "zod";

export interface ApiParameterMetadata {
  readonly description: string;
  readonly in: "header" | "path" | "query";
  readonly name: string;
  readonly required: boolean;
  readonly schema: z.ZodType;
}

export interface ApiSecurityRequirement {
  readonly scheme: "bearerAuth";
}

export interface ApiRouteMetadata {
  readonly method: HttpMethod;
  readonly operationId: string;
  readonly parameters: readonly ApiParameterMetadata[];
  readonly path: string;
  readonly requestBodySchema?: z.ZodType;
  readonly responses: Readonly<Partial<Record<HttpStatusCode, z.ZodType>>>;
  readonly security: readonly ApiSecurityRequirement[];
  readonly summary: string;
  readonly tags: readonly string[];
}
