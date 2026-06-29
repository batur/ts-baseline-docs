# ADR-0011: Authentication and Authorization Standard

## Status

Accepted.

## Context

Authentication and authorization must be separated and consistently enforced.

## Decision

Authentication is centralized in guards/middleware/provider adapters. Application logic receives normalized `AuthContext`, not raw tokens/provider sessions.

Authorization is enforced server-side in use-cases/application services. Client-side permission checks are UX helpers only.

Role-based access may be used for user management, but business authorization is permission-based. Permission format is `resource:action`.

Use `401` for missing/invalid authentication, `403` for authenticated users without permission and `404` for cross-tenant/resource enumeration-sensitive access when appropriate.

API keys are stored hashed and shown only once at creation.

## Consequences

Authorization logic becomes consistent, testable and provider-agnostic.
