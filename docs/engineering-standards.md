# Engineering Standards

This document summarizes the current operating standard. ADR files preserve decision history.

## Runtime and Package Management

- Runtime: Node.js
- Package manager: pnpm
- Monorepo: not default; use dedicated tooling only when needed
- Module system: ESM only

## TypeScript

- Strict mode is required.
- Default target: ES2022.
- Backend Node projects use `module: "NodeNext"` and `moduleResolution: "NodeNext"`.
- Frontend/bundler projects use `module: "ESNext"` and `moduleResolution: "Bundler"`.
- Backend direct NodeNext imports use explicit `.js` extensions.
- Frontend/bundler imports may be extensionless.

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

Import order:

1. Side-effect imports
2. Node built-ins
3. External packages
4. Internal alias imports
5. Parent imports
6. Sibling imports
7. Type-only imports

## Core Standards

- [API](api.md)
- [Security](security.md)
- [Testing](testing.md)
- [Database](database.md)
- [Observability](observability.md)
- [Deployment](deployment.md)
