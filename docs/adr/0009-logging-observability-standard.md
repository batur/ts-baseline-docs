# ADR-0009: Logging and Observability Standard

## Status

Accepted.

## Context

Production systems need structured, secure and externally integrable observability.

## Decision

Backend logger default is pino. Logs are structured JSON in production. Every log event includes an `event` field. Every request has a requestId/correlation ID. Responses include `X-Request-Id`. Error responses include `error.requestId`.

Raw request bodies, secrets, tokens, auth headers, cookies, payment data and raw provider responses are not logged.

Application logs and audit logs are separate.

The observability design must be ready for tools such as Sentry, Datadog, New Relic, CloudWatch, Loki and OpenTelemetry. Logger and error tracker are separate concerns. Vendor SDKs are behind adapters. Default error tracker is noop.

5xx errors go to error tracker by default. 4xx errors are logged but not sent by default.

## Consequences

Errors can be correlated with logs and external tools without leaking sensitive data.
