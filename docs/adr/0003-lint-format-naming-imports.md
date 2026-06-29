# ADR-0003: Lint, Format, Naming and Imports

## Status

Accepted.

## Context

Projects need consistent style, imports and export conventions.

## Decision

ESLint and Prettier are required. Use a modern ESLint base with Google TypeScript guide-inspired conventions.

Files and folders use kebab-case. Functions and variables use camelCase. Types and classes use PascalCase. Constants use SCREAMING_SNAKE_CASE. Interfaces do not use the `I` prefix.

Named exports are default. Default exports are allowed only for framework/tooling conventions.

Barrel exports are allowed only at public API boundaries. Cross-module deep imports are forbidden.

Type-only imports use `import type` and are placed in their own import group. Node built-ins use `node:` prefix.

Backend NodeNext imports use explicit `.js` extensions. Frontend/bundler imports may be extensionless.

## Consequences

The codebase stays consistent and easier to review across projects.
