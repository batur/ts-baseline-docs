# Frontend Web and Tooling Standard

## Purpose

This document defines the frontend profiles and the default ownership of the frontend tools in this
baseline. Vite and Next.js are separate, explicit applications; the libraries below are replaceable
implementation choices behind the project’s component and boundary rules.

## Canonical Applications

When a repository contains both a Nest.js API and browser applications, use:

```txt
src/apps/
  api/                         # Nest.js backend; modules/ own capabilities
  web-vite/                    # React SPA; TanStack Router owns routes
    app/                       # providers and application composition
    routes/                    # generated file-based route inputs
    features/                  # feature UI, data and behavior
    shared/                    # domain-independent UI and technical code
    main.tsx                   # browser entrypoint
  web-next/                    # Next.js App Router application
    app/                       # framework route composition and providers
    features/                  # feature UI, data and behavior
    shared/                    # domain-independent UI and technical code
packages/                      # optional; only demonstrated reuse belongs here
  contracts/
  ui/
  config/
```

The repository examples are [Vite](../src/apps/web-vite/) and [Next.js](../src/apps/web-next/).
The Vite app uses a generated `route-tree.gen.ts`; it is excluded from formatting/linting and should
be regenerated and freshness-checked with `pnpm web:vite:check-generated` before merging.

## Tool Ownership Matrix

| Tool                       | Owns                                                           | Scope            |
| -------------------------- | -------------------------------------------------------------- | ---------------- |
| Zustand 5                  | Synchronous client/UI state                                    | Vite and Next.js |
| TanStack Query 5           | Server state, cache, queries and mutations                     | Vite and Next.js |
| TanStack Router 1          | Type-safe file-based routing and search params                 | Vite only        |
| Next App Router            | Framework routing, layouts and server composition              | Next.js only     |
| shadcn/ui + Tailwind CSS 4 | Source-owned UI primitives and styling                         | Vite and Next.js |
| TanStack Form 1            | Typed form state and submission orchestration                  | Vite and Next.js |
| TanStack Table 9           | Headless table logic and table state                           | Vite and Next.js |
| TanStack Charts 0.18.0     | Typed, accessible chart definitions and rendering              | Vite and Next.js |
| Motion 13                  | UI transitions and animation                                   | Vite and Next.js |
| Storybook 10               | Isolated UI development, documentation, a11y and browser tests | Vite and Next.js |

TanStack Query owns remote data. Zustand stores only client-owned state such as filters, layout
preferences, dialogs and navigation state. Do not copy Query results into a global Zustand store.

## Feature Boundaries

Start flat and split only when complexity requires it:

```txt
features/users/
  index.ts                    # public feature API
  user.api.ts                # HTTP boundary and response parsing
  user.schema.ts             # Zod request/response/search schemas
  user.types.ts              # feature types
  user-query-options.ts      # query keys and typed query functions
  users-ui.store.ts          # bounded client-only preference
  create-user-form.tsx       # TanStack Form composition
  user-table.tsx             # TanStack Table composition
  user-chart.tsx             # chart data mapper and definition
  user-list.tsx              # loading/error/empty/data states
  users-page.tsx             # feature screen composition
  users-page.test.tsx        # Vitest behavior tests
  users-page.stories.tsx     # Storybook states where the profile supports them
```

- Feature code owns feature UI, hooks, schemas, API wrappers, query options, mappers and tests.
- Export supported feature APIs through `features/<name>/index.ts`.
- Import another feature through its public index; never deep-import another feature’s internals.
- Import shared UI through `shared/ui/index.ts`, not through primitive implementation paths.
- `shared/` contains domain-independent UI and technical helpers. A business rule does not become
  shared merely because two applications currently use the same type.
- Add `domain/`, `application/`, `infrastructure/` or `presentation/` only after a feature has
  enough complexity to justify those folders.

## Providers and Lifetimes

Each application may compose:

```tsx
<QueryClientProvider client={queryClient}>
  <MotionConfig reducedMotion="user">{children}</MotionConfig>
</QueryClientProvider>
```

Keep providers as deep as practical. Application-specific providers must have a documented owner.

- Vite creates one `QueryClient` for the browser application lifecycle.
- Next.js creates a request-safe server client and a stable browser client in a client provider.
- Tests create a fresh client per test with retries disabled.
- Query defaults must not make tests wait through production retry policies.
- Next stores that participate in SSR use a store factory and a client provider; never share mutable
  request state through a module singleton.

## Client State with Zustand

```ts
import { create } from "zustand";

interface UsersUiState {
  readonly density: "comfortable" | "compact";
  readonly setDensity: (density: UsersUiState["density"]) => void;
}

export const useUsersUiStore = create<UsersUiState>((set) => ({
  density: "comfortable",
  setDensity: (density) => set({ density }),
}));
```

Use selectors (`useUsersUiStore((state) => state.density)`) so unrelated state changes do not
rerender a component. Persistence is off by default. If persistence is justified, version and Zod-
validate the stored shape and keep tokens, secrets and sensitive personal data out of it.

## Server State with TanStack Query

Query keys and functions belong to the feature:

```ts
export function usersQueryOptions(input: ListUsersInput) {
  const { limit, organizationId } = input;

  return queryOptions({
    queryFn: () => listUsers({ limit, organizationId }),
    queryKey: ["users", organizationId, limit],
    staleTime: 30_000,
  });
}
```

Parse the `unknown` API payload with Zod before returning from `queryFn`. Mutations invalidate the
owning feature query after a successful write. Query error messages shown to users are safe,
normalized messages; internal errors stay in logs or telemetry.

## Vite Routing

The browser entrypoint is `src/apps/web-vite/main.tsx`. Route inputs live in `routes/` and remain
thin:

```tsx
const usersSearchSchema = z.object({
  density: z.enum(["comfortable", "compact"]).catch("comfortable"),
});

export const Route = createFileRoute("/users")({
  component: UsersRoute,
  validateSearch: usersSearchSchema,
});

function UsersRoute() {
  const search = Route.useSearch();
  return <UsersPage organizationId="org_demo" initialDensity={search.density} />;
}
```

Use the TanStack Router Vite plugin before the React plugin. Route generation must be deterministic,
and `route-tree.gen.ts` is generated code. Validate path/search values with Zod and use resilient
defaults for malformed optional values. Shareable table state belongs in validated URL search
parameters; otherwise keep it local to the table feature.

## Next.js App Router

Use the App Router by default. `app/layout.tsx`, `app/page.tsx`, `loading.tsx`, `error.tsx` and
`not-found.tsx` are route composition points. Keep feature implementation outside route files when
it is not route-specific.

Server Components are the default. Add `"use client"` only for state, event handlers, effects or
browser APIs. Keep the client boundary low, keep providers deep, and mark server-only modules with
`server-only` when importing them from client code could expose privileged code or request state.
TanStack Router is not added to the Next profile; use Next navigation APIs in client components only
when navigation cannot remain in a server route composition point.

## shadcn/ui and Tailwind

shadcn/ui is source-owned code, not a closed runtime component library. Each app has its own
`components.json`, Tailwind v4 entry CSS, local `cn` utility and `shared/ui/index.ts` API. Generated
primitives are reviewed and reshaped to follow this baseline’s naming, import, semantic HTML and
accessibility rules. The examples intentionally keep only Button, Card, Input, Label, Table, Alert
and StatusPanel primitives.

```tsx
export function Button({ className, variant, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
```

Feature-specific visual behavior stays in the feature. Do not move business components into shared
UI merely because their CSS is reusable.

## Forms, Tables, Charts and Motion

TanStack Form may use the existing Zod schema through Standard Schema; it is not a second validation
system:

```tsx
const form = useForm({
  defaultValues: { displayName: "", email: "", organizationId },
  onSubmit: async ({ value }) => createUserRequest(CREATE_USER_SCHEMA.parse(value)),
  validators: { onSubmit: CREATE_USER_SCHEMA },
});
```

TanStack Table is headless. The feature owns semantic `<table>`, caption, headers, keyboard behavior,
loading/empty/error states and styling. TanStack Charts definitions are feature-owned and use
`@tanstack/charts@0.18.0` with `@tanstack/charts/react`; the SVG adapter requires meaningful
`ariaLabel`/`ariaDescription` and responsive sizing. The 0.x chart line remains subject to upgrade
review and chart regression checks.

```tsx
const chart = defineChart({
  marks: [barY(rows, { x: "label", y: "count" })],
  scales: { x: { scale: () => scaleBand() }, y: { scale: scaleLinear, nice: true } },
});

<Chart ariaLabel="Weekly user activity" definition={chart} height={220} />;
```

Use Motion from `motion/react` for meaningful state transitions and wrap app providers with
`<MotionConfig reducedMotion="user">`. Do not make correctness depend on animation and preserve
focus when a transition changes the DOM.

## Accessibility, Responsive UI and Performance

- Use semantic elements, labels, accessible names, captions, live regions and visible focus styles.
- Test keyboard access, focus movement, disabled states, reduced motion and color contrast.
- Use responsive layouts and chart/table overflow patterns without hiding required information.
- Keep client bundles and `"use client"` boundaries small; avoid duplicate requests and unbounded
  caches. Use framework-native image/font/script optimizations where available.
- Provide explicit loading, error, empty, retry and success states for network-backed features.
- Client authorization only improves UX. The API remains authoritative.

## Environment Variables and Browser Storage

Only typed configuration modules may read browser environment variables:

```ts
const clientEnvironment = CLIENT_ENV_SCHEMA.parse({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
});
```

`VITE_*` and `NEXT_PUBLIC_*` values are bundled into browser code. They are public configuration,
never secrets. Server-only variables must not be imported by client components. Validate URL,
query, form, storage and third-party data at the boundary. Prefer secure, appropriately scoped
cookies or the approved session mechanism over browser storage for credentials.

## Testing and Storybook

Vitest remains the unit/component/integration runner. Use a fresh Query client per test, mock HTTP
boundaries, and test feature behavior rather than React internals. Playwright covers critical
browser journeys. Storybook 10 uses Vite-based frameworks:

```txt
src/apps/web-vite/.storybook/{main.ts,preview.tsx}
src/apps/web-next/.storybook/{main.ts,preview.tsx}
```

Use `@storybook/react-vite` and `@storybook/nextjs-vite`, `@storybook/addon-a11y` and
`@storybook/addon-vitest`. `@vitest/browser` and `@vitest/browser-playwright` run stories in a
separate browser-mode Vitest project. Do not use legacy `storybook-addon-next` or
`storybook-addon-next-router` packages.

Stories cover default, loading, empty, error, disabled, form validation/submission, table empty and
sorting behavior, chart accessibility, reduced motion, keyboard and focus behavior. Stories use
fixtures and mocked boundaries; they do not call production APIs.

## Deployment Profiles

- Vite deployments make `base` explicit when served below the domain root and publish the Vite build.
- Next deployments use the selected Next runtime/hosting mode; document `output`, base paths and
  public environment configuration for that deployment.
- Storybook is a static build for review/documentation and must not expose production secrets or
  privileged APIs.

## References

- [Zustand TypeScript guidance](https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript.html)
- [Zustand Next.js guidance](https://zustand.docs.pmnd.rs/learn/guides/nextjs.html)
- [TanStack Query client/server state](https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state)
- [TanStack Router Vite installation](https://tanstack.com/router/latest/docs/installation/with-vite)
- [TanStack Router search validation](https://tanstack.com/router/latest/docs/how-to/validate-search-params)
- [TanStack Form validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation)
- [TanStack Table overview](https://tanstack.com/table/latest/docs/overview)
- [TanStack Charts React adapter](https://tanstack.com/charts/latest/docs/framework/react/adapter)
- [TanStack Charts v0.18.0](https://github.com/TanStack/charts/releases/tag/v0.18.0)
- [Motion React accessibility](https://motion.dev/docs/react-accessibility)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Next.js project structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Vite environment variables](https://vite.dev/guide/env-and-mode)
- [Vite production builds](https://vite.dev/guide/build.html)
- [Storybook React + Vite](https://storybook.js.org/docs/get-started/frameworks/react-vite)
- [Storybook Next.js + Vite](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite)
- [Storybook Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/index)
