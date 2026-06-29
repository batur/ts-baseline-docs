---
name: api-design
description: Design and review TypeScript REST APIs using the project baseline, REST API Guidelines, /api/v1 versioning, plural kebab-case resources, custom JSON envelopes, cursor pagination, PATCH semantics, stable error contracts, request IDs, idempotency, DTO/serializer boundaries, and OpenAPI impact checks. Use when creating or reviewing HTTP endpoints, controllers, route handlers, API DTOs, serializers, API clients, pagination, filtering, sorting, or request/response contracts.
license: Proprietary. Internal project skill.
compatibility: Designed for VS Code Agent Skills and Agent Skills compatible coding agents working in TypeScript REST API repositories.
metadata:
  project: software-architecture-and-design
  domain: typescript-api-architecture
  version: "1.0.0"
---

# API Design Skill

## When to use this skill

Use this skill when the task touches any HTTP API surface:

- Creating, changing, or reviewing REST endpoints.
- Designing route names, HTTP methods, request DTOs, response DTOs, or serializers.
- Implementing controllers, route handlers, API adapters, or client calls.
- Adding list endpoints, pagination, filtering, sorting, or search.
- Implementing create/update/delete flows.
- Handling API status codes, error responses, request IDs, or idempotency.
- Updating API documentation or OpenAPI metadata.

Do not use this skill for internal-only domain functions unless they expose or affect an API
contract.

## Goal

Design APIs that are predictable, explicit, safe to consume, easy to document, and decoupled from
internal database/domain shapes.

The API contract is a public boundary. Do not let database rows, ORM models, provider SDK responses,
or internal domain objects define the external response shape by accident.

## Core decisions

- Use REST API Guidelines as the default API style.
- Use a custom JSON response envelope, not JSON:API by default.
- JSON:API may be used only as an explicit advanced/public API profile.
- Use path versioning: `/api/v1`.
- Resource names are plural and kebab-case.
- JSON fields use camelCase.
- Request bodies are direct DTO objects; do not wrap requests in a top-level envelope.
- Success responses use a `data` envelope.
- Collection responses use `data` plus `pagination`.
- Error responses use the project error envelope.
- Domain/database/provider objects are serialized into explicit API DTOs.
- OpenAPI documentation must be updated when public API behavior changes.

## Resource and route naming

Use plural kebab-case resource names.

Good:

```txt
/api/v1/users
/api/v1/projects
/api/v1/chat-sessions
/api/v1/payment-methods
/api/v1/billing-subscriptions
```

Avoid:

```txt
/api/v1/getUser
/api/v1/user
/api/v1/paymentMethods
/api/v1/BillingSubscriptions
```

Prefer resource-oriented paths. Use action-like paths only when the operation is not naturally
represented as a resource transition.

Acceptable action-like examples:

```txt
/api/v1/auth/login
/api/v1/auth/logout
/api/v1/webhooks/stripe
/api/v1/files/{fileId}/download-url
```

## HTTP method rules

Use the standard method semantics:

| Method   | Use                                                             |
| -------- | --------------------------------------------------------------- |
| `GET`    | Read list/detail. Must not create side effects.                 |
| `POST`   | Create a resource or trigger an intentional side effect.        |
| `PATCH`  | Partial update. This is the default update method.              |
| `PUT`    | Full replacement only. Do not use for ordinary partial updates. |
| `DELETE` | Delete or revoke a resource.                                    |

Do not use `POST` for ordinary reads just to avoid query parameters, unless the query is too complex
or sensitive and the trade-off is documented.

## Request body rules

Request bodies directly represent input DTOs. Do not use a top-level request envelope.

Good:

```json
{
  "email": "ali@example.com",
  "displayName": "Ali"
}
```

Avoid:

```json
{
  "data": {
    "email": "ali@example.com",
    "displayName": "Ali"
  }
}
```

Validate request bodies at the API boundary with Zod. Use `.strict()` by default so unsupported
fields are rejected.

## Success response envelope

Single-resource success response:

```json
{
  "data": {
    "id": "usr_123",
    "email": "ali@example.com",
    "displayName": "Ali"
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

Collection success response:

```json
{
  "data": [
    {
      "id": "usr_123",
      "displayName": "Ali"
    }
  ],
  "pagination": {
    "limit": 20,
    "nextCursor": "cursor_456",
    "hasNextPage": true
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

Empty collection response:

```json
{
  "data": [],
  "pagination": {
    "limit": 20,
    "nextCursor": null,
    "hasNextPage": false
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

Use `meta.requestId` when useful, and always return the `X-Request-Id` response header where the
HTTP framework allows it.

## Error response envelope

Use the project-standard error envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "details": [
      {
        "field": "email",
        "message": "Email must be valid.",
        "code": "INVALID_EMAIL"
      }
    ],
    "requestId": "req_123"
  }
}
```

Rules:

- `error.code` is stable and machine-readable.
- Client logic must depend on `error.code`, not `error.message`.
- `error.message` must be user-safe.
- Never return stack traces, raw database errors, provider SDK errors, or internal exception
  details.
- Normalize all unknown errors before sending them to clients.

## Status code rules

Use these defaults:

| Status | Use                                                                |
| -----: | ------------------------------------------------------------------ |
|  `200` | Successful read/update with response body.                         |
|  `201` | Resource created. Include `Location` when practical.               |
|  `204` | Successful operation with no body, only when intentionally chosen. |
|  `400` | Malformed or structurally invalid request.                         |
|  `401` | Missing or invalid authentication.                                 |
|  `403` | Authenticated but not authorized.                                  |
|  `404` | Resource not found; may also hide cross-tenant existence.          |
|  `409` | Conflict, duplicate, or state conflict.                            |
|  `412` | Optimistic concurrency mismatch.                                   |
|  `415` | Unsupported media type.                                            |
|  `422` | Syntactically valid but semantically/domain invalid request.       |
|  `429` | Rate limited.                                                      |
|  `500` | Unexpected internal error.                                         |
|  `502` | External provider failure.                                         |
|  `503` | Service unavailable.                                               |
|  `504` | Upstream timeout.                                                  |

Use `400` for syntax, transport, structural, unknown-field, and malformed input problems. Use `422`
for meaningful requests that violate business semantics or domain rules.

## PATCH and update rules

PATCH is the default update method.

Semantics:

- Omitted field means unchanged.
- `null` clears a value only when the field is nullable.
- Non-nullable fields must reject `null`.
- Empty PATCH body returns `400 EMPTY_UPDATE`.
- Unknown fields return `400 BAD_REQUEST`.
- Known but not allowed fields return `422`.
- Unique/state conflicts return `409`.
- Optimistic concurrency mismatch returns `412`.
- Successful PATCH defaults to `200` plus the updated resource.

Example PATCH schema behavior:

```ts
export const UPDATE_USER_SCHEMA = z
  .object({
    displayName: z.string().min(1).max(100).optional(),
    timezone: z.string().min(1).optional(),
    avatarUrl: z.string().url().nullable().optional(),
  })
  .strict()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one field must be provided.",
  });
```

For high-value mutable resources, consider optimistic concurrency with `ETag` and `If-Match`.

## Pagination, filtering, sorting, and search

Use cursor pagination by default for public collection endpoints.

Request:

```txt
GET /api/v1/users?limit=20&cursor=cursor_123
```

Response:

```json
{
  "data": [],
  "pagination": {
    "limit": 20,
    "nextCursor": null,
    "hasNextPage": false
  }
}
```

Rules:

- Default `limit` should be documented.
- Maximum `limit` should be enforced.
- Cursor ordering must be deterministic.
- Prefer stable ordering such as `createdAt DESC, id DESC`.
- Offset pagination is acceptable for small internal/admin lists.
- Filtering is allowlist-based. Unsupported filters return `400`.
- Sorting uses `sort=field` and `sort=-field` for descending.
- Broad text search uses `search=...` when available.

Example:

```txt
GET /api/v1/projects?limit=20&cursor=abc&status=active&sort=-createdAt&search=toyota
```

## Headers

Request headers:

- `Authorization: Bearer <token>` for bearer auth.
- `Content-Type: application/json` for JSON request bodies.
- `Accept: application/json` for JSON APIs.
- `Idempotency-Key` for side-effect-producing POST operations.
- `X-Request-Id` optional client-provided request ID.

Response headers:

- `Content-Type: application/json`.
- `X-Request-Id` for correlation.
- `Location` for created resources when practical.

## Idempotency

Side-effect-producing POST endpoints should support `Idempotency-Key`.

Use idempotency for:

- Payments.
- Subscriptions.
- Email/SMS sending.
- External provider side effects.
- Job creation.
- Billing-relevant AI generation.

Do not ignore idempotency for operations where duplicate requests can charge money, create duplicate
records, send duplicate messages, or trigger irreversible side effects.

## DTO and serializer boundary

Never return database rows, ORM models, provider SDK responses, or domain objects directly from API
handlers.

Use serializers or explicit DTO mapping:

```ts
export function serializeUser(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt.toISOString(),
  };
}
```

Rules:

- Database naming may be snake_case; API JSON is camelCase.
- API response shape is controlled by DTOs/serializers.
- Serializer is the boundary between internal model and API contract.
- Do not leak private fields, secrets, internal state, provider metadata, or tenant-internal
  identifiers.

## Controller and route handler responsibilities

Controllers and route handlers stay thin.

They may:

- Extract auth context.
- Parse path/query/body input.
- Validate input with Zod.
- Call one use-case/application function.
- Serialize the result.
- Return the API envelope.

They must not:

- Contain business policy.
- Build SQL or provider calls directly.
- Return raw DB rows.
- Decide permissions beyond invoking the auth/permission layer.
- Swallow errors instead of using standard error mapping.

## OpenAPI impact

When changing public API behavior, update OpenAPI generation/metadata.

Check:

- `operationId` is stable.
- Request body schema exists.
- Response schema uses the correct envelope.
- Relevant error responses are documented.
- Protected endpoints include security definitions.
- Pagination/filter/sort/search parameters are documented.
- Examples are realistic and contain no secrets or sensitive personal data.

Contract tests are optional by default, but required for public, external, generated-SDK,
mobile-app, separate-team, or service-to-service APIs.

## API design workflow for coding agents

1. Identify the resource and operation.
2. Choose the correct HTTP method.
3. Confirm route naming uses `/api/v1` and plural kebab-case resources.
4. Define or update Zod schemas for body, query, and path params.
5. Keep controller/route handler thin.
6. Call the relevant use-case/application function.
7. Enforce auth and authorization through the standard auth context/policy layer.
8. Serialize internal models into API DTOs.
9. Return the standard success or error envelope.
10. Add or update tests for validation, authorization, errors, PATCH behavior, and tenant boundary
    as applicable.
11. Update OpenAPI route metadata when the public contract changes.

## Review checklist

Before accepting an API change, verify:

- [ ] Route uses `/api/v1` where applicable.
- [ ] Resource names are plural and kebab-case.
- [ ] HTTP method semantics are correct.
- [ ] Request body has no unnecessary top-level envelope.
- [ ] Request/query/path inputs are validated at the boundary.
- [ ] Unknown fields are rejected by default.
- [ ] Response uses `data`, `pagination`, and/or `meta` correctly.
- [ ] Error responses use the standard error envelope.
- [ ] Status codes follow the project mapping.
- [ ] PATCH semantics are correct for omitted, `null`, empty, unknown, and immutable fields.
- [ ] Collection endpoints enforce limit and cursor behavior.
- [ ] Unsupported filters are rejected.
- [ ] Side-effect POST operations consider `Idempotency-Key`.
- [ ] `X-Request-Id` is propagated where possible.
- [ ] Raw DB rows, ORM models, provider responses, or domain objects are not returned directly.
- [ ] Serializer/DTO boundary exists.
- [ ] Controller/route handler is thin.
- [ ] Auth/authorization and tenant boundary are enforced server-side.
- [ ] OpenAPI metadata is updated when the public contract changes.
- [ ] Tests cover critical validation, error, PATCH, auth, and tenant scenarios.

## Common anti-patterns

Avoid:

- RPC-style route names for resource operations, such as `/getUser`.
- Returning arrays directly from collection endpoints without a `data` envelope.
- Returning raw DB rows or ORM entities from controllers.
- Returning provider SDK responses directly to clients.
- Using `PUT` for partial updates.
- Treating omitted PATCH fields as `null`.
- Accepting unknown filters or request body fields silently.
- Depending on `error.message` for client logic.
- Returning stack traces or raw provider errors.
- Putting business rules in route handlers.
- Letting client-side permission checks replace server-side authorization.
