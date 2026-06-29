# ADR-0013: OpenAPI Documentation Standard

## Status

Accepted.

## Context

REST APIs need consistent documentation and contract visibility.

## Decision

Public API endpoints are documented with OpenAPI. OpenAPI version is selected per project based on current stable version, backward compatibility and tooling support.

Default workflow is code-first from Zod schemas and route metadata. Main output is `docs/openapi/openapi.yaml`. Optional JSON output is `docs/openapi/openapi.json`.

Protected endpoints document security definitions. Collection endpoints document pagination, filter, sort and search parameters. Reusable components are used for success envelope, collection envelope, error envelope, pagination, auth schemes, requestId header and common error responses.

Generated OpenAPI must not be stale in CI. Contract tests remain optional by default and required for public/external/multi-consumer APIs.

## Consequences

API documentation stays close to implementation and remains suitable for SDK generation when needed.
