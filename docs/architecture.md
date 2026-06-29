# Architecture

## Purpose

This document describes the high-level architecture rules for TypeScript projects using this baseline.

## Architectural Principle

Business policy should not be controlled by implementation details such as databases, frameworks, SDKs, queues, caches, payment providers, AI providers or UI libraries.

Details are placed at the edges. Business/application logic stays in the center.

## Component-Based Architecture

Projects are organized by business capability and responsibility, not only by technical layer.

Backend default:

```txt
src/
  app/
    bootstrap.ts
    container.ts
    server.ts
  modules/
    users/
      index.ts
      user.schema.ts
      user.types.ts
      create-user.use-case.ts
      update-user.use-case.ts
      user.repository.ts
      user.serializer.ts
  shared/
    config/
    errors/
    logger/
    validation/
    http/
  main.ts
```

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
