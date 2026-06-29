# ADR-0001: Runtime and Package Manager

## Status

Accepted.

## Context

TypeScript projects need a consistent runtime and package management baseline.

## Decision

Node.js is the default runtime. pnpm is the default package manager. ESM is the default and only module system. Monorepo is not a default goal; if needed later, dedicated tools such as Turborepo, Nx, Moon, Lage or pnpm workspaces may be evaluated.

Deno is not the default package manager/runtime baseline. Deno-native boilerplates may be created later for secure scripts, CLI, edge or automation use cases.

## Consequences

Projects start with a familiar Node.js ecosystem, deterministic pnpm installs and modern ESM modules.
