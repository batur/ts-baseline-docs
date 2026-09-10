# Engineering Standards

This document summarizes the current operating standard. ADR files preserve decision history.

## Runtime and Package Management

- Runtime: Node.js
- Package manager: pnpm
- Monorepo: use the `apps/` + optional `packages/` layout when multiple deployable applications are
  present; do not add workspace packages without demonstrated reuse
- Module system: ESM only

## TypeScript

- Strict mode is required.
- Default target: ES2022.
- Backend Node projects use `module: "NodeNext"` and `moduleResolution: "NodeNext"`.
- Frontend/bundler projects use `module: "ESNext"` and `moduleResolution: "Bundler"`.
- Vite projects include DOM libraries and React JSX settings. Next.js projects use the same ESNext /
  Bundler profile with strict mode and the Next.js TypeScript plugin.
- Backend direct NodeNext imports use explicit `.js` extensions.
- Frontend/bundler imports may be extensionless.
- React components use PascalCase names; hooks use the `use...` camelCase convention; component
  props are explicit TypeScript types.
- Frontend code uses named exports by default. Framework-required default exports are allowed only
  at framework/tooling boundaries such as route files and configuration files.
- Browser environment access is centralized in a typed client configuration module. Do not scatter
  `import.meta.env` or `process.env` reads through application code.
- Nest.js bootstraps through the composition root; framework decorators stay at transport/module
  boundaries and domain/application policy remains framework-independent.
- Nest.js backend imports use explicit `.js` extensions under the ESM NodeNext configuration.
- Do not read `process.env` outside typed configuration modules or import provider SDKs into
  domain/application code.
- Avoid uncontrolled `@Global()` modules, circular Nest module dependencies, property injection and
  request-scoped providers.

Frontend app configuration is local to the application. Vite uses an app-local `@/*` alias and
extensionless imports; Next.js uses the same alias without crossing into another app. The Vite
TanStack Router plugin runs before the React plugin. Its generated `route-tree.gen.ts` is excluded
from formatting/linting and must be regenerated and freshness-checked in CI.

Required strictness:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitOverride": true,
  "noFallthroughCasesInSwitch": true,
  "noImplicitReturns": true,
  "useUnknownInCatchVariables": true,
  "isolatedModules": true,
  "verbatimModuleSyntax": true
}
```

## Linting and Formatting

- ESLint is required.
- Prettier is required.
- Use a modern ESLint base with Google TypeScript guide-inspired conventions.
- Enable `@tanstack/eslint-plugin-query` recommended rules for frontend code. Stable query clients,
  exhaustive query dependencies, query options and mutation property ordering are required.
- Framework-required default exports are allowed for Next route files, app configuration and
  Storybook metadata. Named exports remain the default for application and feature code.

## Naming

- Files: `kebab-case`
- Folders: `kebab-case`
- Functions/variables: `camelCase`
- Types/classes: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Interfaces: no `I` prefix

## Imports and Exports

- Named exports are default.
- Default exports are allowed only for framework/tooling conventions.
- Type-only imports must use `import type`.
- Type-only imports are placed in their own import group.
- Node built-ins use the `node:` prefix.
- Side-effect imports are allowed only in entry/setup/instrumentation files.
- Barrel exports are allowed only for public API boundaries.
- Features import shared UI through `shared/ui/index.ts`; deep imports across feature/component
  boundaries are forbidden.
- Source-owned shadcn/ui primitives follow project naming and accessibility rules. Generated files
  are reviewed before adoption and do not define an alternate architecture.
- Typed client configuration modules are the only place that reads `import.meta.env` or
  `NEXT_PUBLIC_*`; application code does not scatter environment access.

Import order:

1. Side-effect imports
2. Node built-ins
3. External packages
4. Internal alias imports
5. Parent imports
6. Sibling imports
7. Type-only imports

## Core Standards

- [Backend Standard: Nest.js](backend.md)
- [Frontend Web Standard](frontend.md)

- [Product Delivery](product-delivery.md)
- [API](api.md)
- [Security](security.md)
- [Testing](testing.md)
- [Database](database.md)
- [Observability](observability.md)
- [Deployment](deployment.md)
