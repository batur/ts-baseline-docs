# ADR-0019: Nest.js Backend Architecture and Tooling

## Status

Accepted.

## Context

The baseline defines backend capabilities, API contracts, validation, security, persistence,
observability and testing, but it needs a framework-specific standard for Nest.js applications.
Nest's generated starter and samples provide useful runtime patterns, while the baseline requires
stronger component boundaries and already selects Zod, OpenAPI generation, ESM TypeScript, ESLint,
Vitest and Playwright.

## Decision

Nest.js is the backend framework boundary. In this repository the runnable backend example lives at
`src/apps/api`; in a multi-application workspace the equivalent application may be named `apps/api`.
Backend business capabilities remain feature-owned under `modules`. The Nest root module and
bootstrap compose dependencies and cross-cutting behavior. Controllers, guards, pipes, interceptors
and filters stay at transport/framework boundaries; application and domain policy remain
framework-independent.

Zod is the authoritative runtime validation library. Custom Nest boundary adapters translate Zod
results into the standard error envelope. Existing Zod schemas and route metadata remain the
authoritative OpenAPI source; `@nestjs/swagger` is optional integration/documentation tooling.

Vitest remains the test runner even though the Nest starter and many official samples use Jest.
`@nestjs/testing` may be used for container/module setup, while behavior is tested according to the
existing Vitest and Playwright standard.

Optional Nest packages require explicit justification, import boundaries, configuration, failure
behavior, tests, observability and public/deployment impact review.

## Consequences

- Nest conventions are usable without allowing framework classes to control business policy.
- Generated Nest boilerplate requires review before becoming project architecture.
- Zod/OpenAPI contracts remain consistent across non-Nest and Nest transports.
- The default backend has fewer dependencies; advanced capabilities require deliberate decisions.

## Alternatives Considered

- Technical-layer-only Nest folders: rejected because they weaken capability ownership.
- Global module/service organization: rejected because it hides dependencies and creates coupling.
- Class-validator as a second validation source: rejected because it duplicates and can diverge from
  the existing Zod contract.
- Unrestricted `@nestjs/swagger` decorator contracts: rejected because generated metadata could
  become a second undocumented API source.
- Add every Nest package by default: rejected because optional runtime and deployment complexity
  should follow actual requirements.
- Treat generated boilerplate as production architecture: rejected because scaffolding does not
  establish the project's security, contract or component boundaries.

## References

- [Backend Standard: Nest.js](../backend.md)
- [Nest modules](https://docs.nestjs.com/modules)
- [Nest providers](https://docs.nestjs.com/components)
- [Nest OpenAPI](https://docs.nestjs.com/openapi/introduction)
- [Nest TypeScript starter](https://github.com/nestjs/typescript-starter)
