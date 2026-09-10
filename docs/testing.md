# Testing Standard

## Tools

- Unit/component/integration tests: Vitest
- Browser E2E tests: Playwright

## Location

- E2E tests live under `tests/e2e`.
- All other tests are co-located with the code they protect.
- Default test suffix: `.test.ts`.

## Principle

Test observable behavior, not implementation details.

## Required Coverage Areas

Critical paths must be tested:

- Zod validation schemas
- API error envelope
- PATCH behavior
- auth and authorization
- tenant boundary
- security-sensitive features
- external provider failure paths
- AI output validation, when relevant

## Contract Tests

Contract tests are optional by default. They are required when the API is consumed by external clients, generated SDKs, mobile apps, separate teams or other services.

## Mocking

- Mock/fake external dependencies.
- Do not mock internal implementation details unnecessarily.
- Repository behavior should use integration tests when persistence logic is important.

## Test Data

Use test data factories to avoid duplicated magic objects.

## Determinism

Tests must be deterministic:

- fixed time when needed
- controllable random IDs
- no accidental network calls
- isolated test database
- no production/staging service connections

## Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test --pass-with-no-tests"
  }
}
```
