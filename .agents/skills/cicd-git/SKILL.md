---
name: cicd-git
description: Enforces CI/CD and Git workflow standards for TypeScript projects. Use when creating or reviewing branches, commits, pull requests, GitHub Actions, deployment pipelines, release/versioning, CODEOWNERS, hooks, secret scanning, OpenAPI checks, migrations, raw SQL gates, or day-one deployability.
license: Proprietary
compatibility: Designed for VS Code Agent Skills and Agent Skills compatible coding agents working in TypeScript repositories.
metadata:
  version: "1.0.0"
  domain: "software-architecture-and-design"
  owner: "red-mansion-software-consultancy"
---

# CI/CD & Git Skill

Use this skill for repository workflow, Git policy, CI checks, deployment, release/versioning, PR process, local hooks, CODEOWNERS, secret scanning, migrations, OpenAPI stale checks, or raw SQL review gates.

Apply this skill strictly unless a newer accepted ADR supersedes it.

For templates and longer examples, see [references/templates.md](references/templates.md).

## Goals

- Keep `main` protected and deployable.
- Make every project deployable from day one, including PoC and Alpha.
- Enforce `main + PR` for every change.
- Run quality and security gates locally and in CI.
- Require explicit review for migrations, destructive changes, raw SQL, OpenAPI drift, and AI-generated code.
- Use Semantic Versioning from the first version.

## Trigger this skill when the task affects

- branches, commits, PRs, merge rules, protected branches
- `CODEOWNERS`, PR templates, repo settings
- Conventional Commits, commitlint, changelog, releases, version bumps
- GitHub Actions or equivalent CI/CD
- pnpm lockfile and install behavior
- pre-commit, commit-msg, pre-push hooks, lefthook, Husky, lint-staged
- secret scanning with gitleaks, trufflehog, or platform scanning
- OpenAPI stale checks
- database migration checks
- destructive migrations
- raw SQL review gates
- dependency audit
- Playwright e2e in CI
- staging, preview, production deployments
- rollback strategy
- AI-generated code merge policy

## Required repository baseline

Minimum:

```txt
.github/CODEOWNERS
.github/pull_request_template.md
.github/workflows/ci.yml
package.json
pnpm-lock.yaml
README.md
```

Recommended with hooks:

```txt
lefthook.yml
commitlint.config.js
```

Relevant docs when applicable:

```txt
docs/deployment.md
docs/security.md
docs/database.md
docs/openapi/openapi.yaml
```

## Branch strategy

Required:

- `main` is always protected.
- `main` is always deployable.
- Direct push to `main` is forbidden.
- Every change enters `main` through a PR.
- Small, solo, PoC, and Alpha projects are not exempt.

Default branch names:

```txt
feature/<topic>
fix/<topic>
chore/<topic>
ci/<topic>
docs/<topic>
```

Do not add long-lived branches unless a project ADR accepts them.

## Day-one deployability

Every project must be deployable when the first development commit reaches `main`.

Minimum requirements:

- build command exists and passes
- CI workflow exists and runs on PRs
- deployment target exists or is documented
- environment strategy exists
- `.env.example` documents required env values
- backend/API has a health check when applicable
- version is defined
- rollback strategy is documented, even if minimal

Acceptable early targets: Vercel, Netlify, Render, Railway, Fly.io, Azure, AWS, Docker image, internal staging URL, static frontend deploy, or preview deployment.

## Protected branch rules

`main` must enforce:

- require PR before merge
- require required status checks
- block force pushes
- block branch deletion
- restrict direct pushes
- require CODEOWNER review for protected paths

Recommended:

- require branch up to date when CI drift is risky
- require linear history when appropriate

## CODEOWNERS

`CODEOWNERS` is mandatory.

Critical paths must always have owners:

- CI workflows
- auth/security modules
- database/persistence modules
- migrations
- OpenAPI contracts
- ADRs and engineering standards
- deployment config
- env/secrets/config handling

Use the template in [references/templates.md](references/templates.md).

## Conventional Commits

Conventional Commits are mandatory.

Format:

```txt
type(scope): description
```

Allowed types:

```txt
feat fix docs test refactor chore ci build perf style revert
```

Rules:

- validate commit messages with a `commit-msg` hook
- use meaningful scopes when helpful
- use breaking change markers when needed
- reject vague messages like `update` or `fix stuff`

## Semantic Versioning

Semantic Versioning is mandatory for every project.

Format:

```txt
MAJOR.MINOR.PATCH
```

Rules:

- `PATCH`: backward-compatible bug fix
- `MINOR`: backward-compatible feature
- `MAJOR`: breaking change
- PoC and Alpha use `0.x.y`
- pre-release labels are allowed

Expose release metadata:

```txt
RELEASE_VERSION
COMMIT_SHA
```

Review version bumps when public API, generated SDKs, database behavior, deployment behavior, or documented contracts change.

## Pull request standard

A PR template is mandatory at `.github/pull_request_template.md`.

Every PR must explain:

- summary
- why the change exists
- testing performed
- risk and rollback notes
- migration, OpenAPI, env, security, raw SQL, or AI-generated code impact

Use the template in [references/templates.md](references/templates.md).

AI agents must update checklist items when their change affects a listed area.

## Required CI checks

Every PR must run:

```txt
format:check
lint
typecheck
test
build
dependency audit
secret scan
```

API projects additionally run `openapi:check`.

UI apps or critical flows additionally run `test:e2e`.

Database projects must ensure schema changes include migrations when applicable.

## Standard scripts

Use scripts for format, lint, typecheck, test, build, e2e, OpenAPI generation/check, migrations, secret scanning, audit, commitlint, and hook installation when relevant.

See [references/templates.md](references/templates.md) for package script examples.

Only omit scripts that are irrelevant to the project type. Do not remove required gates without an ADR.

## CI workflow baseline

Use GitHub Actions or an equivalent CI provider.

Baseline CI must:

- check out code
- set up pnpm
- set up Node
- install with frozen lockfile
- run format check
- run lint
- run typecheck
- run tests
- run build

Add project-specific jobs for OpenAPI, Playwright, audit, secret scan, Docker, deployment, and migration checks.

See [references/templates.md](references/templates.md) for a workflow example.

## pnpm and lockfile rules

Required:

- use pnpm
- commit `pnpm-lock.yaml`
- run `pnpm install --frozen-lockfile` in CI
- review lockfile changes

When adding dependencies, review necessity, alternatives, runtime/bundle impact, and security risk.

## Local hooks

Pre-commit checks are mandatory.

Commit message validation is mandatory.

Recommended tool: `lefthook`.

Acceptable alternative: `husky + lint-staged`.

Local hooks should cover:

- format check
- lint
- staged secret scan
- commit message validation
- typecheck/test/build at pre-push or CI level

CI remains the source of truth. Hooks are early guardrails.

## Secret scanning

Run staged secret scanning before commit.

Run full repository secret scanning in CI when available.

Recommended commands:

```bash
gitleaks protect --staged --verbose
gitleaks detect --source . --verbose
```

If a secret leaks: stop using it, rotate/revoke it, remove from history if required, and document according to project policy. Deleting a commit is not enough.

## Dependency audit

Run dependency audit in CI.

Default:

```bash
pnpm audit
```

High/critical vulnerabilities should block merge unless an exception is documented in `docs/security/dependency-exceptions.md`.

Each exception should include package, vulnerability ID, severity, reason accepted, runtime path, mitigation, review date, and owner.

## OpenAPI gate

For API projects, generated OpenAPI must not be stale.

Default check:

```bash
pnpm openapi:generate
git diff --exit-code docs/openapi/openapi.yaml
```

Fail CI when route/schema changes are not reflected in generated OpenAPI.

## Database migration gate

When DB schema changes, migration files must be included where supported.

Rules:

- no production schema push
- commit migration files
- destructive migrations require explicit review
- data migrations require forward/rollback notes
- PR must describe production impact

Destructive examples: `DROP COLUMN`, `DROP TABLE`, `ALTER COLUMN TYPE`, `SET NOT NULL` on existing nullable columns, or large table rewrites.

## Raw SQL gate

Raw SQL requires written justification and explicit review.

Every raw SQL addition must explain:

- why ORM/query builder is insufficient
- whether all user input is parameterized
- how tenant/organization filtering is enforced
- index/performance impact
- transaction needs
- test coverage

Reject raw SQL that concatenates user input into query strings.

## E2E strategy

Playwright is the default e2e tool.

E2E tests are required for UI apps and critical flows, including auth, billing/payment, destructive admin actions, and onboarding.

Execution strategy:

- small projects: every PR
- larger projects: critical subset on PR, full suite on `main` or scheduled/nightly

E2E tests live under `tests/e2e/`.

## Deployment strategy

Production deploys only from:

```txt
main
release tags
```

Recommended environments:

```txt
development
preview
staging
production
```

Rules:

- use staging or preview before production when possible
- store secrets per environment
- never share production secrets with preview
- production deploys require rollback strategy
- DB migration deploys require compatibility review

## Rollback strategy

Every deployable project must define rollback.

Acceptable strategies:

- redeploy previous version
- previous Docker image
- revert release tag
- roll forward with hotfix
- disable feature flag if available

For migration-heavy releases, prefer backward-compatible expand/contract migrations.

## AI-generated code policy

AI-generated code is untrusted until reviewed.

Before merge, ensure:

- human review completed
- tests added or updated
- no hardcoded secrets
- no unsafe `eval` or `new Function`
- no auth bypass
- no raw SQL without justification
- no sensitive logging
- no missing OpenAPI update
- no missing migration
- no missing docs/ADR when behavior or architecture changed

## AI coding workflow

When changing CI/CD or Git workflow:

1. Identify affected workflow: branch, commit, PR, CI, deploy, release, hooks, secrets, migrations, OpenAPI, or raw SQL.
2. Check existing ADRs and repo conventions.
3. Preserve `main + PR` and day-one deployability.
4. Add or update config files.
5. Add package scripts only when dependencies/tooling exist or are documented.
6. Update PR template/checklists when adding a review gate.
7. Update docs for deployment, release, env, migration, or security behavior changes.
8. Ensure local hooks and CI do not disagree.

## AI review checklist

Request changes if:

- direct push to `main` is possible
- PR workflow is bypassed
- CODEOWNERS is missing or too weak
- PR template is missing
- Conventional Commits are not enforced
- SemVer is missing or ignored
- CI lacks lint/typecheck/test/build
- hooks are missing for pre-commit or commit-msg validation
- staged secret scanning is missing
- CI secret scanning is missing when available
- API changes do not update/check OpenAPI
- DB schema changes lack migrations
- destructive migrations lack review notes
- raw SQL lacks written justification
- e2e-critical flows are uncovered
- production deploys from unsafe sources
- rollback strategy is missing
- AI-generated code lacks review/tests/security checks

## Anti-patterns

Do not:

- allow direct pushes to `main`
- exempt PoC/Alpha from deployment discipline
- skip PRs because the project is small
- leave critical paths without CODEOWNERS
- use vague commit messages
- rely only on hooks without CI
- store secrets in repo files
- ignore `pnpm-lock.yaml`
- deploy production from random feature branches
- run production schema push
- add raw SQL without review
- merge API changes with stale OpenAPI
- merge auth/security/tenant changes without tests

## Required outputs by task

When adding CI: add workflow, required package scripts, and README/docs command notes.

When adding Git policy: add CODEOWNERS, PR template, commitlint config, and hook config.

When adding deployment: add environment docs, deploy workflow/config, rollback note, and release version handling.

When adding DB schema changes: add migration, PR migration notes, and persistence tests when behavior matters.

When adding API routes: update/generate OpenAPI, pass `openapi:check`, and add relevant API tests.
