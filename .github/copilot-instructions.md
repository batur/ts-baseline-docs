# AI Coding Assistant Instructions

## Project Standards

- Use TypeScript strict mode.
- Use ESM only.
- Use pnpm.
- Use named exports.
- Use kebab-case file and folder names.
- Do not use default exports except framework/tooling conventions.
- Do not import across module internals.
- Use public module APIs through `index.ts`.
- Validate external input with Zod.
- Do not read `process.env` outside config modules.
- Do not return database/document rows directly from API.
- Use serializers for API responses.
- Do not log secrets, tokens, raw request bodies or provider responses.
- Do not add raw SQL without written justification and explicit review.
- Do not introduce `eval` or `new Function`.
- Add or update tests for behavior changes.

## Architecture Rules

- Keep controllers/routes thin.
- Put business logic in use-cases/application layer.
- Keep domain/application logic independent from frameworks, databases and provider SDKs.
- Use adapters for external systems.
- Enforce authorization server-side.
- Tenant-scoped queries must include tenant/org boundaries.

## Product Delivery Rules

- Use `validate-poc` when a consequential feasibility assumption is unresolved.
- Define PoC success, failure and inconclusive criteria before implementation.
- Treat a PoC result as decision evidence, not production readiness.
- Use `build-mvp` only when critical feasibility is sufficiently resolved.
- Keep an MVP to one primary end-to-end outcome for a defined early audience.
- Minimize MVP feature scope, not security, data integrity, testing, observability, deployment, rollback or support.
- Audit PoC code against the target quality floor before reusing it in an MVP.

## Before Completing a Task

- Run or update relevant tests.
- Update OpenAPI docs if API changed.
- Add migration if database schema changed.
- Update ADR/docs if an architectural decision changed.
- Ensure no secrets or sensitive data are added.
