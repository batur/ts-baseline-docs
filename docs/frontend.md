# Frontend Web Standard

## Purpose

This document defines the frontend rules for TypeScript web applications using Next.js or Vite. It
extends the shared architecture, TypeScript, validation, security and testing standards; it does
not require a particular UI, state-management, data-fetching or styling library.

## Canonical Full-Stack Layout

Use separate applications when a project contains both a Nest.js API and a web application:

```txt
apps/
  api/                         # Nest.js backend
    src/modules/               # business capabilities
  web/                         # Next.js or Vite frontend
    src/
      app/                     # composition, routing and providers
      features/                # business-facing frontend features
      shared/                  # domain-independent technical/UI code
      main.tsx                 # Vite entrypoint; not used by Next.js
packages/
  contracts/                   # optional shared API schemas/types
  ui/                          # optional generic UI primitives
  config/                      # optional shared tooling/configuration
```

`packages/` is optional. Add a package only when reuse is demonstrated and its ownership is clear.
Do not move business policy into a shared package merely to avoid duplication.

## Frontend Component Boundaries

Frontend features own their UI, hooks, schemas, API wrappers, mappers and feature-specific tests:

```txt
src/
  app/
    app.tsx
    providers/
    router.tsx
  features/
    projects/
      index.ts
      project.api.ts
      project.schema.ts
      project.types.ts
      project-list.tsx
      project-card.tsx
      use-projects.ts
      project.test.tsx
  shared/
    config/client-env.ts
    errors/
    http/api-client.ts
    ui/button.tsx
    validation/
  main.tsx
```

- Export a feature's supported API through `index.ts`.
- Do not deep-import another feature's internals.
- Put feature-specific controls in the feature, not `shared/ui`.
- Put only domain-independent UI and technical helpers in `shared/`.
- Start flat; introduce `domain/`, `application/`, `infrastructure/` or `presentation/` folders
  only when complexity requires them.
- Keep API response mapping at the feature/API boundary. Components render view-ready data and do
  not silently turn arbitrary server responses into domain objects.

## Components, State and Data Flow

Build components around observable UI states. Keep derived values derived, and keep state at the
lowest common owner that needs to coordinate it. Prefer props and explicit callbacks over hidden
module state.

```tsx
type ProjectListProps = {
  readonly projects: readonly Project[];
  readonly onSelect: (projectId: string) => void;
};

export function ProjectList({ projects, onSelect }: ProjectListProps) {
  if (projects.length === 0) return <p>No projects yet.</p>;

  return (
    <ul>
      {projects.map((project) => (
        <li key={project.id}>
          <button type="button" onClick={() => onSelect(project.id)}>
            {project.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

Represent loading, success, empty, validation-error and recoverable-failure states explicitly.
Use effects for synchronization with external systems, not for ordinary derived data or event
handlers. Keep forms controlled by a clear owner, validate user input before submission, and
normalize server validation errors into the shared error model.

## API and Validation Boundaries

Feature API modules call the generic HTTP client, validate external responses, and map them to
feature types. They must not expose raw `Response` objects to UI components.

```ts
import { z } from "zod";

const projectResponseSchema = z.object({
  data: z.object({ id: z.string(), name: z.string() }),
});

export async function getProject(id: string): Promise<Project> {
  const response = await fetch(`/api/v1/projects/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error("PROJECT_REQUEST_FAILED");

  const payload: unknown = await response.json();
  return projectResponseSchema.parse(payload).data;
}
```

Validate URL parameters, query strings, form data, browser storage and third-party responses at
their boundaries. The backend remains authoritative for authorization, tenancy and business rules.

## Next.js Guidance

Use the App Router. Treat `app/` route files (`layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`
and `not-found.tsx`) as route composition and framework integration points. Feature implementation
should remain in `features/` unless it is genuinely route-local. Files may be colocated in `app/`,
but route behavior should remain easy to discover.

Server Components are the default. Add `"use client"` only where state, event handlers, effects or
browser APIs are needed. Keep the boundary as low in the tree as practical, and keep providers
deep rather than wrapping the entire application unnecessarily. Mark server-only modules with
`server-only` when a client import could expose privileged code or data.

## Vite Guidance

Use `src/main.tsx` as the browser entrypoint and keep routing, providers, features and shared code
under `src/`. Read `import.meta.env` only through a typed client configuration module:

```ts
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
if (!apiBaseUrl) throw new Error("VITE_API_BASE_URL is required");

export const CLIENT_CONFIG = { API_BASE_URL: apiBaseUrl } as const;
```

`VITE_*` values are statically bundled into client code and must not contain secrets. Make the Vite
`base` setting explicit when deploying below the domain root. Keep mode-specific configuration
documented and restart the dev server after environment changes.

## Configuration and Security

- Next.js variables prefixed `NEXT_PUBLIC_` and Vite variables prefixed `VITE_` are public.
- Server secrets, service-role keys, tokens and private configuration stay in server-only modules.
- Client permission checks improve UX only; every protected operation is enforced by the API/server.
- Do not store tokens or sensitive data in `localStorage` by default. Prefer secure, appropriately
  scoped cookies or an approved session mechanism; document any exception.
- Use safe DOM APIs. `dangerouslySetInnerHTML`, redirects from untrusted input, file previews and
  user-controlled URLs require security review and validation.
- Browser-facing deployments should define CSP, frame protections, referrer policy, HSTS in HTTPS
  production, and `nosniff` headers.
- Design for keyboard access, visible focus, semantic HTML, labels, accessible names, reduced
  motion, color contrast and responsive layouts. Accessibility is part of correctness.

## Performance and Resilience

- Keep client JavaScript and `"use client"` boundaries small.
- Use framework-native image, font and script optimization where available.
- Avoid unnecessary rerenders, duplicated requests and unbounded browser caches.
- Provide loading, empty, error and retry states for network-backed UI.
- Do not make correctness depend on optimistic UI; reconcile with authoritative server responses.

## Testing

Use Vitest for component and feature behavior tests, co-located with the protected feature. Use
Playwright for critical browser journeys under `tests/e2e`.

```tsx
it("renders an empty project state", () => {
  render(<ProjectList projects={[]} onSelect={() => undefined} />);
  expect(screen.getByText("No projects yet.")).toBeVisible();
});
```

Cover successful, loading, empty, validation-error and API-failure states; keyboard/focus behavior;
auth redirects; permission-sensitive UI as UX behavior; and critical end-to-end journeys. Do not
replace server authorization tests with frontend tests.

## References

- [Next.js project structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js data security](https://nextjs.org/docs/15/app/guides/data-security)
- [Vite environment variables and modes](https://vite.dev/guide/env-and-mode)
- [Vite production builds](https://vite.dev/guide/build.html)
