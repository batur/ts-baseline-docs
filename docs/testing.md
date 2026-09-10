# Testing Standard

## Tools

- Unit/component/integration tests: Vitest
- Browser E2E tests: Playwright
- Isolated component browser tests: Storybook 10 + `@storybook/addon-vitest` + Vitest browser mode
  with Playwright Chromium

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
- Frontend loading, success, empty, validation-error and API-failure states
- Keyboard navigation, focus behavior and accessible names for critical UI
- Authentication redirects and permission-sensitive UX behavior
- Critical browser journeys through Playwright
- TanStack Query uses a fresh client per test, with retries disabled and no production cache shared
  between cases.
- TanStack Router search/route validation rejects or safely defaults malformed URL values.
- TanStack Form tests field errors, submission state, server failures and accessible descriptions.
- TanStack Table tests semantic headers, empty/loading/error states, keyboard behavior and sorting
  where enabled.
- TanStack Charts tests meaningful accessible labels, responsive sizing and deterministic feature
  data.
- Motion tests preserve behavior and honor `prefers-reduced-motion`; animation is never required
  for correctness.
- Storybook stories cover default, loading, empty, error, disabled, form, table, chart, focus and
  reduced-motion states. `pnpm test:storybook` runs the separate browser-mode project so it does
  not change the Node/jsdom test environment.
- Nest module wiring and framework-bound guards, pipes, interceptors and exception filters
- Startup configuration failures, graceful shutdown and cross-module boundary behavior

## Contract Tests

Contract tests are optional by default. They are required when the API is consumed by external clients, generated SDKs, mobile apps, separate teams or other services.

## Mocking

- Mock/fake external dependencies.
- Do not mock internal implementation details unnecessarily.
- Component tests should mock network boundaries, not React internals. Keep server authorization
  and tenant-boundary tests in the backend/API test suite.
- Repository behavior should use integration tests when persistence logic is important.
- Nest starter examples commonly use Jest, but this baseline uses Vitest. `@nestjs/testing` may
  create a Nest testing module; execute the test through Vitest and assert observable behavior.
- Unit-test application services with fake repository/provider ports. Use HTTP integration tests for
  response envelopes, Zod validation, auth, security headers, OpenAPI routes and request IDs.
- Storybook browser tests use fixtures and mocked network boundaries. They must not call production
  APIs. Use `@storybook/react-vite` for Vite and `@storybook/nextjs-vite` for Next.js; legacy Next
  Storybook addons are not part of the baseline.

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
    "test:e2e": "playwright test --pass-with-no-tests",
    "test:storybook": "vitest run --config vitest.storybook.config.ts"
  }
}
```

The main `vitest.config.ts` remains the Node/jsdom baseline. The Storybook config is a separate
Vitest project using `@vitest/browser` and `@vitest/browser-playwright`, with a fresh browser
context for stories. Playwright remains the tool for end-to-end browser journeys, not a replacement
for unit tests or Storybook component tests.
