import { z } from "zod";

import { API_VERSION_PREFIX } from "../../shared/http/index.js";

import {
  CREATE_USER_SCHEMA,
  LIST_USERS_QUERY_SCHEMA,
  USER_COLLECTION_ENVELOPE_SCHEMA,
  USER_ERROR_ENVELOPE_SCHEMA,
  USER_SUCCESS_ENVELOPE_SCHEMA,
} from "./user.schema.js";

import type { ApiRouteMetadata } from "../../shared/http/index.js";

export const USERS_API_ROUTES = [
  {
    method: "POST",
    operationId: "createUser",
    parameters: [
      {
        description: "Idempotency key for side-effect-producing create requests.",
        in: "header",
        name: "Idempotency-Key",
        required: false,
        schema: z.string().min(1),
      },
    ],
    path: `${API_VERSION_PREFIX}/users`,
    requestBodySchema: CREATE_USER_SCHEMA,
    responses: {
      201: USER_SUCCESS_ENVELOPE_SCHEMA,
      409: USER_ERROR_ENVELOPE_SCHEMA,
      422: USER_ERROR_ENVELOPE_SCHEMA,
    },
    security: [
      {
        scheme: "bearerAuth",
      },
    ],
    summary: "Create a user.",
    tags: ["Users"],
  },
  {
    method: "GET",
    operationId: "listUsers",
    parameters: [
      {
        description: "Tenant boundary for the user collection.",
        in: "query",
        name: "organizationId",
        required: true,
        schema: z.string().min(1),
      },
      {
        description: "Maximum number of users to return.",
        in: "query",
        name: "limit",
        required: false,
        schema: z.coerce.number().int().min(1).max(100),
      },
      {
        description: "Opaque cursor from the previous page.",
        in: "query",
        name: "cursor",
        required: false,
        schema: z.string().min(1),
      },
    ],
    path: `${API_VERSION_PREFIX}/users`,
    requestBodySchema: LIST_USERS_QUERY_SCHEMA,
    responses: {
      200: USER_COLLECTION_ENVELOPE_SCHEMA,
      400: USER_ERROR_ENVELOPE_SCHEMA,
      401: USER_ERROR_ENVELOPE_SCHEMA,
    },
    security: [
      {
        scheme: "bearerAuth",
      },
    ],
    summary: "List users with cursor pagination.",
    tags: ["Users"],
  },
] as const satisfies readonly ApiRouteMetadata[];
