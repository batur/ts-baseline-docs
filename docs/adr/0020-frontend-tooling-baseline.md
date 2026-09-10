# ADR-0020: Frontend Tooling Baseline for Vite and Next.js

- Status: Accepted
- Date: 2026-09-10
- Decision owners: Project maintainers

## Context

The baseline has two supported frontend execution models: a Vite React SPA and a Next.js App Router
application. Both need consistent rules for server data, client state, forms, tables, charts, UI
source ownership, animation and isolated UI testing without turning framework choices into business
architecture.

## Decision

Keep the profiles as parallel applications:

```txt
src/apps/
  api/
  web-vite/
  web-next/
```

Use the following default frontend tooling ownership:

- Zustand 5 stores synchronous client/UI state only.
- TanStack Query 5 owns server state, caching and mutations.
- TanStack Router 1 owns type-safe file-based routing in `web-vite` only.
- Next.js App Router owns routing and server composition in `web-next` only.
- shadcn/ui is source-owned UI code styled by Tailwind CSS 4. Each app owns its initial primitives
  and exports them through `shared/ui/index.ts`.
- TanStack Form 1 orchestrates typed forms and reuses Zod as the validation source.
- TanStack Table 9 supplies headless table logic; features own semantic markup and accessibility.
- TanStack Charts is pinned to `@tanstack/charts@0.18.0`; definitions are feature-owned and chart
  upgrades require explicit review and regression checks.
- Motion 13 provides UI transitions and all applications set `MotionConfig reducedMotion="user"`.
- Storybook 10 uses `@storybook/react-vite` and `@storybook/nextjs-vite`, with the a11y and Vitest
  addons. Browser-mode component tests run in a separate Vitest project through Playwright.

Zustand state and Next.js SSR stores use a store factory/client provider where request isolation is
relevant. Query clients are stable for a browser lifecycle, per-request on the server and fresh per
test. Vite route tree output is generated, ignored by formatting/linting and checked for freshness.

## Consequences

### Positive

- A future engineer can choose Vite or Next.js without redefining folder ownership.
- Remote data, client state, URL state and UI primitives have separate responsibilities.
- Zod remains the single runtime validation source for API, route, form and storage boundaries.
- Source-owned UI code can follow the project’s import, accessibility and naming rules.
- Storybook provides a shared visual and browser behavior workflow without adding a second test
  runner or legacy Next integrations.

### Costs and Constraints

- The two applications initially duplicate feature and UI example code; a shared package is deferred
  until real cross-app reuse is demonstrated.
- The TanStack Charts 0.x line is pinned and requires regression checks for upgrades.
- Each frontend build and Storybook profile must be validated independently.
- Query and Zustand ownership must be reviewed when a new state value is introduced.

## Rejected Alternatives

- A single global Zustand store for all application data: rejected because server state requires
  cache, invalidation, request lifecycle and synchronization semantics owned by TanStack Query.
- React Router for the Vite profile: rejected in favor of the selected type-safe file-based TanStack
  Router standard; it does not affect the Next profile.
- React Hook Form as a second form standard: rejected because TanStack Form can use Zod through the
  Standard Schema interface and avoids two project-level form conventions.
- A closed UI component library: rejected because shadcn/ui keeps component source in the app and
  permits repository-specific accessibility and styling review.
- TanStack Router in Next.js: rejected because Next App Router already owns framework routing,
  layouts, server composition and navigation semantics.
- Legacy `storybook-addon-next` and `storybook-addon-next-router`: rejected because the supported
  Next.js Vite Storybook framework provides the integration directly.
- TanStack Query for client-only state: rejected because cache invalidation and server lifecycles are
  not appropriate for local layout, dialog or density preferences.
- Adding every TanStack or Nest-adjacent package by default: rejected; optional tooling requires
  demonstrated responsibility, tests and operational justification.

## Framework Replaceability

Vite and Next.js remain replaceable adapters. Features, Zod boundary schemas, API response mapping,
business-facing UI behavior and shared project rules must not depend on framework internals when a
framework integration is not required. Replacing a framework may change route composition, providers,
build configuration and server/client boundaries, but it must not silently change business policy or
public API contracts.

## References

- [TanStack Query client/server state guidance](https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state)
- [Zustand Next.js guidance](https://zustand.docs.pmnd.rs/learn/guides/nextjs.html)
- [TanStack Router Vite installation](https://tanstack.com/router/latest/docs/installation/with-vite)
- [shadcn/ui documentation](https://ui.shadcn.com/docs)
- [TanStack Form validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation)
- [TanStack Table overview](https://tanstack.com/table/latest/docs/overview)
- [TanStack Charts v0.18.0 release](https://github.com/TanStack/charts/releases/tag/v0.18.0)
- [Motion accessibility](https://motion.dev/docs/react-accessibility)
- [Storybook Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/index)
