# Quickstart: Validate the Engineering Baseline Plan and Contracts

This guide covers Gate 2 validation only. It does not authorize implementation.

## Prerequisites

- Node.js 22 and pnpm 11.9.0
- Git
- `uv` or another supported way to run GitHub Spec Kit 1.0.5
- Repository branch `feat/engineering-baseline-0.1.0`

## 1. Confirm Gate 1

```sh
rg -n '^\*\*Status\*\*: Approved|^\*\*Decision\*\*: Approved' \
  specs/001-engineering-baseline/checklists/gate-1.md
```

Expected: both the gate status and decision are `Approved`.

## 2. Review Phase 1 design

Review these files in order:

1. `specs/001-engineering-baseline/plan.md`
2. `specs/001-engineering-baseline/research.md`
3. `specs/001-engineering-baseline/data-model.md`
4. `specs/001-engineering-baseline/contracts/contract-manifest.schema.json`
5. `specs/001-engineering-baseline/contracts/baseline-config.schema.json`
6. `specs/001-engineering-baseline/contracts/traceability-report.schema.json`
7. `specs/001-engineering-baseline/contracts/engineering-baseline.contracts.yaml`
8. `contracts/openapi/baseline-api.yaml`
9. `redocly.yaml`

Confirm that the plan contains no implementation permission and that the users API contract keeps
the current `createUser` and `listUsers` operations, paths, response statuses, bearer security,
and envelope shapes.

## 3. Run currently available deterministic checks

Before implementation dependencies exist, run the repository-independent checks:

```sh
.specify/scripts/bash/check-prerequisites.sh --json --paths-only

rg -n 'NEEDS[[:space:]]+CLARIFICATION' specs/001-engineering-baseline .specify/memory && exit 1 || true

shasum -a 256 contracts/openapi/baseline-api.yaml

pnpm --package=@redocly/cli@2.51.2 dlx redocly lint contracts/openapi/baseline-api.yaml
```

Expected:

- Spec Kit resolves `specs/001-engineering-baseline`.
- No unresolved clarification marker is printed.
- The OpenAPI digest equals the `artifactSha256` recorded in the contract manifest.
- Redocly reports that the API description is valid.

## 4. Check the pinned Spec Kit installation

```sh
UV_CACHE_DIR=/tmp/typescript-baseline-spec-kit \
  uvx --from git+https://github.com/github/spec-kit.git@v1.0.5 specify --version
```

Expected: `specify 1.0.5`.

## 5. Gate 2 decision

Gate 2 approves the implementation plan and applicable contracts at their recorded digests. Any
subsequent change to those reviewed artifacts invalidates the approval. After approval, tasks are
generated and analyzed before the first Cucumber/Vitest implementation cycle.

The following commands are planned but intentionally unavailable until implementation:

```text
pnpm speckit:check
pnpm traceability:check
pnpm contracts:check
pnpm test:bdd:dry
pnpm test:bdd
pnpm baseline:check
```
