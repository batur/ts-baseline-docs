# ADR-0015: CI/CD and Git Standard

## Status

Accepted.

## Context

Projects need day-one deployability, branch protection and automated quality/security checks.

## Decision

Every project must be deployable from day one. Even PoC/Alpha projects must deploy when the first development commit reaches `main`.

`main + PR` is always required. `main` is protected. Direct push is forbidden. CODEOWNERS is mandatory. Conventional Commits are mandatory. PR template is mandatory. Pre-commit checks and commit-msg validation are mandatory.

Staged secret scanning runs before commit. Full secret scanning runs in CI. Semantic Versioning is mandatory for every project; PoC/Alpha uses `0.x.y`.

CI runs format check, lint, typecheck, test and build. API projects run OpenAPI stale checks. UI/critical flows use Playwright E2E. Dependency audit runs in CI. Migration files are required for DB schema changes. Destructive migrations and raw SQL require explicit review.

Production deployment happens from `main` or release tags and requires rollback strategy.

## Consequences

Quality, security, release discipline and deployability are enforced from the first day.
