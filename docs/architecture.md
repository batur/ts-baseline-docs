# Architecture

## Purpose

This document describes the high-level architecture rules for TypeScript projects using this baseline.

## Architectural Principle

Business policy should not be controlled by implementation details such as databases, frameworks, SDKs, queues, caches, payment providers, AI providers or UI libraries.

Details are placed at the edges. Business/application logic stays in the center.

## Component-Based Architecture

Projects are organized by business capability and responsibility, not only by technical layer.

Canonical full-stack default:

```txt
apps/
  api/
    src/app/
    src/modules/
    src/shared/
  web/
    src/app/
    src/features/
    src/shared/
    src/main.tsx
packages/
  contracts/
  ui/
  config/
```

Backend-only projects may retain the direct `src/app`, `src/modules` and `src/shared` layout. A
frontend-only project may retain a direct `src/` layout. The `apps/` layout is the default when
multiple deployable applications are present.

Frontend default:

```txt
src/
  app/
    providers/
    router.tsx
    app.tsx
  features/
    auth/
      index.ts
      auth.schema.ts
      auth.types.ts
      login-form.tsx
      use-login.ts
      auth.api.ts
  shared/
    ui/
    config/
    errors/
    http/
    validation/
  main.tsx
```

Backend capabilities use `modules/` for business ownership. Frontend capabilities use `features/`
for feature-owned UI, hooks, API calls, schemas and mappers. Next.js route files and Vite entrypoints
compose features rather than owning their business behavior. Optional shared packages require
demonstrated reuse and must remain domain-independent or explicitly contract-oriented.

For Nest.js backends, the runtime direction is:

```txt
main/bootstrap
  -> app module and composition root
    -> Nest feature modules
      -> controllers / guards / pipes / interceptors
        -> application services / use-cases
          -> domain policy
        -> repository and provider contracts
          -> infrastructure adapters
```

Middleware performs request preprocessing, guards make authentication/access decisions, interceptors
handle cross-cutting response concerns, pipes parse and validate transport input, and exception
filters translate failures. Controllers remain transport orchestration only. See the [Backend
Standard](backend.md).

## Public and Private Boundaries

- A component exposes its public API through `index.ts`.
- Files not exported from `index.ts` are internal by default.
- Cross-component deep imports are forbidden.
- Same-component relative internal imports are allowed.

## Dependency Direction

Preferred direction:

```txt
presentation -> application -> domain
infrastructure -> application/domain contracts
shared -> no business modules
```

Rules:

- Controllers/routes stay thin.
- Use-cases/application services contain business flow.
- Domain/application code does not import provider SDKs, database clients or framework-specific APIs.
- External systems are accessed through adapters.
- Repositories hide persistence details.
- Serializers produce API response DTOs.

## When to Add Layers

Do not create empty architecture folders by default. Start flat inside a component, then split into `domain/`, `application/`, `infrastructure/` and `presentation/` only when complexity requires it.

## Anti-Patterns

- `shared/utils/misc.ts`
- global `services/`
- global `repositories/`
- generic `Manager` / `Helper` classes
- controller business rules
- domain importing Stripe, Supabase, Prisma, Drizzle, Firebase or OpenAI SDKs
- cross-module deep imports
- circular dependencies
