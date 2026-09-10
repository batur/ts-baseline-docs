# ADR-0018: Frontend Architecture and Web Standard

## Status

Accepted.

## Context

The baseline has backend component and delivery standards, but frontend projects need explicit
guidance for route composition, browser security, client/server execution and web testing. Nest.js
backends must coexist cleanly with either Next.js or Vite without making a framework the business
architecture.

## Decision

Full-stack projects use `apps/api` for the Nest.js backend and `apps/web` for the Next.js or Vite
frontend. Optional `packages/` contain only intentionally shared contracts, generic UI or tooling
configuration. Backend capabilities remain in `modules/`; frontend capabilities remain in
`features/`; shared code is domain-independent and exposed through explicit public APIs.

Next.js uses the App Router, with route files acting as composition/framework boundaries and Server
Components as the default. Client Components are limited to interactivity, effects and browser
APIs. Vite uses `src/main.tsx` as the browser entrypoint and typed access to `import.meta.env`.

Frontend code follows the existing strict TypeScript, validation, security, component-boundary,
error-handling and Vitest/Playwright standards. Client authorization is never a substitute for
server authorization, and public browser environment variables never contain secrets.

## Consequences

- Backend and frontend ownership are visible in the repository layout.
- Next.js and Vite conventions are documented without coupling business logic to either framework.
- Some small projects may have more top-level structure than they need; direct `src/` layouts remain
  acceptable for single-application repositories.
- Shared packages require deliberate ownership and may introduce workspace/build complexity.

## Alternatives Considered

- Put backend and frontend under one `src/` tree: rejected because deployable boundaries and runtime
  conventions become ambiguous.
- Use `backend/` and `frontend/` as the canonical names: rejected in favor of the conventional
  `apps/` workspace layout, while retaining it as a compatible simple-project alternative.
- Prescribe one frontend framework: rejected because the baseline should keep business architecture
  and web standards portable.
- Put all reusable code in shared packages: rejected because reuse without stable ownership creates
  coupling and weakens component boundaries.

## References

- [Frontend Web Standard](../frontend.md)
- [Next.js project structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Vite environment variables and modes](https://vite.dev/guide/env-and-mode)
