# ADR-0005: REST API Guidelines

## Status

Accepted.

## Context

The API baseline needs predictable HTTP semantics and response contracts.

## Decision

Use RESTful HTTP APIs with a custom JSON envelope. JSON:API is not default, but may be an advanced profile.

Use path-based versioning under `/api/v1`. Resource names are plural kebab-case. PATCH is the default update method; PUT is full replacement only.

Success responses use `data` and optional `meta`. Collection responses use `data`, `pagination` and optional `meta`. Error responses use `{ error: { code, message, details?, requestId } }`.

Cursor pagination is default for public collection endpoints.

JSON fields use camelCase. Database fields may use snake_case and are mapped at boundaries.

Domain/database objects are not returned directly; serializers produce API DTOs.

## Consequences

API behavior becomes predictable and client-friendly without the complexity of JSON:API as a default.
