---
name: component-architecture
description:
  Enforce the TypeScript component-based architecture baseline. Use when creating, moving, or
  reviewing modules, features, shared code, use-cases, controllers, routes, repositories, adapters,
  serializers, integrations, dependency boundaries, or cross-component imports.
compatibility:
  Designed for VS Code Agent Skills and Agent Skills compatible coding agents working in TypeScript
  repositories.
metadata:
  version: "1.0.0"
  domain: software-architecture
  baseline: typescript-architecture
---

# Component Architecture

## Goal

Use this skill to keep TypeScript projects organized around business capabilities and explicit
boundaries.

A component is an ownership and dependency boundary, not just a folder. Business policy must stay at
the center. Frameworks, databases, API clients, queues, caches, LLM providers, Supabase, Firebase,
MongoDB, Stripe, Slack, OpenAI, and other external systems are details that must not control
business rules.

Default to simple, explicit structure. Do not create unnecessary abstractions or empty architecture
folders before complexity requires them.

## When to use this skill

Use this skill when a task involves any of these actions:

- Add or change a backend business module.
- Add or change a frontend feature.
- Move code between folders or components.
- Create or review a controller, route, use-case, policy, repository, adapter, serializer, API
  client, schema, or shared utility.
- Add an external integration or provider SDK.
- Decide whether code belongs in `shared/`.
- Review imports across `modules/`, `features/`, `shared/`, or `app/`.
- Review AI-generated code for architectural boundary violations.
- Decide whether to introduce `domain/`, `application/`, `infrastructure/`, or `presentation/`
  folders.

## Canonical folder model

### Backend default

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
      user.errors.ts
      user.repository.ts
      create-user.use-case.ts
      update-user.use-case.ts
      user.serializer.ts
      user.test.ts

  shared/
    config/
      server-env.ts
      app-config.ts
    errors/
      app-error.ts
      error-code.ts
      http-error.mapper.ts
    logger/
      logger.ts
    validation/
      zod-error.mapper.ts
    http/
      pagination.ts

  main.ts
```

### Frontend default

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

    projects/
      index.ts
      project.schema.ts
      project.types.ts
      project-list.tsx
      project-card.tsx
      use-projects.ts
      projects.api.ts

  shared/
    ui/
      button.tsx
      dialog.tsx
    config/
      client-env.ts
    errors/
    http/
    validation/

  main.tsx
```

## Component types

Use these component categories:

1. Business components: `users`, `organizations`, `billing`, `projects`, `conversations`.
2. Frontend feature components: `auth`, `projects`, `settings`, `dashboard`.
3. Integration components: `stripe`, `slack`, `openai`, `gmail`, `supabase`, `firebase`.
4. Shared technical components: `logger`, `config`, `errors`, `validation`, `http`, `security`,
   `date`, `strings`.

Do not organize business code only by technical layers such as global `services/`, `repositories/`,
`controllers/`, or `types/` folders. Prefer capability ownership.

## Public and private boundaries

Each component exposes its public API through `index.ts`.

Files not exported from `index.ts` are internal by default.

Cross-component imports must go through the target component public API.

```ts
// Good
import { createUser } from "@/modules/users/index.js";

// Bad
import { createUser } from "@/modules/users/create-user.use-case.js";
```

Same-component internal files may use relative imports.

```ts
// Allowed inside src/modules/users/update-user.use-case.ts
import { USER_ERROR_CODE } from "./user.errors.js";
```

## Dependency direction

Use this dependency direction:

```txt
presentation -> application -> domain
infrastructure -> application/domain contracts
shared -> no business modules
app -> composition root and wiring
```

Rules:

- Controllers/routes stay thin.
- Use-cases/application services coordinate business flow.
- Domain logic must not import framework, database, SDK, HTTP, queue, or provider details.
- Infrastructure implements contracts and may import provider/database SDKs.
- `shared/` must not import business modules.
- `app/` wires dependencies, reads config, starts servers, and builds composition roots.

## Flat first, layered when needed

Start flat inside a component.

```txt
modules/users/
  index.ts
  user.schema.ts
  user.types.ts
  user.repository.ts
  drizzle-user.repository.ts
  create-user.use-case.ts
  user.serializer.ts
```

Introduce explicit folders only when complexity requires them.

```txt
modules/users/
  domain/
    user.ts
    user.errors.ts
  application/
    create-user.use-case.ts
    user.repository.ts
  infrastructure/
    drizzle-user.repository.ts
    user.mapper.ts
  presentation/
    user.serializer.ts
    user.routes.ts
```

Do not create empty architecture folders just to look clean. KISS and YAGNI apply.

## Backend rules

When creating or reviewing backend code:

- Routes/controllers validate boundary input, call use-cases, and return serialized responses.
- Request body, query, path params, webhooks, provider responses, and AI outputs are external inputs
  and must be validated at the boundary.
- Use-cases carry business flow and authorization checks.
- Repositories hide persistence details.
- Adapters hide external providers.
- Serializers produce API DTOs.
- Database rows must not be returned directly from API handlers.
- Domain/application code must not import Drizzle, Prisma, Supabase JS, Firebase SDK, MongoDB
  driver, OpenAI SDK, Stripe SDK, Slack SDK, or similar provider details.

## Frontend rules

When creating or reviewing frontend code:

- Use `features/` for feature-owned UI, hooks, schemas, and API calls.
- Use `shared/ui` only for generic, domain-independent UI components.
- Feature-specific UI belongs inside the feature, not `shared/ui`.
- A feature must not deep-import internals from another feature.
- API wrappers for a feature live inside that feature unless they are truly generic HTTP
  infrastructure.
- UI components should not perform hidden API response-to-domain transformations; use feature
  API/mapper/serializer boundaries.

## Shared code rules

Put code in `shared/` only when it is:

- Used by multiple components, and
- Domain-independent, or
- A technical standard/helper.

Good shared folders:

```txt
shared/config
shared/errors
shared/http
shared/logger
shared/security
shared/validation
shared/date
shared/strings
shared/ui
```

Avoid:

```txt
shared/utils/misc.ts
shared/helpers.ts
shared/services/
shared/repositories/
shared/types.ts
```

Do not move code into `shared/` just because a second caller appears once. Prefer duplication over
premature abstraction when the domain meaning is not yet stable.

## External integration rules

External systems are details. Keep them behind adapters.

Good:

```txt
modules/billing/
  application/
    billing-provider.ts
    create-checkout-session.use-case.ts
  infrastructure/
    stripe-billing-provider.ts
```

Bad:

```ts
// In a use-case or domain file
import Stripe from "stripe";
```

Provider SDKs may live in infrastructure/adapters, not in domain/application logic.

## Repository and persistence rules

Use repository/query modules when persistence access is part of business/application logic.

- Repository interfaces belong to the application/domain side when abstraction is needed.
- Implementations belong to infrastructure/persistence.
- Related writes must use explicit transactions.
- Tenant-scoped queries must include `organizationId` or `tenantId`.
- Prefer methods like `findByIdForOrganization(id, organizationId)` over generic `findById(id)` for
  tenant-scoped resources.
- Raw SQL requires written justification, explicit review, parameterization, and tenant filtering
  when applicable.

## Serializer and DTO rules

API response shape must not be dictated by database rows, ORM models, provider objects, or domain
internals.

Use serializers:

```ts
export function serializeUser(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt.toISOString(),
  };
}
```

Do not return database rows directly.

## Naming and file rules

Follow the baseline naming rules:

- File names and folder names use `kebab-case`.
- Classes and types use `PascalCase`.
- Variables and functions use `camelCase`.
- Constants use `SCREAMING_SNAKE_CASE`.
- Interfaces do not use the `I` prefix.
- Application modules use named exports by default.
- Default exports are allowed only when required by framework/tooling conventions.

## Coding workflow

When adding or changing code:

1. Identify the owning component or feature.
2. Decide whether the code is business, presentation, infrastructure, integration, or shared
   technical code.
3. Place the file in the smallest correct ownership boundary.
4. Keep controller/route code thin.
5. Put business flow in a use-case/application service.
6. Keep SDK/database/framework details behind adapters or repositories.
7. Export only public component API from `index.ts`.
8. Use cross-component imports only through public APIs.
9. Add or update tests for behavior, boundary, tenant, and authorization changes.
10. Update docs/ADR when architectural boundaries change.

## Review checklist

Use this checklist when reviewing code:

- Is the file in the correct component/feature/shared boundary?
- Did the code introduce a global `services/`, `helpers/`, `repositories/`, or `types/` dumping
  ground?
- Does any component import another component's internal files?
- Does `shared/` import business modules?
- Are controllers/routes thin?
- Is business logic in use-cases/application/domain instead of controllers, UI, repositories, or SDK
  adapters?
- Does domain/application import provider, database, framework, queue, cache, or SDK details?
- Are external integrations hidden behind adapters?
- Are repository/query functions tenant-safe where needed?
- Are database rows/provider responses serialized before API output?
- Was code moved into `shared/` prematurely?
- Were tests added or updated for changed behavior?
- Does this change require docs or ADR updates?

## Anti-patterns

Avoid these patterns:

- `shared/utils/misc.ts`
- `helpers.ts` as a dumping ground
- global `services/`
- global `repositories/`
- global `types.ts`
- controller business rules
- UI components transforming API contracts into business policy
- repositories enforcing business authorization
- domain/application importing SDKs
- cross-module deep imports
- automatic `index.ts` barrels everywhere without public API intent
- empty `domain/application/infrastructure/presentation` folders with no need
- circular dependencies

## Good examples

### Thin controller

```ts
export async function updateUserController(request: Request) {
  const authContext = await AUTH_GUARD.requireUser(request);
  const input = UPDATE_USER_SCHEMA.parse(await request.json());

  const user = await updateUser({
    authContext,
    input,
    userId: request.params.userId,
  });

  return {
    data: serializeUser(user),
  };
}
```

### Use-case with authorization and repository boundary

```ts
export async function updateProject(params: UpdateProjectParams): Promise<Project> {
  const project = await PROJECT_REPOSITORY.findByIdForOrganization(
    params.projectId,
    params.authContext.organizationId,
  );

  if (!project) {
    throw new AppError(PROJECT_ERROR_CODE.PROJECT_NOT_FOUND, "Project not found.", 404);
  }

  await PERMISSIONS.require(params.authContext, "project:update", {
    organizationId: project.organizationId,
  });

  return PROJECT_REPOSITORY.update(project.id, params.input);
}
```

## Do not

Do not:

- Add a new architecture layer before a real complexity exists.
- Put domain-specific code into `shared/` for convenience.
- Import provider/database SDKs in domain or application code.
- Return raw ORM rows or provider responses from API routes.
- Skip authorization because the UI hides the action.
- Bypass component public APIs with deep imports.
- Treat ESLint boundary rules as the only architecture enforcement; also use code review.
