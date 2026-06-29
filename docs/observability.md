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
