# API Standard

## Style

Default API style is RESTful HTTP with a custom JSON envelope and OpenAPI documentation.

## Versioning

Path-based versioning is used:

```txt
/api/v1
```

## Resource Naming

- Resource names are plural.
- URL segments use kebab-case.

Examples:

```txt
/users
/projects
/chat-sessions
/payment-methods
```

## HTTP Methods

- `GET`: list/detail
- `POST`: create/action with side effect
- `PATCH`: partial update
- `PUT`: full replacement only
- `DELETE`: delete

## Success Envelope

Single resource:

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

Collection:

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

## Error Envelope

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

## Status Codes

- `400`: malformed/structural request
- `401`: missing/invalid authentication
- `403`: authenticated but not authorized
- `404`: not found, or cross-tenant existence hiding
- `409`: conflict
- `412`: optimistic concurrency mismatch
- `415`: unsupported media type
- `422`: semantic/domain validation failure
- `429`: rate limited
- `500`: internal error
- `502`: external provider failure
- `503`: service unavailable
- `504`: upstream timeout

## PATCH Semantics

- PATCH is the default partial update method.
- Omitted field means no change.
- `null` clears value only if nullable.
- Empty PATCH body returns `400 EMPTY_UPDATE`.
- Unknown fields return `400`.
- Known but disallowed fields return `422`.
- Successful PATCH returns `200` plus updated resource by default.

## Pagination

Cursor pagination is preferred:

```txt
GET /api/v1/users?limit=20&cursor=cursor_123&sort=-createdAt
```

Collection endpoints must document supported filters, sorting and search parameters.

## Idempotency

Side-effect-producing POST endpoints should support `Idempotency-Key`, especially for payment, subscription, external API side effects, email/SMS sending and billing-relevant AI generation.

## OpenAPI

- OpenAPI documentation is generated code-first from Zod schemas and route metadata.
- The OpenAPI version is selected per project based on current stable version and tooling compatibility.
- Main output: `docs/openapi/openapi.yaml`
- Optional JSON output: `docs/openapi/openapi.json`
- Protected endpoints must document security definitions.
- Generated OpenAPI must not be stale in CI.
