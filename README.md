# TypeScript Software Architecture & Design Baseline

![CI](https://github.com/batur/ts-baseline-docs/actions/workflows/ci.yml/badge.svg)
![Release](https://img.shields.io/github/v/release/batur/ts-baseline-docs?include_prereleases)
![License](https://img.shields.io/github/license/batur/ts-baseline-docs)

This repository documentation package defines the shared TypeScript engineering baseline for backend, frontend, AI, automation and fullstack projects.

## Purpose

The goal is to create projects that are secure by default, deployable from day one, easy to evolve, easy to test, and understandable by both humans and AI coding assistants.

## Status

Baseline documentation package: Accepted.

## Default Stack

- Runtime: Node.js
- Package manager: pnpm
- Module system: ESM
- Validation: Zod
- Linting: ESLint
- Formatting: Prettier
- Unit/component/integration tests: Vitest
- E2E tests: Playwright
- Default database: PostgreSQL
- Default BaaS: Supabase
- Default ORM for PostgreSQL/Supabase: Drizzle
- API documentation: OpenAPI, code-first from Zod schemas and route metadata

## Documentation

- [Architecture](docs/architecture.md)
- [Engineering Standards](docs/engineering-standards.md)
- [Product Delivery Standard](docs/product-delivery.md)
- [API Standard](docs/api.md)
- [Security Standard](docs/security.md)
- [Testing Standard](docs/testing.md)
- [Database Standard](docs/database.md)
- [Deployment Standard](docs/deployment.md)
- [Observability Standard](docs/observability.md)
- [Product Context Template](docs/product.md)
- [Architecture Decision Records](docs/adr/)

## Required Repository Files

- `.github/CODEOWNERS`
- `.github/pull_request_template.md`
- `.github/copilot-instructions.md`
- `docs/adr/*`
- `docs/engineering-standards.md`

## Common Commands

```bash
pnpm install
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm openapi:check
pnpm secrets:scan
```

## Core Principle

Architecture should keep business policy at the center. Frameworks, databases, SDKs, APIs, UI libraries, queues, caches and AI providers are implementation details and should remain replaceable through clear boundaries.

## How to use with VS Code Agent Skills

This repository contains project-level Agent Skills for TypeScript software architecture, coding, and review workflows.

VS Code supports project skills from the following locations:

```txt
.github/skills/
.claude/skills/
.agents/skills/
```

Use the delivery skills according to the decision being made:

- [`validate-poc`](.agents/skills/validate-poc/SKILL.md) tests one to three high-impact uncertainties with explicit success, failure and inconclusive criteria. It ends with a Go, Pivot, Stop or Inconclusive recommendation and does not imply production readiness.
- [`build-mvp`](.agents/skills/build-mvp/SKILL.md) delivers the smallest releasable end-to-end outcome for a defined early audience. It minimizes feature scope while retaining the applicable security, data integrity, validation, testing, observability, deployment, rollback and support requirements.

Use `validate-poc` before `build-mvp` when a critical feasibility assumption remains unresolved. See the [Product Delivery Standard](docs/product-delivery.md) and [ADR-0017](docs/adr/0017-poc-and-mvp-delivery-standard.md) for the governing policy.
