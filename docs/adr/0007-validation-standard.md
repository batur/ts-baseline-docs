# ADR-0007: Validation Standard

## Status

Accepted.

## Context

TypeScript provides compile-time safety, but external data remains untrusted at runtime.

## Decision

Zod is the default runtime validation library. Validate all external inputs at system boundaries before entering application logic.

Schema constants use SCREAMING_SNAKE_CASE. Inferred types use PascalCase. Component-specific schemas live in the owning component. Public API schemas use `.strict()` by default.

API boundary validation uses `safeParse`. Startup/fail-fast validation may use `parse`.

`z.coerce` may be used for query params, path params and env variables. It is not default for JSON request bodies. Zod transforms are for normalization, not business decisions.

Business/domain validation remains in domain/application logic.

AI model output and critical third-party data are untrusted and must be validated.

## Consequences

Application logic receives typed, validated input and validation behavior remains consistent.
