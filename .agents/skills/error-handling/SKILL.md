---
name: error-handling
description:
  Design, implement, or review TypeScript REST API error handling. Use when adding API errors,
  AppError/DomainError classes, HTTP status mapping, Zod error mapping, PATCH/update errors,
  external provider failures, logging/error-tracker integration, or when reviewing whether client
  responses are safe and consistent.
---

# Error Handling Skill

## When to use this skill

Use this skill when a task touches API error behavior, exception modeling, validation error mapping,
HTTP status codes, PATCH/update failure behavior, external provider failures, global error handlers,
logging of failures, or review of client-facing error responses.

Typical triggers:

- Add or modify an API endpoint that can fail.
- Add a new domain/application error.
- Map Zod validation errors to API responses.
- Decide between `400`, `422`, `401`, `403`, `404`, `409`, `412`, `429`, or `5xx`.
- Implement a global error handler.
- Handle database/provider/SDK errors.
- Review whether an error response leaks internal details.
- Add PATCH/update behavior and its error cases.

## Goal

Produce predictable, safe, machine-readable API errors while keeping internal details out of client
responses.

The standard error response shape is:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "User-safe error message.",
    "details": [],
    "requestId": "req_123"
  }
}
```

Core principles:

- `error.code` is the stable contract.
- `error.message` is user-safe and may change.
- Client logic must depend on `error.code`, not `error.message`.
- Raw internal, database, provider, SDK, and stack trace details must never be returned to clients.
- Every error response must include `requestId`.
- Logs may contain more diagnostic context, but never secrets, tokens, raw request bodies, or raw
  provider responses.

## Required response envelope

Use this response shape for every API error:

```ts
export type ApiErrorDetail = {
  field?: string;
  message: string;
  code?: string;
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
    requestId: string;
  };
};
```

Rules:

- Do not return bare strings, arrays, framework-native error objects, or raw thrown errors.
- Do not expose stack traces in the response body.
- Do not expose raw database/provider messages unless explicitly sanitized.
- Keep `details` user-safe and specific enough for clients/forms to react.

## HTTP status mapping

Use these mappings unless the project has an accepted ADR that overrides them.

| Situation                                         | Status | Default code               |
| ------------------------------------------------- | -----: | -------------------------- |
| Malformed JSON                                    |    400 | `BAD_REQUEST`              |
| Empty required body                               |    400 | `BAD_REQUEST`              |
| Invalid content type                              |    415 | `UNSUPPORTED_MEDIA_TYPE`   |
| Invalid path/query syntax                         |    400 | `BAD_REQUEST`              |
| Unknown request fields                            |    400 | `BAD_REQUEST`              |
| Structural/schema input issue                     |    400 | `VALIDATION_ERROR`         |
| Semantic/domain validation issue                  |    422 | `VALIDATION_ERROR`         |
| Missing/invalid auth                              |    401 | `UNAUTHENTICATED`          |
| Authenticated but not authorized                  |    403 | `FORBIDDEN`                |
| Resource not found                                |    404 | `NOT_FOUND`                |
| Cross-tenant access where existence must not leak |    404 | `NOT_FOUND`                |
| Duplicate/unique/state conflict                   |    409 | `CONFLICT`                 |
| ETag/If-Match mismatch                            |    412 | `PRECONDITION_FAILED`      |
| Rate limit exceeded                               |    429 | `RATE_LIMITED`             |
| Unexpected server error                           |    500 | `INTERNAL_ERROR`           |
| External provider failure                         |    502 | `EXTERNAL_SERVICE_ERROR`   |
| Service unavailable                               |    503 | `SERVICE_UNAVAILABLE`      |
| External provider timeout                         |    504 | `EXTERNAL_SERVICE_TIMEOUT` |

Mnemonic:

- `400` = request is malformed or structurally invalid.
- `422` = request is well-formed but semantically/domain-invalid.
- `401` = the server does not know who the caller is.
- `403` = the server knows the caller but the caller is not allowed.
- `404` = the resource does not exist from this caller's perspective.

## Standard error codes

Global error codes are for generic API-level failures:

```ts
export const ERROR_CODE = {
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  PRECONDITION_FAILED: "PRECONDITION_FAILED",
  UNSUPPORTED_MEDIA_TYPE: "UNSUPPORTED_MEDIA_TYPE",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  EXTERNAL_SERVICE_TIMEOUT: "EXTERNAL_SERVICE_TIMEOUT",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];
```

Domain/component-specific codes live inside the owning component:

```ts
export const USER_ERROR_CODE = {
  USER_NOT_FOUND: "USER_NOT_FOUND",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  USER_STATUS_TRANSITION_NOT_ALLOWED: "USER_STATUS_TRANSITION_NOT_ALLOWED",
} as const;
```

Rules:

- Use stable `SCREAMING_SNAKE_CASE` string codes.
- Do not make clients parse natural-language messages.
- Keep domain-specific codes in the relevant module/component.

## AppError and domain errors

Application/API-level errors may carry HTTP status codes:

```ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: ApiErrorDetail[],
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}
```

Rules:

- `AppError` is practical at the application/API boundary.
- Pure domain entities/value objects should avoid direct HTTP status knowledge.
- Pure domain errors can be mapped to `AppError` or API errors at the application/API boundary.
- Unknown thrown values must be normalized by the global error handler.

## Zod error mapping

Use Zod for runtime boundary validation, but never return raw `ZodError` to clients.

Map Zod issues to `ApiErrorDetail[]`:

```ts
function mapZodIssuesToDetails(error: ZodError): ApiErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join(".") : undefined,
    message: issue.message,
    code: "INVALID_FIELD",
  }));
}
```

Rules:

- API boundary validation should use `safeParse` when producing custom error responses.
- Startup/fail-fast validation, such as env parsing, may use `parse`.
- Unknown fields from `.strict()` schemas are `400`.
- Semantic refinements may map to `422` when the request is structurally valid but invalid for
  business/domain reasons.

## PATCH/update error rules

PATCH has strict semantics:

- Omitted field = unchanged.
- `null` = clear only when the field is nullable.
- Empty PATCH body = `400 EMPTY_UPDATE`.
- Unknown field = `400 BAD_REQUEST` or `400 VALIDATION_ERROR`.
- Known but not allowed field = `422 VALIDATION_ERROR` or domain-specific code.
- Unique/state conflict = `409 CONFLICT`.
- Optimistic concurrency mismatch = `412 PRECONDITION_FAILED`.
- Successful PATCH defaults to `200` with the updated resource.

Example empty update error:

```json
{
  "error": {
    "code": "EMPTY_UPDATE",
    "message": "At least one field must be provided.",
    "requestId": "req_123"
  }
}
```

## Global error handling workflow

When implementing or reviewing a global error handler, follow this sequence:

1. Get or create `requestId`.
2. Normalize the thrown value into an internal error descriptor.
3. Determine status code and stable `error.code`.
4. Produce a safe client error envelope.
5. Log a structured error event with `requestId`, status, route, method, and error code.
6. Send alertable server/provider failures to the error tracker when configured.
7. Never leak stack traces, SQL, secrets, tokens, raw request bodies, or raw provider responses.

Example shape:

```ts
export function handleError(error: unknown, context: RequestContext) {
  const apiError = mapErrorToApiError(error, context.requestId);

  LOGGER.error({
    event: "api.request.failed",
    requestId: context.requestId,
    userId: context.userId,
    organizationId: context.organizationId,
    statusCode: apiError.statusCode,
    errorCode: apiError.body.error.code,
  });

  if (apiError.statusCode >= 500) {
    ERROR_TRACKER.captureException(error, {
      requestId: context.requestId,
      userId: context.userId,
      organizationId: context.organizationId,
      errorCode: apiError.body.error.code,
    });
  }

  return apiError;
}
```

## Logging and error tracker rules

- `4xx` client errors are logged but not sent to the error tracker by default.
- `5xx` server errors are sent to the error tracker when configured.
- External provider failures may be sent depending on project risk.
- Logs may include stack traces for debugging, but must not include secrets or raw payloads.
- Application code must not import vendor error tracking SDKs directly; use an observability
  facade/adapter.

Allowed diagnostic context:

- `requestId`
- `userId`
- `organizationId`
- `route`
- `method`
- `statusCode`
- `errorCode`
- `provider`
- `providerStatusCode`
- `durationMs`
- `releaseVersion`
- `environment`

Disallowed context:

- Passwords
- Tokens
- API keys
- Authorization headers
- Cookies
- Raw request bodies
- Payment data
- Sensitive personal data
- Raw provider responses

## External provider and database failures

Provider, SDK, database, and network errors must be normalized.

Rules:

- Do not return provider/DB raw error messages to clients.
- Map provider failure to `502 EXTERNAL_SERVICE_ERROR` unless timeout or availability semantics
  require `503`/`504`.
- Include provider details in logs only after sanitization.
- Preserve `cause` internally when useful for logs/debugging.
- For unique constraint violations, map to `409 CONFLICT` with a stable domain-specific code when
  possible.

## Coding workflow

When adding an error path:

1. Identify the layer where the error originates: validation, auth, authorization, domain,
   persistence, provider, or unexpected runtime.
2. Choose a stable global or domain-specific `error.code`.
3. Choose the correct HTTP status code.
4. Ensure the thrown error is `AppError`, mapped domain error, or handled by a global mapper.
5. Ensure the client response uses the standard envelope.
6. Add or update tests for the behavior.
7. Update OpenAPI error responses when an endpoint contract changes.
8. Check logging/error-tracker behavior for alertable failures.

## Review checklist

Use this checklist during AI code review:

- Does every API error use the standard `{ error: ... }` envelope?
- Is `error.code` stable and machine-readable?
- Does the response include `requestId`?
- Is the message safe for end users?
- Are stack traces, SQL, provider payloads, or raw internal errors hidden from the client?
- Is `400` vs `422` used correctly?
- Are `401`, `403`, and security-sensitive `404` cases handled correctly?
- Are uniqueness/state conflicts mapped to `409`?
- Are ETag/If-Match mismatches mapped to `412` when optimistic concurrency is used?
- Are rate limit errors mapped to `429`?
- Are Zod errors normalized into `details`?
- Does PATCH reject empty bodies and unknown fields?
- Are external provider failures normalized and logged safely?
- Are `5xx` failures sent to the error tracker when configured?
- Are tests added for validation, auth, conflict, and unexpected error paths?
- Is OpenAPI updated with relevant error responses?

## Tests to require

For critical endpoints, require tests for:

- Validation error envelope.
- Empty PATCH body.
- Unknown request field.
- Semantic validation failure.
- Missing/invalid auth returns `401`.
- Authenticated but forbidden returns `403`.
- Cross-tenant resource access returns `404` when existence should not leak.
- Not found returns `404`.
- Conflict returns `409`.
- Optimistic concurrency mismatch returns `412`.
- Unexpected error returns `500` without stack trace.
- `requestId` appears in response and logs.

## Good examples

### Good: stable AppError

```ts
throw new AppError(USER_ERROR_CODE.EMAIL_ALREADY_EXISTS, "Email already exists.", 409);
```

### Good: safe unknown error response

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Something went wrong.",
    "requestId": "req_123"
  }
}
```

### Good: validation detail

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "details": [
      {
        "field": "email",
        "message": "Email must be valid.",
        "code": "INVALID_FIELD"
      }
    ],
    "requestId": "req_123"
  }
}
```

## Anti-patterns

Do not:

- Return raw thrown errors.
- Return framework-native error objects directly.
- Return stack traces to clients.
- Let clients depend on `error.message`.
- Use inconsistent ad hoc error shapes.
- Treat all validation errors as `500`.
- Treat missing auth as `403`.
- Treat malformed JSON as `422`.
- Log raw request bodies or provider responses.
- Import Sentry/Datadog/New Relic SDKs inside business/use-case code.
- Hide domain policy failures inside Zod transforms.
- Return database rows directly as error details.

## Related skills

Use this skill together with:

- `api-design` for response envelopes, HTTP semantics, and OpenAPI impact.
- `validation` for Zod schema parsing and error detail mapping.
- `security-baseline` for safe error responses and sensitive data handling.
- `logging-observability` for structured error logs and error tracker integration.
- `auth-authorization` for `401`, `403`, and tenant-safe `404` decisions.
- `testing` for required error behavior tests.
