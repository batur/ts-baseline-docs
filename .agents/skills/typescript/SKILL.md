---
name: typescript
description: Apply the project TypeScript baseline when creating, editing, or reviewing TypeScript code, tsconfig files, imports, module formats, strict typing, NodeNext backend projects, frontend bundler projects, build configs, and package-level TypeScript conventions.
license: Proprietary
compatibility: Designed for VS Code Agent Skills and portable Agent Skills clients that load SKILL.md files with YAML frontmatter.
metadata:
  version: "1.0.0"
  owner: "software-architecture-and-design"
  source: "typescript-architecture-baseline"
---

# TypeScript Skill

## When to use this skill

Use this skill when the task involves TypeScript source code, TypeScript configuration, build configuration, module imports, type design, runtime validation boundaries, Node.js backend TypeScript, frontend/bundler TypeScript, or review of TypeScript code quality.

Also use this skill when the user asks to create, edit, or review:

- `tsconfig.json`
- `tsconfig.build.json`
- TypeScript imports/exports
- ESM/CommonJS module choices
- strict typing rules
- backend Node.js TypeScript projects
- frontend TypeScript projects
- package scripts that run `tsc`
- TypeScript coding standards for AI-generated code

## Goal

Produce and review TypeScript that is strict, explicit, ESM-first, maintainable, framework-aware, and aligned with the project architecture baseline.

The TypeScript standard must reduce runtime surprises, preserve module boundaries, avoid implicit behavior, and keep application/domain logic independent from infrastructure details.

## Core decisions

Follow these accepted baseline decisions:

- Runtime default is Node.js.
- Package manager default is `pnpm`.
- Module system is always ESM.
- Backend Node projects use `module: "NodeNext"` and `moduleResolution: "NodeNext"`.
- Frontend/bundler projects use `module: "ESNext"` and `moduleResolution: "Bundler"`.
- Default target is `ES2022`.
- Backend `lib` is `["ES2022"]` and does not include DOM.
- Frontend `lib` is `["ES2022", "DOM", "DOM.Iterable"]`.
- Strict TypeScript is mandatory.
- Default alias is only `@/* -> src/*`.
- Backend direct NodeNext imports use explicit `.js` extensions for relative runtime imports.
- Frontend bundler imports may be extensionless.
- Use named exports by default.
- Default exports are allowed only for framework/tooling conventions.
- Use `import type` / `export type` for type-only imports and exports.
- Do not use TypeScript types as a substitute for runtime validation at external boundaries.

## Required strict compiler options

When creating or reviewing `tsconfig.json`, enforce these options unless a framework has a documented reason to override them:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "useUnknownInCatchVariables": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Prefer `skipLibCheck: true` for practical build performance. Do not use it as an excuse to ignore application type errors.

## Backend Node.js profile

Use this profile for backend services, Node.js APIs, CLI tools, workers, and packages intended to run directly on Node.js.

Required baseline:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "moduleDetection": "force",
    "types": ["node"],
    "noEmit": true
  }
}
```

For backend relative imports, use runtime `.js` extensions in TypeScript source:

```ts
import { CREATE_USER_SCHEMA } from "./create-user.schema.js";
import type { UserRepository } from "./user.repository.js";
```

Do not import relative TypeScript files with `.ts` extensions in backend NodeNext source.

## Frontend / bundler profile

Use this profile for Vite, React, browser-based frontend apps, and other bundler-managed TypeScript projects.

Required baseline:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "noEmit": true
  }
}
```

Frontend/bundler projects may use extensionless relative imports because bundlers resolve them.

Do not use the backend NodeNext profile as the frontend browser profile.

## Build configuration

Use `tsconfig.build.json` when the project emits JavaScript or declarations.

Backend app build baseline:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "rootDir": "src",
    "outDir": "dist",
    "sourceMap": true,
    "tsBuildInfoFile": "dist/.tsbuildinfo"
  },
  "exclude": [
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "src/**/*.spec.ts",
    "src/**/*.spec.tsx",
    "src/**/__tests__/**"
  ]
}
```

Library/package build may enable:

```json
{
  "declaration": true,
  "declarationMap": true
}
```

Do not emit test files into production build output.

## JavaScript files in TypeScript projects

Prefer TypeScript for application source files.

`allowJs: true` and `checkJs: true` are acceptable when the project intentionally typechecks JavaScript tooling files such as `eslint.config.js`, `prettier.config.js`, or other config files.

For pure application templates, prefer:

```json
{
  "allowJs": false,
  "checkJs": false
}
```

Do not mix JS and TS application code casually.

## Import and export rules

Follow these rules in all TypeScript source:

- Use ESM syntax only.
- Use named exports by default.
- Avoid default exports except where a framework or tool requires them.
- Use `import type` for type-only imports.
- Use `export type` for type-only exports.
- Use `node:` prefix for Node.js built-ins.
- Use `@/*` only for imports from `src/*`.
- Avoid cross-component deep imports.
- Import another component through its public `index.ts` API.

Preferred import order:

1. Side-effect imports, only in entry/setup/instrumentation files
2. Node built-ins
3. External packages
4. Internal alias imports
5. Parent imports
6. Sibling imports
7. Type-only imports

Example:

```ts
import "dotenv/config";

import { randomUUID } from "node:crypto";

import { z } from "zod";

import { APP_ERROR_CODE } from "@/shared/errors/app-error-code.js";

import { CREATE_USER_SCHEMA } from "./create-user.schema.js";

import type { UserRepository } from "./user.repository.js";
import type { CreateUserInput } from "./create-user.schema.js";
```

## Type design rules

Use TypeScript to make illegal states difficult to represent, but do not over-engineer simple code.

Prefer:

- explicit input/output types at component boundaries
- `unknown` for untrusted external data before validation
- discriminated unions for state machines and branching flows
- `as const` objects plus inferred union types for enum-like values
- small, composable types near the owning component
- `ReadonlyArray<T>` or readonly object types when immutability is intended

Avoid:

- broad `any`
- unsafe type assertions
- global `types/` dumping grounds
- type-only architecture that hides missing runtime validation
- overly generic helper types without a concrete use case

Enum-like constant pattern:

```ts
export const APPLICATION_STATUS = {
  DRAFT_CREATED: "draft_created",
  APPLIED: "applied",
  SKIPPED: "skipped",
} as const;

export type ApplicationStatus =
  (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];
```

## Error and unknown handling

Because `useUnknownInCatchVariables` is required, caught errors must be narrowed or normalized.

Do not do this:

```ts
try {
  await operation();
} catch (error) {
  console.error(error.message);
}
```

Prefer:

```ts
try {
  await operation();
} catch (error: unknown) {
  const normalizedError = normalizeError(error);
  throw normalizedError;
}
```

Do not return raw unknown errors to API clients.

## Runtime validation boundary

TypeScript types do not validate runtime data.

Treat these values as untrusted until validated:

- request body
- query params
- path params
- headers
- cookies
- environment variables
- webhooks
- third-party provider responses
- browser storage
- AI model outputs

Use Zod or the project validation standard at the boundary before passing data to application/use-case logic.

Do not pass raw `unknown`, raw request objects, raw provider payloads, or raw env values into application/domain logic.

## Environment access

Do not read `process.env` in application, domain, use-case, repository, adapter, or UI code.

Allowed locations:

- `src/shared/config/**`
- `src/**/config/**`
- framework/tooling config files
- test setup files, when necessary

Application code consumes typed config objects.

## Architecture boundary expectations

TypeScript code must respect component architecture:

- backend business components live under `src/modules/*`
- frontend feature components live under `src/features/*`
- technical shared code lives under `src/shared/*`
- bootstrap/composition root lives under `src/app/*`
- public component API is `index.ts`
- files not exported by `index.ts` are internal by default

Domain/application code must not directly import provider SDKs or database clients such as Drizzle, Prisma, Supabase JS, Firebase SDK, MongoDB driver, OpenAI SDK, or Stripe SDK. Use adapters, repositories, or infrastructure implementations.

## Coding workflow

When editing TypeScript:

1. Identify whether the file belongs to backend Node, frontend bundler, shared package, or tooling.
2. Apply the correct TypeScript profile.
3. Keep imports ESM and profile-correct.
4. Add or update explicit boundary types.
5. Validate external input at runtime before use-case/domain logic.
6. Keep domain/application code independent from DB, SDK, framework, env, and transport details.
7. Run or request `pnpm typecheck` and relevant tests.
8. If a compiler option must be relaxed, explain the reason and prefer the smallest scoped override.

## Review checklist

Before approving TypeScript changes, check:

- Is the correct backend or frontend TypeScript profile used?
- Is strict mode preserved?
- Are all required strict compiler options present?
- Are backend NodeNext relative imports using `.js` runtime extensions?
- Are frontend/bundler configs using `moduleResolution: "Bundler"`?
- Are type-only imports written with `import type`?
- Is `any` avoided or explicitly justified?
- Are unsafe type assertions avoided?
- Is caught `unknown` normalized before use?
- Is external input validated before entering application/use-case logic?
- Is `process.env` limited to config modules?
- Are provider/database SDKs kept out of domain/application code?
- Are DB rows or provider payloads prevented from leaking into API DTOs?
- Are test files excluded from build output?
- Does the change require documentation, OpenAPI, config, or ADR updates?

## Do not

Do not:

- switch the project to CommonJS
- disable `strict`
- remove `noUncheckedIndexedAccess` or `exactOptionalPropertyTypes` to silence errors
- use backend NodeNext config for browser frontend projects
- use frontend Bundler config for direct Node runtime projects
- import `.ts` files in backend NodeNext runtime imports
- add default exports without framework/tooling need
- use global `types/` folders as dumping grounds
- pass raw external data into use-cases
- use TypeScript-only types as a security boundary
- read `process.env` outside config modules
- use `any` as a shortcut around design issues
- hide business rules in type tricks

## Good examples

Backend use-case input:

```ts
export type CreateUserInput = {
  email: string;
  displayName: string;
};

export async function createUser(input: CreateUserInput): Promise<User> {
  return USER_REPOSITORY.create(input);
}
```

Validated controller boundary:

```ts
export async function createUserController(request: Request) {
  const body: unknown = await request.json();
  const input = CREATE_USER_SCHEMA.parse(body);

  const user = await createUser(input);

  return {
    data: serializeUser(user),
  };
}
```

Typed config consumption:

```ts
import { SERVER_ENV } from "@/shared/config/server-env.js";

export const HTTP_CONFIG = {
  PORT: SERVER_ENV.PORT,
} as const;
```

## Bad examples

Raw external data passed into use-case:

```ts
const body = await request.json();
await createUser(body);
```

Wrong backend NodeNext import:

```ts
import { createUser } from "./create-user";
```

Direct env access outside config:

```ts
const apiKey = process.env.OPENAI_API_KEY;
```

Unsafe type assertion:

```ts
const input = body as CreateUserInput;
```

Provider SDK in application logic:

```ts
import OpenAI from "openai";

export async function generateProposal() {
  const client = new OpenAI();
}
```
