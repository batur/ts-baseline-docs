---
name: openapi
description: Create, update, and review OpenAPI documentation for REST APIs. Use when adding or changing API endpoints, request/response DTOs, route metadata, authentication schemes, error envelopes, pagination, filtering, sorting, examples, generated OpenAPI files, SDK contracts, or contract-test expectations.
argument-hint: "[endpoint, schema, route, or API change]"
---

# OpenAPI Documentation Skill

Use this skill when implementing, changing, documenting, or reviewing REST API contracts in this TypeScript architecture baseline.

The goal is to keep API documentation close to implementation while preserving a stable, reusable, machine-readable contract for humans, clients, SDK generation, testing, and review.

## When to use this skill

Use this skill when the task involves any of the following:

- Adding, changing, or removing an API endpoint.
- Adding or changing a request body, response DTO, path parameter, query parameter, header, auth requirement, pagination shape, filtering option, sorting option, or error response.
- Generating or reviewing `docs/openapi/openapi.yaml` or `docs/openapi/openapi.json`.
- Creating route metadata for OpenAPI generation.
- Aligning Zod schemas with OpenAPI schemas.
- Reviewing API examples for accuracy, stability, or sensitive-data exposure.
- Deciding whether contract tests are required.
- Updating SDK-facing or externally consumed API contracts.

## Baseline decisions

- Public API endpoints must be represented in OpenAPI documentation.
- The OpenAPI version is not fixed globally in the baseline.
- Choose the current stable, tooling-compatible OpenAPI version per project.
- Use code-first OpenAPI generation by default.
- Generate OpenAPI from Zod schemas plus route metadata.
- Use spec-first or contract-reviewed OpenAPI only for public, enterprise, external, SDK, or multi-consumer API needs.
- The primary generated document lives at `docs/openapi/openapi.yaml`.
- Optional JSON output may live at `docs/openapi/openapi.json`.
- `/docs` and `/openapi.json` may be exposed in development and staging.
- Production docs exposure depends on API type and security requirements.
- Internal or admin API docs must not be public in production unless intentionally protected.
- Generated OpenAPI must not be stale in CI.

## Source of truth

Default source of truth:

```txt
Zod schemas + route metadata -> generated OpenAPI document
```

Zod provides:

- request body shape
- response DTO shape when modeled
- path/query/header parameter shape when modeled
- validation constraints

Route metadata provides:

- `operationId`
- `tags`
- `summary`
- `description`
- `parameters`
- `requestBody` mapping
- `responses`
- `examples`
- `security`
- deprecation state

Do not assume Zod alone is enough. Operation-level contract data must be explicitly supplied through route metadata or an equivalent framework mechanism.

## Endpoint documentation requirements

Every documented operation must define:

- stable `operationId`
- `tags`
- `summary`
- `description` when useful
- path parameters when applicable
- query parameters when applicable
- headers when applicable
- request body when applicable
- success responses
- relevant error responses
- `security` when protected
- examples for public/external endpoints when useful

The `operationId` is a contract. Treat changing it as a potential breaking change because generated clients or SDKs may depend on it.

## API shape to document

Use the accepted REST API baseline:

- API path versioning: `/api/v1`.
- Resource names: plural `kebab-case`.
- JSON fields: `camelCase`.
- Request bodies use direct DTOs, not top-level request envelopes.
- Success responses use the custom JSON envelope.
- Collection responses include cursor pagination metadata.
- Error responses use the standard error envelope.
- PATCH is the default partial update method.
- PUT is only for full replacement.
- Unsupported query filters must not be documented or accepted.

## DTO and schema naming

Use consistent OpenAPI schema names:

```txt
CreateUserRequest
UpdateUserRequest
UserResponse
UserSuccessResponse
UserCollectionResponse
ApiErrorResponse
CursorPagination
```

Rules:

- Request schema suffix: `Request`.
- Item response schema suffix: `Response`.
- Single success envelope suffix: `SuccessResponse`.
- Collection envelope suffix: `CollectionResponse`.
- Shared/common schemas use stable names such as `ApiMeta`, `ApiError`, `ApiErrorDetail`, and `CursorPagination`.
- Do not expose database row names or persistence models as API schema names.

## Reusable components

Define common OpenAPI components for:

- `ApiMeta`
- success envelope
- collection envelope
- `CursorPagination`
- `ApiErrorDetail`
- `ApiError`
- `ApiErrorResponse`
- common error responses
- auth schemes
- `X-Request-Id` request/response header
- pagination query parameters

Avoid duplicating common envelope and error schemas per endpoint.

## Success response envelope

Single-resource response:

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

Collection response:

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

## Error response envelope

Every API error response must use:

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

Document relevant error responses per endpoint:

- `400 Bad Request`
- `401 Unauthenticated`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `412 Precondition Failed`
- `422 Validation Error`
- `429 Rate Limited`
- `500 Internal Error`
- `502 External Service Error`
- `503 Service Unavailable`
- `504 Gateway Timeout`

Do not return raw stack traces, database errors, provider payloads, tokens, secrets, or internal exception objects in examples or schemas.

## Authentication and authorization documentation

Protected endpoints must include OpenAPI `security` definitions.

Common schemes:

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    apiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
```

Rules:

- Do not document protected endpoints without `security`.
- Document auth method per operation when an endpoint supports multiple auth modes.
- Document `401` for missing/invalid auth.
- Document `403` for authenticated but unauthorized access.
- For tenant/resource enumeration-sensitive endpoints, document `404` behavior when appropriate.

## Request ID headers

Document request correlation:

- Request header: optional `X-Request-Id`.
- Response header: `X-Request-Id`.
- Error body: `error.requestId`.

Every response should include the request id header in the actual implementation and in documentation.

## Pagination, filtering, sorting, and search

For collection endpoints, document only supported query parameters:

- `limit`
- `cursor`
- `sort`
- supported filters
- `search`, if available

Rules:

- Default pagination style is cursor pagination.
- `limit` must document default, min, and max.
- `cursor` must be a string when present.
- Sorting uses field names; descending sort uses `-` prefix, for example `sort=-createdAt`.
- Unsupported filters must not appear in docs and must not be accepted by the API.
- Document stable ordering assumptions when cursor pagination depends on `createdAt + id` or similar compound cursors.

## PATCH and update documentation

For PATCH endpoints, document the accepted update semantics:

- Request body is a direct partial DTO.
- Omitted field means unchanged.
- `null` clears a value only if the field is nullable.
- Empty PATCH body returns `400 EMPTY_UPDATE`.
- Unknown fields return `400 BAD_REQUEST`.
- Known but not allowed or semantically invalid fields return `422`.
- Conflict returns `409`.
- Optimistic concurrency mismatch returns `412`.
- Default success is `200 OK` with the updated resource.

For high-value mutable resources, document ETag / `If-Match` when used.

## Idempotency documentation

For side-effect-producing `POST` endpoints, document `Idempotency-Key` when supported.

Common cases:

- payments
- subscriptions
- email/SMS sending
- external API side effects
- job creation
- billing-relevant AI generation

If idempotency is required by the API, mark the header as required and document retry behavior.

## Examples

Public/external endpoints should include realistic examples.

Example rules:

- Examples must match actual DTO and envelope shapes.
- Do not include secrets, tokens, private API keys, cookies, payment data, raw provider payloads, or sensitive personal data.
- Use safe fake identifiers such as `usr_123`, `org_123`, `prj_123`, `req_123`.
- Keep examples small and focused.

## Code-first workflow

When adding or changing an endpoint:

1. Identify the owning component/module.
2. Define or update Zod request schemas.
3. Define or update response DTO and serializer.
4. Add or update route metadata for OpenAPI.
5. Include stable `operationId`, tags, summary, security, parameters, request body, responses, and examples.
6. Reuse common components for envelopes, errors, pagination, auth, and request id.
7. Generate `docs/openapi/openapi.yaml`.
8. Check generated diff for accidental breaking changes.
9. Update tests when behavior or contract changes.
10. Ensure CI stale-check can detect uncommitted generated OpenAPI changes.

## Review checklist

When reviewing API/OpenAPI changes, verify:

- Is every public endpoint documented?
- Is `operationId` stable and meaningful?
- Does the documented path match `/api/v1` and plural `kebab-case` resources?
- Do request schemas match Zod validation?
- Do response schemas match serializers, not database rows?
- Are success responses wrapped in the standard envelope?
- Are collection responses documented with `pagination`?
- Are relevant error responses documented?
- Does every protected endpoint include `security`?
- Are `X-Request-Id` response headers documented?
- Are filters, sorting, and search documented only when supported?
- Are PATCH semantics documented correctly?
- Is `Idempotency-Key` documented for side-effect POST endpoints?
- Are examples realistic and free of secrets/PII?
- Has generated OpenAPI been committed?
- Would this change require contract tests because the API is external, public, SDK-facing, mobile-consumed, or multi-team consumed?

## Required tests and checks

The OpenAPI skill interacts with the testing standard:

- API behavior tests should cover documented request/response behavior.
- Error envelope tests should cover standard error responses.
- PATCH tests should cover empty body, unknown fields, nullable fields, and success.
- Auth tests should cover `401`, `403`, and tenant-sensitive `404` behavior.
- Contract tests are optional by default.
- Contract tests are required for public, external, SDK, mobile, separate-team, or service-to-service consumers.
- CI should fail if generated OpenAPI is stale.

## Do not

Do not:

- Hand-edit generated OpenAPI unless the project explicitly uses a spec-first workflow.
- Let OpenAPI drift from Zod schemas or serializers.
- Use database row models as OpenAPI response schemas.
- Omit error responses from public endpoint docs.
- Omit `security` from protected endpoint docs.
- Include unsupported query filters in docs.
- Change `operationId` casually.
- Put secrets, tokens, cookies, payment data, raw provider responses, or sensitive personal data in examples.
- Publicly expose internal/admin docs in production without an explicit security decision.

## Output expectation for agents

When this skill is active, produce changes that include:

- Updated route metadata or OpenAPI annotations.
- Updated Zod schemas or DTO references when needed.
- Updated serializer/response schema alignment when needed.
- Regenerated OpenAPI output when generation is part of the project workflow.
- A short review note listing contract-impacting changes.
- A recommendation for contract tests when the API is external or multi-consumer.
