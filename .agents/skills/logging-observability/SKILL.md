---
name: logging-observability
description: >
  Defines logging and observability standards for TypeScript apps. Use when adding or reviewing
  loggers, request IDs, structured logs, error tracking, Sentry/Datadog/OpenTelemetry adapters,
  health checks, external service logging, safe redaction, or production debugging behavior.
---

# Logging & Observability Skill

Use this skill when coding or reviewing TypeScript backend, frontend, fullstack, integration, AI, or
automation work that touches logging, error tracking, request tracing, health checks, metrics,
external provider calls, audit-like events, or production debugging.

## Goal

Make production systems debuggable, traceable, secure, and ready for external observability tools
without leaking secrets or sensitive personal data.

A good implementation helps answer:

- What happened?
- Which request did it happen in?
- Which user or tenant was affected?
- Which external dependency was involved?
- How long did it take?
- Can the event be correlated across logs, API responses, and error tracking?

## Core decisions

- Backend logger default is `pino`.
- Production logs are structured JSON objects.
- Local development may use pretty logs.
- Application code must not use persistent raw `console.log`.
- Every log event should include `event`.
- HTTP request logs must include `requestId`.
- Every HTTP response should include `X-Request-Id`.
- API error responses include `error.requestId`.
- Every HTTP request should produce a completion log.
- Errors are logged with normalized error fields.
- Raw request bodies and raw provider responses are not logged.
- Secrets, tokens, cookies, authorization headers, payment data, and sensitive personal data are not
  logged.
- Application logs and audit logs are separate concepts.
- Health endpoints are required for backend services.
- External service calls should log provider, operation, duration, and result status.
- Logger and error tracker are separate concerns.
- External observability tools must be behind adapters/facades.
- Application/domain/use-case code must not import vendor SDKs such as Sentry directly.
- Default error tracker is a no-op implementation.
- Sentry or similar tools are optional adapters.
- OpenTelemetry is an optional advanced observability profile.

## Concepts

### Logger

Use the logger for structured application and operational events: request completion, operation
success/failure, external call success/failure, background job status, diagnostic warnings, and
business events useful for debugging.

### Error tracker

Use an error tracker for alertable failures and exception grouping: unexpected 5xx errors, unhandled
exceptions, provider failures requiring alerting, and release/environment-aware stack traces.

### Audit log

Audit log is not normal application logging. Audit logs are durable security/business records, often
persisted in a database.

Examples:

- user role changed
- API key created or revoked
- billing plan changed
- organization member removed
- permission changed

Do not replace audit logs with application logs.

## Recommended structure

Prefer `src/shared/logger` for generic logger setup and redaction, `src/shared/observability` for
interfaces/no-op/request context, and `src/integrations/<provider>` for vendor-specific adapters
such as Sentry. Application/domain/use-case code consumes the facade and must not import vendor SDKs
directly.

## Interfaces

Use explicit interfaces when abstraction is needed: `Logger` for `debug/info/warn/error/fatal`
structured context methods, and `ErrorTracker` for `captureException`, `captureMessage`, `setUser`,
and `setContext`. The default `ErrorTracker` must be a no-op implementation.

## Event naming

Use stable lowercase dot notation:

```txt
resource.action
resource.action.failed
integration.operation
integration.operation.failed
api.request.completed
api.request.failed
```

Examples:

```txt
user.created
user.create.failed
auth.login.failed
stripe.checkout-session.create.completed
stripe.checkout-session.create.failed
openai.chat-completion.failed
api.request.completed
api.request.failed
```

Every structured log should include an `event` field.

## Log levels

| Level   | Use for                                                     |
| ------- | ----------------------------------------------------------- |
| `debug` | Local/debug detail. Usually off in production.              |
| `info`  | Normal successful application or operational event.         |
| `warn`  | Unexpected but handled condition.                           |
| `error` | Failed request or operation.                                |
| `fatal` | Startup or runtime failure that prevents safe continuation. |

Guidance:

- Successful request completion: `info`
- Validation/client errors: usually `info` or `warn`
- Unauthorized/forbidden attempts: `warn` if suspicious, otherwise `info`
- Expected domain rejection: usually `info` or `warn`
- Unexpected 5xx: `error`
- Startup crash: `fatal`

## Request ID / correlation ID

Every request must have a request ID. Accept incoming `X-Request-Id` when safe and valid, generate
one when missing, include it in every response, include it in every request-related log, include it
in API error response bodies, and pass it to external call logs/error tracker context.

## Request completion log

Every HTTP request should produce one completion log.

```ts
LOGGER.info({
  event: "api.request.completed",
  requestId,
  method: "GET",
  path: "/api/v1/users",
  statusCode: 200,
  durationMs: 42,
  userId,
  organizationId,
});
```

Minimum fields:

- `event`
- `requestId`
- `method`
- `path`
- `statusCode`
- `durationMs`

Include when available:

- `userId`
- `organizationId`
- `errorCode`
- `route`
- `traceId`
- `spanId`

Do not log raw query strings by default. If query information is needed, use an allowlist of safe
fields.

## Error logging

Client responses must be safe. Internal logs may include more detail, but still must not include
secrets or raw payloads.

Rules:

- Do not return stack traces to clients.
- Do not log raw database/provider errors if they contain sensitive data.
- Normalize errors before logging public-facing fields.
- 5xx errors should be sent to the error tracker.
- 4xx errors are logged but not sent to the error tracker by default.
- External service failures may be sent to the error tracker based on project configuration.

Example:

## Global error handler workflow

When implementing a global error handler:

1. Normalize unknown errors to the standard API error shape.
2. Log a structured error event.
3. Include `requestId`, route/method/status/errorCode.
4. Send alertable 5xx failures to the error tracker.
5. Return a safe API response.
6. Never expose stack traces, provider payloads, or database internals to clients.

## Sensitive data rules

Never log:

- passwords
- tokens, access tokens, refresh tokens
- authorization headers
- cookies
- API keys, secrets, private keys
- session IDs
- payment data
- raw request bodies
- raw provider responses
- raw file contents
- national IDs
- highly sensitive personal data

Personal data such as email, phone, IP, address, location, VIN, or user identifiers must be logged
only when necessary and should be minimized, masked, hashed, or replaced by a safer derivative.

Prefer allowlisted log fields over redacting object dumps.

Bad:

```ts
LOGGER.info({ event: "user.create.requested", requestBody: body });
```

Good:

```ts
LOGGER.info({
  event: "user.create.requested",
  requestId,
  emailDomain: getEmailDomain(input.email),
});
```

## Redaction as safety net

Logger redaction is required but not sufficient. Redaction protects against mistakes; it does not
permit raw body logging. Design logs with explicit safe fields.

Required redaction paths should include password, token, accessToken, refreshToken, authorization,
cookie, and wildcard nested variants.

## External service logging

Every important external service call should log completion and failure.

Rules:

- Include provider, operation, duration, and result status.
- Do not log raw request or response payloads.
- Do not log provider secrets or authorization headers.
- Map provider errors to safe application error codes.

## External observability readiness

The system must be ready to connect to Sentry, Datadog, New Relic, CloudWatch, Grafana Loki, or
OpenTelemetry.

Rules:

- Do not import vendor SDKs in application/domain/use-case code.
- Vendor-specific code lives in adapters.
- Default error tracker is no-op.
- Enable providers through typed config.
- Send only allowlisted context.
- Use release/environment metadata when available.

Allowed context:

- `requestId`
- `userId`
- `organizationId`
- `route`
- `method`
- `statusCode`
- `errorCode`
- `releaseVersion`
- `environment`

Disallowed context:

- passwords
- tokens
- authorization headers
- cookies
- raw request bodies
- payment data
- sensitive personal data
- raw provider responses

## Config integration

Observability providers are configured through typed config, not scattered environment access. Keep
`SENTRY_ENABLED`, `SENTRY_DSN`, `RELEASE_VERSION`, and `APP_ENV` in validated server config and pass
them to provider factories/adapters.

## Health checks

Backend services must expose a health endpoint.

```http
GET /health
```

For production services, prefer separate liveness and readiness endpoints when useful:

```http
GET /health/live
GET /health/ready
```

Readiness may check database, Redis, queue, or required dependencies. Do not expose sensitive
internal details publicly.

## Metrics and tracing

Minimum metrics to consider:

- request count
- request duration
- error count
- status code count
- external call duration
- queue/job duration

OpenTelemetry is optional advanced profile. Add it when the system has multiple services,
distributed calls, external provider-heavy workflows, or enterprise observability requirements.

If tracing is enabled, logger context should be able to include `traceId`, `spanId`, and
`requestId`.

## Frontend logging

Rules:

- Do not keep raw `console.log` in production application code.
- Use a frontend logger wrapper.
- Disable debug logs in production.
- Do not log tokens, cookies, PII, request bodies, or provider payloads.
- Sentry/Datadog browser SDK usage must be wrapped behind a client observability adapter.
- Frontend logs should not become security controls.

## Coding workflow

When adding logging or observability:

1. Identify the operation and diagnostic purpose.
2. Choose the correct event name.
3. Include `requestId` when request-scoped.
4. Include duration for request, job, or external operations.
5. Include user/organization context only when safe and useful.
6. Use explicit allowlisted fields.
7. Add or reuse an error tracker adapter only for alertable exceptions.
8. Update config/env schemas if adding a provider.
9. Add tests for redaction, error mapping, or request ID behavior when relevant.
10. Update docs if observability behavior or provider setup changes.

## Review checklist

Check every logging/observability change for:

- Is the log structured, not a free-form string?
- Does it include `event`?
- Does request-scoped logging include `requestId`?
- Does request completion logging include method, path, statusCode, durationMs?
- Is raw request body avoided?
- Is raw provider response avoided?
- Are secrets/tokens/cookies/authorization headers excluded?
- Is personal data minimized or masked?
- Is `console.log` avoided in application code?
- Are vendor SDK imports kept out of application/domain/use-case code?
- Are error tracker calls limited to alertable failures?
- Are 4xx errors not sent to Sentry by default?
- Are 5xx errors captured with safe context?
- Are external provider failures normalized?
- Is release/environment context available?
- Is health check behavior safe and non-sensitive?
- If a new env variable was added, was `.env.example` updated?
- If behavior changed, were docs updated?

## Required tests

Add tests when the change affects:

- request ID generation or propagation
- error response `requestId`
- global error handling
- redaction/masking helpers
- external provider error normalization
- observability provider factory
- health/readiness behavior
- sensitive data exclusion logic

## Anti-patterns

Do not:

- log raw request bodies or raw provider responses
- log tokens, cookies, authorization headers, or secrets
- import Sentry/Datadog/New Relic directly in use-cases
- rely on frontend logs for security
- use unstructured string logs for production events
- send 4xx validation errors to error tracking by default
- expose stack traces to clients
- expose sensitive readiness details publicly
- treat normal application logs as durable audit logs
