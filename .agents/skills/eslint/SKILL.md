---
name: eslint
description: Enforce and review the TypeScript ESLint baseline for this project. Use when creating or reviewing ESLint flat config, lint rules, imports, exports, naming, file names, side-effect imports, environment access, component boundaries, or provider/SDK dependency restrictions in TypeScript code.
compatibility: Designed for VS Code Agent Skills and Agent Skills compatible clients. Assumes TypeScript, ESLint flat config, pnpm, ESM, Prettier, eslint-plugin-import, eslint-plugin-unicorn, and typescript-eslint.
metadata:
  version: "1.0.0"
  owner: "software-architecture-and-design"
  project: "typescript-architecture-baseline"
---

# ESLint Skill

## When to use this skill

Use this skill when the task involves any of the following:

- Creating or reviewing `eslint.config.js`.
- Updating TypeScript lint rules.
- Reviewing imports, exports, naming, file naming, side-effect imports, or module boundaries.
- Checking whether generated code follows the accepted TypeScript architecture baseline.
- Preventing database/provider SDK leakage into domain/application/use-case code.
- Reviewing whether `process.env` is used only inside config modules.
- Adapting ESLint rules for backend NodeNext, frontend bundler, framework, tooling, or test files.

Do not use this skill as the source of truth for TypeScript compiler options. Use the TypeScript skill for `tsconfig` decisions.

## Goal

Make ESLint act as an automated reviewer for the project’s agreed engineering standards:

- ESM only.
- Named exports by default.
- Kebab-case file and folder names.
- Type-only imports where applicable.
- Stable import ordering.
- Node built-ins with the `node:` protocol.
- Side-effect imports only in approved entry/setup/instrumentation files.
- `process.env` only inside config modules.
- Cross-component access only through public APIs.
- No provider, database, or SDK details inside domain/application/use-case code.

Lint rules should enforce conventions without hiding architecture problems behind formatting noise.

## Baseline ESLint stack

Use ESLint flat config.

Recommended baseline packages:

- `eslint`
- `@eslint/js`
- `typescript-eslint`
- `eslint-config-prettier`
- `eslint-plugin-import`
- `eslint-import-resolver-typescript`
- `eslint-plugin-unicorn`
- `globals`

The baseline may use:

- `js.configs.recommended`
- `typescript-eslint` strict type-checked configs
- `typescript-eslint` stylistic type-checked configs
- `eslint-plugin-import` recommended + TypeScript configs
- `eslint-config-prettier` as the last config item

Prettier owns formatting. ESLint owns code-quality, import, naming, and architecture constraints.

## Core rules

### 1. Use named exports by default

Application modules must use named exports.

Default exports are forbidden unless required by a framework or tooling convention.

Allowed default export examples:

- `eslint.config.js`
- `prettier.config.js`
- `vite.config.ts`
- `vitest.config.ts`
- `playwright.config.ts`
- Next.js `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` when using a Next.js template

Review checks:

- Reject unnecessary default exports in application code.
- Allow default exports only through explicit file-pattern overrides.

### 2. Enforce kebab-case file names

Source file and folder names must use kebab-case.

Good:

```txt
create-user.use-case.ts
user.repository.ts
server-env.ts
request-logger.middleware.ts
```

Bad:

```txt
CreateUserUseCase.ts
userRepository.ts
ServerEnv.ts
```

Exceptions may be added only for tooling, framework, or repository convention files such as:

- `README.md`
- `CODEOWNERS`
- config files
- framework-required files

### 3. Enforce project naming conventions

Use these naming conventions:

- Variables and functions: `camelCase`
- Types, interfaces, classes: `PascalCase`
- Interfaces: no `I` prefix
- Constants: `SCREAMING_SNAKE_CASE`
- Enum-like const object keys: `SCREAMING_SNAKE_CASE`
- Enum members, if enums are used: `SCREAMING_SNAKE_CASE`

Good:

```ts
export const APPLICATION_STATUS = {
  DRAFT_CREATED: "draft_created",
  APPLIED: "applied",
} as const;

export type ApplicationStatus =
  (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];
```

Bad:

```ts
interface IUser {}
const applicationStatus = { draftCreated: "draft_created" };
```

### 4. Require type-only imports

Use `import type` for type-only imports.

Good:

```ts
import { z } from "zod";

import type { UserRepository } from "./user.repository.js";
```

Bad:

```ts
import { UserRepository } from "./user.repository.js";
```

Use separate type imports when auto-fixing.

### 5. Enforce import order

Import groups must be ordered consistently:

1. Side-effect imports
2. Node built-ins
3. External packages
4. Internal alias imports
5. Parent imports
6. Sibling/index imports
7. Type-only imports

Keep blank lines between groups.

Example:

```ts
import "dotenv/config";

import { randomUUID } from "node:crypto";

import { z } from "zod";

import { LOGGER } from "@/shared/logger/logger.js";

import { CREATE_USER_SCHEMA } from "./create-user.schema.js";

import type { UserRepository } from "./user.repository.js";
```

### 6. Require `node:` protocol for Node built-ins

Good:

```ts
import path from "node:path";
import { randomUUID } from "node:crypto";
```

Bad:

```ts
import path from "path";
import { randomUUID } from "crypto";
```

### 7. Restrict side-effect imports

Side-effect imports are allowed only in approved entry/setup/instrumentation files.

Allowed examples:

- `src/main.ts`
- `src/main.tsx`
- `src/app/bootstrap.ts`
- `src/app/server.ts`
- `src/**/*.setup.ts`
- `src/**/*.instrumentation.ts`
- `tests/**/*.setup.ts`

Reject side-effect imports inside ordinary domain, application, repository, adapter, and UI modules.

### 8. Restrict `process.env`

Application code must not read `process.env` directly.

Allowed files:

- `src/**/config/**`
- `src/**/config.ts`
- `src/shared/config/**`
- Tooling config files where required

Bad:

```ts
const apiKey = process.env.OPENAI_API_KEY;
```

Good:

```ts
import { SERVER_ENV } from "@/shared/config/server-env.js";

const apiKey = SERVER_ENV.OPENAI_API_KEY;
```

### 9. Enforce public component APIs

A component’s public API is its `index.ts`.

Cross-component imports must go through the target component’s public API.

Good:

```ts
import { createUser } from "@/modules/users/index.js";
```

Bad:

```ts
import { createUser } from "@/modules/users/create-user.use-case.js";
```

The baseline can restrict alias deep imports such as:

```txt
@/modules/<component>/<internal-file>
@/features/<feature>/<internal-file>
```

Relative cross-component deep imports are harder to enforce with simple ESLint patterns. If strict enforcement is required, add `eslint-plugin-boundaries` or `dependency-cruiser` later.

### 10. Block provider and database SDKs in domain/application/use-case code

Domain/application/use-case code must not import provider, database, or infrastructure SDK details.

Restricted in domain/application/use-case paths:

- `@prisma/client`
- `drizzle-orm`
- `@supabase/supabase-js`
- `firebase`
- `mongodb`
- `openai`
- `stripe`

Good:

```ts
export async function createInvoice(params: {
  billingGateway: BillingGateway;
}) {
  return params.billingGateway.createInvoice();
}
```

Bad:

```ts
import Stripe from "stripe";

export async function createInvoice() {
  const stripe = new Stripe(...);
}
```

SDK imports belong in adapters, infrastructure, repositories, or integration modules.

## File-pattern overrides

### Tooling files

Tooling/config files may need looser rules.

Typical patterns:

```txt
*.config.{js,mjs,ts}
eslint.config.js
prettier.config.js
drizzle.config.ts
vite.config.ts
vitest.config.ts
playwright.config.ts
```

Allowed relaxations:

- Default export may be allowed.
- `process.env` may be allowed if the tool requires it.
- Naming conventions may be relaxed.
- Some import plugin false positives may be disabled.

### Framework files

For frontend/framework templates, add explicit overrides only when needed.

Next.js examples:

```txt
src/app/**/page.tsx
src/app/**/layout.tsx
src/app/**/loading.tsx
src/app/**/error.tsx
src/app/**/not-found.tsx
```

These may allow default exports because the framework requires them.

### Entry/setup/instrumentation files

Allow side-effect imports only for approved patterns.

Do not globally disable `import/no-unassigned-import`.

### Test files

Keep test files close to production rules by default.

Only relax naming or import rules if test fixtures represent external payload shapes that require non-camelCase keys.

## Backend NodeNext import extension guidance

For backend NodeNext TypeScript, relative runtime imports should use `.js` in source files.

Good:

```ts
import { CREATE_USER_SCHEMA } from "./create-user.schema.js";
import type { UserRepository } from "./user.repository.js";
```

Bad:

```ts
import { CREATE_USER_SCHEMA } from "./create-user.schema";
import { CREATE_USER_SCHEMA } from "./create-user.schema.ts";
```

For frontend/bundler templates, extensionless imports can be allowed through a separate ESLint/TypeScript profile.

## AI coding workflow

When writing or editing code:

1. Identify the file category: app code, domain/application, infrastructure/adapter, config, test, tooling, framework, or generated.
2. Apply the strictest relevant rule set.
3. Use named exports unless a documented override applies.
4. Use kebab-case file names.
5. Use `import type` for type-only imports.
6. Keep import groups ordered.
7. Do not read `process.env` outside config modules.
8. Do not import provider/database SDKs inside domain/application/use-case files.
9. Do not deep-import another component’s internals.
10. Add or adjust ESLint overrides only for clear framework/tooling needs.

## AI review checklist

Use this checklist when reviewing generated or human-written code:

- Are file and folder names kebab-case?
- Are default exports avoided in application code?
- Are default exports allowed only by explicit tooling/framework overrides?
- Are all type-only imports written with `import type`?
- Are imports grouped and alphabetized consistently?
- Do Node built-in imports use `node:`?
- Are side-effect imports limited to entry/setup/instrumentation files?
- Is `process.env` used only in config modules or tooling configs?
- Are cross-component imports routed through `index.ts` public APIs?
- Does domain/application/use-case code avoid Drizzle, Prisma, Supabase, Firebase, MongoDB, OpenAI, Stripe, and similar SDKs?
- Are framework-specific exceptions explicit rather than global?
- Are generated files ignored or clearly excluded from linting when appropriate?
- Does Prettier remain the formatting authority?

## Common fixes

### Fix type-only imports

Use `import type` for types.

### Fix direct environment access

Move raw env reads to config modules and consume typed config objects.

### Fix SDK leakage

Replace direct SDK imports in use-cases with interfaces such as repositories, gateways, clients, or adapters passed from the composition root.

### Fix cross-component deep import

Bad:

```ts
import { hashPassword } from "@/modules/users/password/hash-password.js";
```

Good:

```ts
import { hashPassword } from "@/modules/users/index.js";
```

Only export the symbol from `index.ts` if it is truly part of the component’s public API.

## Do not

- Do not disable ESLint globally to make generated code pass.
- Do not add broad overrides when a narrow file-pattern override is enough.
- Do not use default exports in ordinary application modules.
- Do not allow `process.env` outside config modules.
- Do not allow SDK imports in domain/application/use-case code.
- Do not use ESLint as a replacement for TypeScript compiler strictness.
- Do not let Prettier and ESLint fight over formatting.
- Do not add framework exceptions to the generic backend profile unless the framework is actually used.

## Escalation rules

Stop and request an ADR or architecture decision if broad rule disabling is needed, component boundaries cannot be enforced, provider SDKs appear necessary in domain/application code, framework exceptions would become global, generated code needs a dedicated lint profile, or stronger boundary tooling such as `eslint-plugin-boundaries` or `dependency-cruiser` is required.
