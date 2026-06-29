# TypeScript Software Architecture & Design Baseline

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
