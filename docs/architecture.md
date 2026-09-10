# Architecture

## Purpose

This document describes the high-level architecture rules for TypeScript projects using this
baseline. Business policy remains independent from frameworks, databases, SDKs, queues, caches and
UI libraries.

## Canonical Full-Stack Layout

Use capability-oriented applications and optional shared packages:

```txt
src/apps/
  api/
    app/                       # Nest composition root and bootstrap
    modules/                   # backend business capabilities
    shared/                    # backend technical adapters
  web-vite/
    app/                       # Vite providers and composition
    routes/                    # TanStack Router route inputs
    features/                  # frontend capabilities
    shared/                    # frontend technical/UI code
    main.tsx                   # browser entrypoint
  web-next/
    app/                       # Next route files and server composition
    features/                  # frontend capabilities
    shared/                    # frontend technical/UI code
packages/
  contracts/                   # optional schemas/types with demonstrated reuse
  ui/                          # optional domain-independent UI with demonstrated reuse
  config/                      # optional shared tooling/configuration
```

The repository examples live under `src/apps/api`, `src/apps/web-vite` and `src/apps/web-next`.
Backend capabilities use `modules/`; frontend capabilities use `features/`. These names are
deliberate: Nest modules are dependency-injection/framework composition boundaries, while frontend
features own UI behavior and browser data flows.

## Application Boundaries

### Nest.js API

`apps/api/app/` is the composition root. `apps/api/modules/` owns backend capabilities and exposes
explicit module APIs. Controllers, guards, pipes, interceptors and exception filters are transport
and lifecycle adapters. Application services/use-cases contain business flow, domain policies stay
framework-independent, repositories/providers hide external systems, and serializers produce public
API responses.

### Vite SPA

`apps/web-vite/main.tsx` is the browser entrypoint. `app/` owns providers and composition, `routes/`
contains TanStack Router file-based route inputs, `features/` owns capability behavior, and `shared/`
contains technical/UI code. Vite runs client-only browser runtime code; it does not provide Next.js
server components or request-scoped server state. `import.meta.env` is accessed only through typed
client configuration.

### Next.js App Router

`apps/web-next/app/` contains framework route files. `layout.tsx` and `page.tsx` compose features;
they do not become a second location for feature implementation. Server Components are the default.
Client state, event handlers, effects and browser APIs are isolated behind the smallest practical
`"use client"` boundary. Providers are placed as deep as practical, and `server-only` protects
privileged modules from client imports. Next navigation APIs are framework-specific; TanStack Router
is not used in this profile.

## State and Data Flow

```txt
route/layout composition
  -> feature screen
    -> TanStack Query (server state, cache, mutations)
      -> feature API boundary
        -> typed HTTP client
    -> Zustand selectors (synchronous client/UI state only)
    -> shadcn/Tailwind UI primitives
    -> Form/Table/Charts/Motion feature composition
```

TanStack Query is authoritative for API data. Zustand is limited to client-owned state such as
filters, layout preferences, dialogs and navigation state. Do not duplicate Query responses in
Zustand or use Query as a global client-state store. Validate API responses before Query returns them
to UI code. Validate URL/search/form/storage data at each browser boundary.

## Nest Request Direction and Lifecycle

The Nest dependency direction is:

```txt
main/bootstrap
  -> app module and composition root
    -> Nest feature modules
      -> middleware
        -> guards
          -> interceptors (pre-handler)
            -> pipes
              -> controllers (transport orchestration)
                -> application services / use-cases
                  -> domain policy
                -> repository and provider contracts
                  -> infrastructure adapters
            -> interceptors (response handling)
        -> exception filters (error translation)
```

- Middleware performs cross-cutting request preprocessing such as request IDs.
- Guards make authentication and coarse authorization decisions.
- Interceptors handle timing, tracing, response transformation and other cross-cutting concerns.
- Pipes parse transport values and validate external input with the project’s Zod adapter.
- Controllers map transport input to application calls and do not contain business rules.
- Exception filters translate known failures into the existing safe error envelope.

## Shared Packages

Packages under `packages/` are optional and require demonstrated reuse. `contracts/` may contain
Zod schemas or generated API contract types when multiple applications truly share the same public
contract. `ui/` may contain domain-independent primitives only after both applications reuse them.
`config/` may contain shared tooling configuration. Do not move business policy, tenant rules,
repositories, provider SDKs or feature components into a package merely to avoid duplication.

## Public and Private Boundaries

- Every backend module and frontend feature exposes supported APIs through `index.ts`.
- Files not exported by a public index are internal by default.
- Cross-component deep imports are forbidden.
- Same-component relative internal imports are allowed.
- Next route files and Vite route files may import a feature public API; feature internals do not
  import route files.
- Shared UI primitives are imported through `shared/ui/index.ts`.

## Dependency Direction

```txt
framework composition -> transport adapters -> application flow -> domain policy
                                              -> ports/contracts -> infrastructure adapters
route composition -> frontend feature -> shared technical/UI code
```

Rules:

- Controllers, guards, pipes, interceptors, route files and pages stay thin.
- Use-cases/application services contain business flow.
- Domain/application code does not import provider SDKs, database clients, Nest decorators or UI
  libraries.
- External systems are accessed through adapters and repository/provider ports.
- Serializers and mappers produce public API or view-ready shapes.
- Optional libraries remain at the layer that owns their responsibility.

## When to Add Layers

Start flat inside a component. Add `domain/`, `application/`, `infrastructure/` and `presentation/`
folders only when complexity, multiple adapters or independent lifecycle concerns justify them. Do
not create empty global `services/`, `repositories/`, `controllers/`, `dtos/` or `utils/` folders.

## Anti-Patterns

- A technical-layer-only Nest structure that separates one capability across global folders.
- Global modules or service containers that hide ownership.
- Route files containing feature business logic.
- A global Zustand store containing API responses or authentication tokens.
- TanStack Router in the Next.js profile.
- Framework-specific decorators or SDKs in domain/application policy.
- Cross-module or cross-feature deep imports.
- Circular dependencies between Nest modules.
