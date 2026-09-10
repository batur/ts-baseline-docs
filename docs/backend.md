# Backend Standard: Nest.js

## Purpose

This document defines how Nest.js applications fit into the TypeScript baseline. Nest provides the
runtime module graph, dependency injection and HTTP integration; business policy remains in
framework-independent project components.

## Canonical Structure

```txt
apps/
  api/
    src/
      app/
        app.module.ts
        bootstrap.ts
        container.ts
        server.ts
      modules/
        users/
          users.module.ts
          user.controller.ts
          user.service.ts
          user.schema.ts
          user.types.ts
          user.repository.ts
          user.serializer.ts
          user.openapi.ts
          index.ts
      shared/
        config/
        errors/
        http/
        logger/
        validation/
      main.ts
    test/
      e2e/
```

Nest's `main.ts`, root module, controller, service and test layout remains recognizable from the
official starter. The baseline adds capability ownership and explicit application/infrastructure
boundaries around it.

## Separation of Concerns

- `main.ts` and `app/` bootstrap Nest, load typed configuration, compose dependencies, register
  global middleware/guards/pipes/interceptors/filters and enable graceful shutdown.
- Feature modules group a business capability and expose only their public Nest/API surface through
  module exports and `index.ts`.
- Controllers translate HTTP input/output and delegate immediately to application services or
  use-cases. They do not contain business policy.
- Application services/use-cases coordinate business flow and authorization using framework-neutral
  contracts.
- Domain code contains business invariants and does not import Nest, HTTP, database or provider SDKs.
- Repositories and provider adapters implement contracts and hide infrastructure details.
- Serializers produce public response DTOs. Database rows and provider responses are never returned
  directly from controllers.

Start flat within a feature. Introduce `domain/`, `application/`, `infrastructure/` or
`presentation/` only when the feature's complexity requires it.

## Modules and Providers

Nest modules encapsulate providers. Use explicit `imports` and `exports` as the module's public API.
Avoid `@Global()` except for genuinely application-wide technical infrastructure, registered once in
the root module. Prefer constructor injection. When injecting an interface or other erased type,
define a stable token and use `@Inject()` at the infrastructure/composition boundary.

Singleton providers are the default. Request scope is an explicit exception requiring a documented
reason, lifecycle impact and performance review. Avoid circular dependencies, property injection and
service locators. Do not create global technical folders such as `services/`, `repositories/`,
`controllers/` or `dtos/`; keep ownership inside the feature module.

## Request Lifecycle

Use Nest's lifecycle deliberately:

```txt
middleware -> guards -> interceptors -> pipes -> controller/use-case
           <- interceptors <- exception filters on failure
```

- Middleware performs cross-cutting request preprocessing.
- Guards authenticate and make coarse route access decisions.
- Interceptors handle timing, correlation, tracing and carefully defined response concerns.
- Pipes parse and validate transport input at the boundary.
- Exception filters translate failures into the shared safe error envelope.
- Controllers perform transport orchestration only.

Business authorization and tenant checks remain in use-cases/policies even when guards provide an
early route-level check.

## Zod Validation

Nest's `ValidationPipe`, `class-validator` and `class-transformer` are not the project default.
Zod remains authoritative for runtime validation:

- Use a custom Zod pipe or equivalent Nest boundary adapter for body, query, path, header, webhook
  and provider input.
- Use `safeParse` at request boundaries and map failures to the existing error envelope.
- Keep schemas next to the owning feature and separate structural validation from business rules.
- Do not duplicate schemas in class-validator DTOs merely to satisfy decorators.
- If a concrete runtime class is required by an integration, isolate it in presentation/integration
  code and keep Zod as the source of truth where possible.

## OpenAPI

The existing Zod schemas and route metadata remain the API contract and source for generated
OpenAPI. `@nestjs/swagger` is optional and may serve Swagger UI or integrate Nest metadata, but it
must not introduce a second undocumented contract.

Preserve `/api/v1`, response/error envelopes, pagination, security schemes and stale-generated-file
checks. Configure versioning before eagerly generating a document; Nest documents that eager
generation can omit the version prefix. Prefer a document factory where applicable.

## Configuration and Bootstrap

Read environment variables only in the composition/configuration boundary. Validate them at startup
with Zod, produce typed config objects, and inject those objects into adapters. Providers and
repositories must not read `process.env` directly. Bootstrap must register security headers, CORS,
request IDs, global validation/error handling and shutdown hooks deliberately rather than hiding
them in arbitrary modules.

## Optional Packages and Tools

| Package/tool                                            | Profile and boundary                         | Required controls                                                 |
| ------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------- |
| `@nestjs/common`, `@nestjs/core`                        | Required Nest runtime                        | Keep framework usage at the edges                                 |
| `@nestjs/platform-express` / `@nestjs/platform-fastify` | Choose one HTTP adapter                      | Document adapter-specific middleware and security behavior        |
| `@nestjs/config`                                        | Configuration integration                    | Zod startup validation; no scattered environment reads            |
| `@nestjs/swagger`                                       | Optional OpenAPI/Swagger integration         | Zod/route metadata remains authoritative                          |
| `@nestjs/testing`                                       | Nest container/module tests                  | Run under Vitest; test behavior, not internals                    |
| `@nestjs/terminus`                                      | Health/readiness checks                      | Dependency checks, timeouts and observability                     |
| `@nestjs/throttler`                                     | Public/auth-sensitive/expensive route limits | Typed config, `429` envelope and `Retry-After` where useful       |
| `@nestjs/schedule`                                      | Scheduled jobs                               | Idempotency, locking where needed, metrics and failure handling   |
| `@nestjs/bullmq` or queue adapter                       | Asynchronous work                            | Validated payloads, retries, idempotency, dead-letter handling    |
| Passport/JWT integrations                               | Authentication adapter                       | Normalize to `AuthContext`; never pass raw sessions/tokens inward |
| `helmet`                                                | HTTP security headers                        | Adapter-compatible CSP/header configuration                       |
| Pino integration                                        | Logging adapter                              | Structured logs, request IDs and sensitive-data exclusion         |
| WebSockets, microservices, GraphQL, CQRS/events         | Advanced profile                             | Separate ADR, contract tests, lifecycle and deployment review     |

Every optional dependency requires a written justification, allowed import boundary, configuration
and secret policy, failure/lifecycle behavior, tests, observability, and a note about public API or
deployment impact.

## CLI and Boilerplate

Use the Nest CLI for repeatable generation, including strict TypeScript projects. Treat generated
controllers, services, DTOs, tests and modules as scaffolding: review imports, reshape files into
the owning capability, replace class-validator assumptions with Zod, and add the project's error,
OpenAPI, security and testing behavior before merge.

## References

- [Nest modules](https://docs.nestjs.com/modules)
- [Nest providers and dependency injection](https://docs.nestjs.com/components)
- [Nest request lifecycle](https://docs.nestjs.com/faq/request-lifecycle)
- [Nest configuration](https://docs.nestjs.com/techniques/configuration)
- [Nest validation](https://docs.nestjs.com/techniques/validation)
- [Nest OpenAPI](https://docs.nestjs.com/openapi/introduction)
- [Nest TypeScript starter](https://github.com/nestjs/typescript-starter)
- [Nest feature sample](https://github.com/nestjs/nest/tree/master/sample/01-cats-app)
- [Nest dynamic module sample](https://github.com/nestjs/nest/tree/master/sample/25-dynamic-modules)
- [Nest microservices sample](https://github.com/nestjs/nest/tree/master/sample/03-microservices)
