---
name: testing
description: Defines the TypeScript testing standard for AI coding and review. Use when adding, changing, or reviewing tests, test structure, Vitest, Playwright e2e, validation/error/PATCH/auth/security/tenant tests, fixtures, mocks/fakes, coverage, CI test commands, or any behavior that needs test protection.
license: Proprietary
compatibility: Designed for VS Code Agent Skills and Agent Skills compatible tools. Assumes TypeScript, pnpm, Vitest, and Playwright unless the project explicitly documents another stack.
metadata:
  standard: software-architecture-and-design
  version: "1.0.0"
---

# Testing Skill

## Goal
Use this skill to create, update, or review tests in the TypeScript architecture baseline.
The goal is not to maximize test count. The goal is to protect behavior, contracts, security boundaries, authorization, tenant isolation, validation, update semantics, provider failure paths, and critical business flows.
Core principle:
```txt
Test observable behavior, not implementation details.
```

## When to use this skill
Use this skill when the task involves:
- adding or changing business logic
- adding or changing API endpoints
- changing validation schemas
- changing PATCH/update behavior
- changing error handling or error mapping
- changing authentication or authorization
- changing tenant-scoped behavior
- changing database/repository behavior
- changing external provider adapters
- adding AI structured output, tool calls, or guardrails
- adding UI flows that need e2e coverage
- reviewing a PR for missing or weak tests
- adjusting Vitest, Playwright, coverage, fixtures, mocks, fakes, or CI test commands

## Tooling baseline
Default test tools:
```txt
Unit / component / integration: Vitest
Browser e2e: Playwright
Package manager: pnpm
```
Default scripts:
```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test"
}
```
CI should run at least:
```txt
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
For UI apps or critical user flows, CI should also run the applicable Playwright e2e suite or a critical subset.

## Test location standard
E2E tests must live under the top-level `tests/e2e` directory:
```txt
tests/
  e2e/
    signup-flow.test.ts
    project-management-flow.test.ts
```
All non-e2e tests should be co-located with the code they protect:
```txt
src/
  modules/
    users/
      create-user.use-case.ts
      create-user.use-case.test.ts
      update-user.schema.ts
      update-user.schema.test.ts
      user.serializer.ts
      user.serializer.test.ts
```
Allowed exception: very broad integration tests may live under `tests/integration`, but this is not the default.
Default test suffix:
```txt
.test.ts
```
Avoid `.spec.ts` unless the project already standardized on it.

## Test categories

### Unit tests
Use for:
- pure functions
- domain rules
- policies
- serializers
- mappers
- small use-case helpers
They should be fast, isolated, and deterministic.

### Integration tests
Use for:
- route + validation + error mapper behavior
- use-case + fake repository
- repository + test database
- webhook signature verification
- provider adapter normalization
- external failure mapping

### E2E tests
Use Playwright for:
- browser user flows
- critical happy paths
- authentication flows
- onboarding flows
- payment/billing flows
- project or organization management flows
E2E tests live in `tests/e2e`.

### Contract tests
Contract tests are optional by default.
They become required when:
- the API is public or externally consumed
- SDKs are generated from the API contract
- mobile apps consume the API on a separate release cycle
- frontend/backend are developed by separate teams
- service-to-service contracts exist
- webhook/provider adapter contracts are critical
Contract tests may check:
- OpenAPI implementation alignment
- stable response envelope
- error envelope
- pagination shape
- public DTO field names
- provider webhook normalization

## What must be tested

### Critical Zod schemas
Test critical schemas:
- auth inputs
- payment/billing inputs
- webhook payloads
- AI model outputs
- PATCH/update schemas
- permission-sensitive inputs
- security-sensitive request bodies
Required checks:
```txt
- valid input accepted
- missing required field rejected
- invalid type rejected
- unknown field rejected
- boundary values tested
```
Example:
```ts
describe("UPDATE_USER_SCHEMA", () => {
  it("rejects empty updates", () => {
    const result = UPDATE_USER_SCHEMA.safeParse({});

    expect(result.success).toBe(false);
  });

  it("rejects unknown fields", () => {
    const result = UPDATE_USER_SCHEMA.safeParse({ isAdmin: true });

    expect(result.success).toBe(false);
  });

  it("allows nullable avatarUrl clear", () => {
    const result = UPDATE_USER_SCHEMA.safeParse({ avatarUrl: null });

    expect(result.success).toBe(true);
  });
});
```

### Error envelope behavior
API error contract must be tested when error handling changes.
Test:
```txt
- validation error envelope
- 400 vs 422 mapping
- 401 unauthenticated
- 403 forbidden
- 404 not found
- 409 conflict
- 412 precondition failed
- 429 rate limited
- 500 internal error hides stack trace
- requestId exists in error response
```
Example:
```ts
expect(response.status).toBe(400);
expect(response.body).toEqual({
  error: expect.objectContaining({
    code: "VALIDATION_ERROR",
    message: expect.any(String),
    requestId: expect.any(String),
  }),
});
```

### PATCH / update behavior
Any PATCH endpoint or update use-case must test:
```txt
- omitted field does not change value
- nullable field can be cleared with null
- non-nullable field rejects null
- empty body returns 400 EMPTY_UPDATE
- unknown field returns 400
- immutable field returns 422
- conflict returns 409
- optimistic concurrency mismatch returns 412, if ETag/If-Match is used
- successful PATCH returns 200 + updated resource
```
Never use truthiness checks for patch application because falsy valid values such as `false`, `0`, or `""` may be lost. Use explicit `!== undefined` checks.

### Auth and authorization
Business-sensitive use-cases must have authorization tests.
Test:
```txt
- protected endpoint without auth -> 401
- invalid token/session -> 401
- authenticated user without permission -> 403
- allowed permission succeeds
- cross-tenant resource access -> 404 or 403 based on project policy
- API key auth works, if supported
- raw API key is not stored, if API keys exist
```
Use-case example:
```ts
await expect(
  updateProject({
    projectId: "prj_123",
    input: { name: "New name" },
    authContext: createAuthContextFixture({ permissions: [] }),
  })
).rejects.toMatchObject({
  code: "FORBIDDEN",
});
```

### Tenant boundary
Multi-tenant systems must test tenant isolation.
Test:
```txt
- user cannot read another organization resource
- user cannot update another organization resource
- tenant-scoped repository methods require organizationId/tenantId
- cross-tenant access does not leak existence when policy says 404
```
Example:
```ts
const response = await client.get("/api/v1/projects/prj_other_org", {
  headers: authHeaderForOrg("org_123"),
});

expect(response.status).toBe(404);
```

### Security-sensitive behavior
If the feature exists, test it:
```txt
- unknown fields rejected
- CORS allowlist works in production config
- rate-limited endpoint returns 429
- invalid webhook signature rejected
- replayed webhook rejected, if replay protection exists
- raw stack trace not exposed
- sensitive fields are not logged
- SSRF guard blocks localhost/internal IP ranges
- file upload rejects invalid MIME/size
- raw SQL keeps tenant filter and parameterization
```

### External providers
Provider integrations must test failure paths.
Test:
```txt
- provider timeout mapped safely
- provider 4xx/5xx mapped to app error
- raw provider response does not leak to API
- normalized adapter output shape is stable
- retries/idempotency behavior, if applicable
```
Do not call real external providers in unit tests. Use fake adapters, mocked clients, or contract fixtures.

### AI output and tool calls
For AI features, test:
```txt
- valid structured output accepted
- invalid output rejected
- missing required fields rejected
- numeric ranges enforced
- unsafe/destructive tool call requires permission
- PII masking works, if applicable
- model timeout/error maps safely
```
Example:
```ts
const result = JOB_SCORE_SCHEMA.safeParse({
  score: 120,
  reasons: [],
  hardVeto: false,
});

expect(result.success).toBe(false);
```

## Mock and fake strategy
Use mocks/fakes for external dependencies, not internal implementation details.
Prefer:
```txt
- fake repositories for use-case tests
- fake provider adapters for external systems
- test database for critical repository behavior
- fixture factories for domain objects
```
Avoid:
```txt
- asserting private helper calls
- mocking every internal function
- mocking the unit under test
- testing implementation details instead of output/effects/errors
```
Fake repository example:
```ts
class FakeUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  async findByEmail(email: string): Promise<User | null> {
    return [...this.users.values()].find((user) => user.email === email) ?? null;
  }

  async create(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }
}
```

## Test data factories
Use fixture factories to avoid repeated magic objects.
```ts
export function createUserFixture(overrides: Partial<User> = {}): User {
  return {
    id: "usr_123",
    email: "ali@example.com",
    displayName: "Ali",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}
```
Component-specific fixtures may live inside the owning component.
Shared fixtures are allowed only when genuinely reused across components.

## Determinism rules
Tests must be deterministic.
Control:
```txt
- time
- random IDs
- network calls
- database cleanup
- test isolation
- environment variables
```
Use fixed time when needed:
```ts
vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
```
Tests must never connect to production or staging services.
Add guards where possible:
```ts
if (
  SERVER_ENV.NODE_ENV === "test" &&
  SERVER_ENV.DATABASE_URL.includes("prod")
) {
  throw new Error("Test environment cannot use production database.");
}
```

## Snapshot testing
Snapshot tests are not the default strategy.
Allowed sparingly for:
- stable serialized output
- limited UI smoke checks
- generated OpenAPI diff, if intentionally managed
Do not use snapshots as a substitute for business logic assertions.

## Coverage standard
Global coverage percentage is not the primary quality target.
Prefer critical path coverage for:
- auth
- billing
- payments
- tenant boundary
- security-sensitive flows
- data mutation use-cases
- AI tool execution
- webhook processing
If a critical path changes, require meaningful tests even if global coverage already passes.

## AI coding workflow
When coding:
1. Identify the behavior being changed.
2. Identify whether it affects validation, API contract, PATCH, auth, tenant boundary, security, database, provider integration, or AI output.
3. Choose the right test level: unit, integration, e2e, or contract.
4. Place tests according to the location standard.
5. Use fake adapters/repositories unless persistence/provider behavior itself is under test.
6. Add fixture factories instead of repeated magic objects.
7. Assert observable behavior, not private implementation.
8. Include negative/error tests for critical flows.
9. Keep tests deterministic.
10. Run relevant tests or state what should be run.

## AI review checklist
Before approving code, verify:
- Behavior changed but no test was added?
- Test location follows the standard?
- Test name clearly describes behavior?
- Test asserts behavior, not implementation detail?
- Critical Zod schema has positive and negative tests?
- Error envelope and status mapping are tested?
- PATCH empty/null/unknown/immutable cases are tested?
- Auth and authorization are tested for sensitive use-cases?
- Tenant boundary is tested?
- External provider failure path is tested?
- AI output validation is tested when relevant?
- Security-sensitive behavior has tests?
- Tests use fakes/mocks only at appropriate boundaries?
- Tests avoid real external services?
- Tests are deterministic?
- E2E flows are in `tests/e2e`?
- Contract tests are present when public/external/multi-consumer APIs require them?

## Anti-patterns
Do not:
- test only the happy path for critical flows
- test private helpers instead of observable behavior
- call real external APIs in unit tests
- connect to production/staging from tests
- use snapshots for business logic verification
- skip authorization/tenant tests for sensitive use-cases
- mock the unit under test
- create brittle tests tied to internal implementation
- rely only on global coverage percentage
- leave provider failure paths untested
- leave PATCH semantics untested
- leave error response shape untested

## Required documentation impact
Update docs or PR notes when tests reveal or encode important behavior around:
- API contract
- error contract
- auth/authorization
- tenant boundary
- database migrations
- security behavior
- e2e user flows
- public/external contract behavior
