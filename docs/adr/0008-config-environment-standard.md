# ADR-0008: Config and Environment Standard

## Status

Accepted.

## Context

Raw environment variables are untyped and unsafe when accessed throughout the codebase.

## Decision

Environment variables are read and validated in a single configuration boundary using Zod. Application code consumes typed config objects and does not read `process.env` directly.

Invalid critical env values fail fast during startup. Server env and client env are separated. Secrets are never exposed to client bundles.

`.env.example` documents required variables. Secret `.env` files are not committed. Env names use SCREAMING_SNAKE_CASE. Boolean env values are parsed explicitly from `"true"` or `"false"`.

`NODE_ENV` is runtime/tooling mode. `APP_ENV` is deployment environment.

Adapters receive config through constructors/factories and do not read `process.env`.

Nest.js applications load configuration through the root/composition module. `@nestjs/config` may
provide Nest integration, but startup parsing and validation remain Zod-based. Typed config objects
are injected into adapters; providers and repositories do not read environment variables directly.

## Consequences

Configuration is safer, typed, testable and less likely to leak secrets.
