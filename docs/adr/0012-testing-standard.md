# ADR-0012: Testing Standard

## Status

Accepted.

## Context

Projects need tests that protect behavior, contracts, validation, security and critical flows.

## Decision

Vitest is default for unit/component/integration tests. Playwright is default for E2E tests.

E2E tests live under `tests/e2e`. Other tests are co-located. Default suffix is `.test.ts`.

Test observable behavior, not implementation details. External dependencies are tested through fake/mock adapters. Critical Zod schemas, error envelopes, PATCH behavior, auth/authorization, tenant boundaries, security-sensitive features and provider failure paths are tested.

Contract tests are optional by default but required for public/external/multi-consumer APIs.

Critical path coverage is more important than global coverage percentage. Tests must be deterministic and must never connect to production/staging services.

## Consequences

The codebase becomes safer to evolve, especially around security and API behavior.
