---
name: ai-coding-review
description: Meta skill for AI coding agents and reviewers in TypeScript software projects. Use when planning, implementing, refactoring, reviewing, or approving AI-generated code; when deciding which project skill to apply; when enforcing architecture, API, security, testing, documentation, CI/CD, validation, error handling, persistence, auth, logging, and OpenAPI standards together.
license: Proprietary. Internal project skill.
compatibility: Designed for VS Code Agent Skills and Agent Skills compatible coding agents working in TypeScript repositories.
metadata:
  project: software-architecture-and-design
  domain: ai-coding-review
  version: "1.0.0"
---

# AI Coding & Review Meta Skill

## When to use this skill

Use this skill whenever an AI coding agent or reviewer must:

- Plan, implement, refactor, or review TypeScript application code.
- Coordinate multiple engineering standards at once.
- Decide which specialized project skill should guide the task.
- Review AI-generated code before it is merged.
- Convert a requirement into safe, testable, maintainable implementation work.
- Check whether a change respects architecture, security, API, testing, documentation, and CI/CD standards.
- Produce an implementation plan for a coding agent.
- Produce a PR review or self-review for a generated change.

This is a meta skill. It does not replace the specialized skills. It tells the agent how to orchestrate them.

## Primary goal

Produce code that is simple, secure, testable, typed, reviewable, documented where necessary, and aligned with the project architecture.

AI-generated code is untrusted until it is manually reviewed, tested, and security-checked.

## Global engineering principles

Follow these principles in every coding or review task:

- Optimize for clarity and low change cost.
- Prefer simple, explicit code over clever abstraction.
- Do not add architecture patterns before the problem needs them.
- Keep business policy independent from frameworks, databases, queues, SDKs, UI, and external providers.
- Keep responsibilities in the correct layer and component.
- Make dependencies explicit.
- Fail fast for invalid configuration and invalid boundary input.
- Treat external input as untrusted.
- Do not leak internal details, secrets, stack traces, provider responses, or database errors to clients.
- Test behavior, not implementation details.
- Update docs and ADRs in the same change when architecture, API, env, DB, security, deployment, or conventions change.

## Skill routing map

Before coding or reviewing, decide which specialized skills apply.

Use `typescript` when:

- Changing TypeScript configuration, strictness, module system, exports, imports, naming, or type modeling.
- Reviewing type safety, `unknown`, `never`, discriminated unions, or strict compiler behavior.

Use `eslint` when:

- Changing lint rules, import order, default export exceptions, naming rules, side-effect imports, or architecture import restrictions.
- Reviewing whether code violates enforced project conventions.

Use `component-architecture` when:

- Adding a module, feature, integration, adapter, repository, use-case, controller, route, or shared utility.
- Reviewing dependency direction, public APIs, cross-component imports, or circular dependencies.

Use `api-design` when:

- Designing or reviewing REST endpoints, resource naming, response envelopes, pagination, filtering, sorting, idempotency, or API DTOs.

Use `error-handling` when:

- Creating errors, mapping exceptions to HTTP status codes, returning error envelopes, logging errors, or normalizing provider/database failures.

Use `patch-update` when:

- Implementing or reviewing PATCH, partial update, nullable clear semantics, immutable fields, optimistic concurrency, or update validation.

Use `validation` when:

- Handling body, query, path, env, webhook, provider, browser storage, form, or AI output validation.
- Creating or reviewing Zod schemas.

Use `config-environment` when:

- Reading env variables, creating config modules, separating server/client config, parsing env types, or injecting config into adapters.

Use `logging-observability` when:

- Adding logs, request IDs, error tracking, health checks, metrics, tracing, or external observability integrations.

Use `security-baseline` when:

- Handling auth, authorization, tenant boundaries, secrets, CORS, headers, rate limiting, injection, SSRF, file upload, webhooks, dependency risk, or AI app safety.

Use `auth-authorization` when:

- Implementing authentication, normalized `AuthContext`, permissions, roles, API keys, provider adapters, or tenant authorization.

Use `testing` when:

- Adding or reviewing unit, integration, e2e, contract, security, schema, auth, tenant, provider failure, or AI output tests.

Use `openapi` when:

- Adding or changing public API endpoints, schemas, operation IDs, examples, docs exposure, or stale OpenAPI generation checks.

Use `database-persistence` when:

- Designing persistence, migrations, repositories, transactions, tenant-safe queries, raw SQL, Supabase, Drizzle, Prisma, MongoDB, or Firebase access.

Use `cicd-git` when:

- Changing CI, Git hooks, branch protection, lockfiles, release/versioning, deployment, rollback, migrations in CI, or PR workflow.

Use `documentation-adr` when:

- Creating/updating README, docs, ADRs, diagrams, Copilot instructions, engineering standards, architecture docs, or decision history.

## Default implementation workflow

For every non-trivial code change:

1. Understand the product goal, non-goals, domain terms, entities, business rules, state transitions, external systems, security requirements, error cases, and expected tests.
2. Identify affected components and boundaries.
3. Select the relevant specialized skills from the routing map.
4. Check existing project structure and conventions before adding new patterns.
5. Prefer the smallest safe change that satisfies the requirement.
6. Create or update boundary schemas for untrusted input.
7. Keep controllers/routes thin.
8. Put business flow in use-cases/application services.
9. Keep domain logic free from framework, database, SDK, and transport details.
10. Put external SDK and provider code behind adapters.
11. Normalize outputs through serializers/DTOs.
12. Add or update tests for the behavior and failure paths.
13. Update OpenAPI/docs/ADR when the contract or decision changes.
14. Run or specify required checks: format, lint, typecheck, tests, build, and any relevant e2e/OpenAPI/security checks.
15. Produce a concise self-review explaining what changed, what was tested, and what risks remain.

## Default review workflow

When reviewing AI-generated code:

1. Read the requirement and identify the intended behavior.
2. Map the changed files to components and layers.
3. Check whether the code uses the correct specialized skills.
4. Look for architecture boundary violations before local code style issues.
5. Check security, authorization, tenant boundary, and data exposure risk.
6. Check validation and error behavior at every external boundary.
7. Check persistence boundaries, transactions, migrations, and tenant-safe queries.
8. Check API response shape, OpenAPI impact, and backward compatibility.
9. Check tests for meaningful behavior coverage and failure paths.
10. Check docs/ADR/CI updates when required.
11. Separate blocking issues from suggestions.
12. Provide actionable comments tied to concrete code locations or patterns.

## Required AI coding output format

For implementation tasks, produce this structure unless the user asks otherwise:

1. `Plan`
   - A short step-by-step implementation plan.
   - Mention which specialized skills apply.
2. `Changes`
   - Files to create or edit.
   - Main design decisions.
3. `Tests`
   - Tests to add or update.
   - Commands to run.
4. `Risks / Review notes`
   - Security, migration, compatibility, or deployment risks.

If directly editing files, keep the user updated and avoid excessive low-level narration.

## Required AI review output format

For review tasks, produce this structure:

1. `Verdict`
   - `Approve`, `Approve with comments`, or `Request changes`.
2. `Blocking issues`
   - Security, correctness, architecture, data loss, breaking API, failed tests, or missing critical tests.
3. `Non-blocking suggestions`
   - Maintainability, readability, naming, minor test improvements.
4. `Skill coverage`
   - Which specialized skills were relevant and whether they were satisfied.
5. `Required follow-up checks`
   - Commands, manual verification, docs, ADR, OpenAPI, migration, deployment checks.

## Non-negotiable baseline rules

### TypeScript

- Use strict TypeScript.
- Avoid `any`; prefer `unknown` plus validation/narrowing.
- Use ESM.
- Use named exports by default.
- Use `import type` for type-only imports.
- Use `node:` prefix for Node built-ins.
- Use kebab-case file/folder names.
- Use camelCase for functions/variables, PascalCase for types/classes, and SCREAMING_SNAKE_CASE for constants.
- Do not add default exports except framework/tooling conventions.

### Architecture

- Organize by business capability or responsibility, not only technical layer.
- Use `modules/` for backend business components and `features/` for frontend feature components.
- Use `shared/` only for domain-independent shared technical code.
- Expose each component through `index.ts` public API.
- Do not deep import another component's internals.
- Avoid circular dependencies.
- Do not let database, framework, UI, queue, cache, LLM, Slack, Supabase, Stripe, or any provider control business policy.

### API

- Use REST with `/api/v1` path versioning.
- Use plural kebab-case resource names.
- Use direct request DTOs without request envelopes.
- Use response envelope `{ data, meta }` for success.
- Use collection envelope `{ data, pagination, meta }` for lists.
- Use error envelope `{ error: { code, message, details?, requestId } }` for errors.
- Use stable machine-readable `error.code`.
- Use cursor pagination by default.
- Use OpenAPI for public endpoints.

### Validation

- Use Zod as default runtime validation.
- Validate external input at the boundary.
- Use `.strict()` for public API input schemas by default.
- Use `safeParse` for request/runtime input handling.
- Use `parse` for startup/fail-fast config validation.
- Normalize Zod errors to the standard API error envelope.
- Do not treat validation as a substitute for domain/business rules.

### Error handling

- Use safe client messages.
- Never return raw stack traces, provider errors, database errors, or internal exception details.
- Map malformed/structural input to 400.
- Map semantic/business validation to 422.
- Map authentication missing/invalid to 401.
- Map authenticated but forbidden to 403.
- Use 404 to avoid leaking cross-tenant resource existence when needed.
- Map conflicts to 409 and optimistic concurrency mismatches to 412.
- Map external provider failures to 502/504 where appropriate.

### PATCH / Update

- Use PATCH for partial updates by default.
- Use PUT only for full replacement.
- Omitted field means unchanged.
- `null` clears a field only if the field is nullable and clearing is allowed.
- Empty PATCH body returns 400 `EMPTY_UPDATE`.
- Unknown fields return 400.
- Known immutable fields return 422.
- Default success response is 200 plus updated resource.

### Auth and authorization

- Separate authentication from authorization.
- Normalize provider-specific auth into `AuthContext`.
- Do not pass raw token/session/provider objects into use-cases.
- Use server-side authorization checks.
- Client-side permission checks are UX only.
- Prefer permission checks in `resource:action` format.
- Enforce tenant/organization boundaries in use-cases and queries.
- Store API keys hashed only and reveal raw key once at creation.

### Security

- Secure by default and fail closed.
- Treat all external input as untrusted.
- Keep secrets server-only.
- Do not log secrets, tokens, cookies, auth headers, raw bodies, payment data, sensitive personal data, or raw provider responses.
- Use production CORS allowlists.
- Use rate limiting for public or expensive endpoints.
- Prevent injection by using parameterized SQL/query builders and safe shell execution patterns.
- Review SSRF risk for user-provided URLs.
- Verify webhook signatures using raw body and replay protection.
- Validate file upload size, type, extension, path, and storage visibility.

### Config and environment

- Read `process.env` only in config/env modules.
- Validate env with Zod at startup.
- Fail fast on missing/invalid required config.
- Separate server env from client/public env.
- Use typed config objects.
- Inject config into adapters instead of reading env inside adapters.
- Keep `.env.example` updated.

### Logging and observability

- Use pino as default backend logger.
- Use structured JSON logs in production.
- Include an `event` field in every log.
- Propagate `requestId` and return `X-Request-Id`.
- Log request completion.
- Keep logger and error tracker separate.
- Use vendor adapters for Sentry, Datadog, New Relic, CloudWatch, Loki, or OpenTelemetry.
- Do not import observability vendor SDKs directly in application code.

### Persistence

- Default database is PostgreSQL.
- Default BaaS profile is Supabase.
- Default ORM is Drizzle; Prisma is an accepted alternative.
- Domain/application code must not import Drizzle, Prisma, Supabase, Firebase, MongoDB, Stripe, OpenAI, or other SDK details.
- Use versioned migrations where applicable.
- Do not use schema push for production.
- Use explicit transactions for related writes.
- Use tenant-scoped queries.
- Do not leak DB rows/documents as API DTOs.
- Raw SQL requires written justification and explicit review.

### Testing

- Use Vitest for unit/component/integration tests by default.
- Use Playwright for e2e tests by default.
- Put e2e tests under `tests/e2e`.
- Co-locate non-e2e tests.
- Use `.test.ts` suffix.
- Test behavior and failure paths.
- Add critical tests for validation, error envelope, PATCH, auth, tenant boundary, security-sensitive flows, provider failure, and AI output validation.
- Contract tests are optional by default but required for public, external, or multi-consumer APIs.
- Tests must be deterministic and must not connect to production or staging.

### CI/CD and Git

- Keep `main` protected.
- Use PRs for changes.
- Use CODEOWNERS.
- Use Conventional Commits.
- Use Semantic Versioning; PoC/Alpha can use `0.x.y`.
- Commit `pnpm-lock.yaml` and use frozen lockfile installs.
- CI must run format, lint, typecheck, test, and build.
- API projects must check stale OpenAPI generation.
- Run e2e for critical UI/API flows where applicable.
- Scan staged secrets before commit and full secrets in CI.
- Review migrations, destructive schema changes, and raw SQL explicitly.

### Documentation and ADR

- README is the onboarding entry point.
- Keep detailed docs under `docs/`.
- Keep ADRs under `docs/adr/`.
- Use sequential ADR numbering and never reuse numbers.
- Accepted ADRs are immutable; supersede with a new ADR.
- Newest accepted ADR wins.
- Use Mermaid as the default diagram source format.
- Keep `.github/copilot-instructions.md` updated.
- Update docs in the same PR when behavior, architecture, API, env, DB, security, or deployment changes.

## AI code generation rules

When generating code:

- Prefer existing project patterns over new abstractions.
- Do not invent missing requirements when a safe minimal assumption is enough.
- Do not create empty architecture folders.
- Do not introduce CQRS, event sourcing, microservices, plugin systems, or generic frameworks unless explicitly justified.
- Do not create `Manager`, `Helper`, `Util`, `Common`, or `misc` abstractions without a specific responsibility.
- Do not use provider SDKs outside infrastructure/adapter boundaries.
- Do not use client-provided IDs for authorization decisions without tenant checks.
- Do not trust AI output without schema validation.
- Do not bypass lint/typecheck/test failures.
- Do not hide uncertainty; document unresolved assumptions in review notes.

## AI review severity guide

Request changes for:

- Security vulnerability or secret exposure.
- Missing authorization or tenant boundary.
- Domain/application importing provider SDKs or database details.
- Public API contract break without documentation/versioning.
- Missing validation on external input.
- Unsafe error exposure.
- Data loss risk, unsafe migration, or transaction issue.
- Raw SQL without justification and review.
- Critical behavior without tests.
- CI/lint/typecheck/test failures.

Approve with comments for:

- Minor naming or readability issues.
- Non-critical missing edge-case test.
- Small duplication that does not increase risk yet.
- Documentation improvements not required for correctness.

Approve only when:

- The change satisfies the requirement.
- Boundaries are correct.
- Security and authorization are checked.
- Tests cover important behavior and failures.
- Docs/OpenAPI/ADR/CI changes are included when required.
- Remaining risks are acceptable and documented.

## Required self-review checklist

Before completing any AI coding task, verify:

- [ ] Correct specialized skills were applied.
- [ ] The change is minimal and aligned with project architecture.
- [ ] External input is validated.
- [ ] Authorization and tenant boundaries are enforced.
- [ ] Errors use the standard envelope and safe messages.
- [ ] Logs are structured and do not expose sensitive data.
- [ ] Persistence is behind the correct boundary.
- [ ] API DTOs are serialized and documented when public.
- [ ] Tests cover success and relevant failure paths.
- [ ] Docs, ADR, OpenAPI, env examples, and migrations are updated when required.
- [ ] Required commands are run or clearly listed.
- [ ] Any assumptions or unresolved risks are explicitly stated.

## Common anti-patterns

Reject or refactor these patterns:

- `any` used to silence type errors.
- `process.env` read across application code.
- Business logic inside controllers, routes, UI components, database models, or provider callbacks.
- Domain/application importing Prisma, Drizzle, Supabase, Firebase, MongoDB, OpenAI, Stripe, Slack, or framework-specific objects.
- Cross-module deep imports.
- `shared/utils/misc.ts` or catch-all helpers.
- Default exports outside approved framework/tooling conventions.
- Error responses based on raw exception messages.
- Logging raw request bodies, auth headers, tokens, cookies, or provider responses.
- PATCH implementation based on truthiness checks.
- Tenant queries such as `findById(id)` without tenant scope.
- Client-side authorization treated as real security.
- Generated OpenAPI not updated with API changes.
- Tests that only mirror implementation details.
- Snapshots used as a substitute for assertions.
- CI bypasses or ignored failing checks.
- ADRs rewritten after acceptance.

## Final answer expectations for coding agents

When the agent finishes a task, it should state:

- What changed.
- Which specialized skills were relevant.
- What was validated or tested.
- What commands were run or should be run.
- What docs/contracts/migrations were updated.
- What risks or assumptions remain.

Keep the final result concise, but never omit security, testing, or review-relevant caveats.
