# Logging and Observability Standard

## Logger

- Backend default logger: pino
- Production logs are structured JSON
- Local development may use pretty logs
- Application code must not use raw `console.log`
- Every log should include an `event` field

## Request Correlation

- Every request has `requestId` / correlation ID
- Response header includes `X-Request-Id`
- Error response includes `error.requestId`

## Request Logging

Every request should produce a completion log with:

- event
- requestId
- method
- path
- statusCode
- durationMs
- userId, if available
- organizationId, if available

## Sensitive Data

Never log:

- passwords
- tokens
- authorization headers
- cookies
- API keys
- secrets
- raw request bodies
- raw provider responses
- payment data
- sensitive personal data

## External Observability Tools

The logging/observability system must be ready for external tools such as Sentry, Datadog, New Relic, CloudWatch, Grafana Loki and OpenTelemetry.

Rules:

- Logger and error tracker are separate concerns.
- Application code does not import vendor SDKs.
- Vendor-specific code lives behind adapters.
- Default error tracker is noop.
- Sentry adapter is optional.
- 5xx errors are sent to error tracker by default.
- 4xx errors are logged but not sent by default.
- External service failures are configurable.

Allowed error tracker context:

- requestId
- userId
- organizationId
- route
- method
- statusCode
- errorCode
- release version
- environment

Disallowed context:

- passwords
- tokens
- authorization headers
- cookies
- raw request bodies
- payment data
- sensitive personal data
- raw provider responses

## Health and Metrics

Minimum observability profile:

1. structured logger
2. request ID middleware
3. request completion log
4. error logging
5. health endpoint
6. external service duration log
7. sensitive data redaction/exclusion

OpenTelemetry is optional advanced profile.

## Nest.js Integration

- Register request ID middleware or an interceptor during bootstrap.
- Use interceptors/adapters for request completion logs, duration and correlation; do not put logging
  policy in feature controllers.
- Provide health/readiness checks and define dependency timeouts and failure behavior.
- Enable graceful shutdown and use Nest lifecycle hooks for resource cleanup where required.
- Log external provider duration and safe failure metadata without raw provider responses.

## Browser Integration

- Query and mutation failures are reported through the frontend error/telemetry adapter with a
  request ID when the API provides one; do not log raw response bodies, tokens or storage contents.
- Feature UI states expose safe loading/error/empty status to users while diagnostics remain in the
  adapter layer.
- Vite and Next.js deployments expose release and commit metadata through approved public config only;
  server secrets remain server-side.
- Storybook and browser tests use deterministic fixtures and do not send production telemetry.
