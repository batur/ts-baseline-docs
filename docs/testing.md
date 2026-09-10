# Testing Standard

## Tools

- Unit/component/integration tests: Vitest
- Executable acceptance/behavior tests: Cucumber with Gherkin
- Browser E2E tests: Playwright

## Location

- E2E tests live under `tests/e2e`.
- All other tests are co-located with the code they protect.
- Default test suffix: `.test.ts`.

## Principle

Test observable behavior, not implementation details.

Cucumber is the outer stakeholder-visible behavior loop. Vitest is the inner
RED -> GREEN -> REFACTOR implementation loop. Do not duplicate complete acceptance assertions in
unit tests; use Vitest for policies, validation, use cases, serializers, adapters, and failure
paths. Every scenario receives a fresh World and isolated application state. `@wip` is valid only
while its owning specification remains draft.

Full-lane scenarios live in `specs/<feature>/acceptance/*.feature` and reference requirements with
`@FR-###` tags. PR evidence records one meaningful observed RED failure, its intended reason, and
the final passing command. CI verifies the final state; it does not claim to reconstruct history.

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
    "test:bdd:dry": "cucumber-js --config cucumber.mjs --profile dry",
    "test:bdd": "cucumber-js --config cucumber.mjs --profile default",
    "test:e2e": "playwright test --pass-with-no-tests"
  }
}
```
