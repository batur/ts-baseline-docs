---
name: config-environment
description: >
  Enforce TypeScript config and environment rules. Use when adding or reviewing env variables,
  process.env usage, Zod env validation, server/client config separation, secrets, public env
  exposure, feature flags, provider config, .env.example, or adapter initialization.
license: Proprietary
metadata:
  version: "1.0.0"
  project: "Software Architecture & Design TypeScript Baseline"
---

# Config / Environment Skill

## When to use this skill

Use this skill when work touches:

- env variables, `.env` files, `.env.example`
- `process.env`
- Zod env validation
- server-only config or browser/client config
- secrets, tokens, API keys, DSNs, service-role keys
- feature flags, boolean/number/list env parsing
- provider setup: database, Supabase, Firebase, OpenAI, Stripe, Sentry, mail, storage, auth, logger
- deployment config for local, test, staging, production, preview

## Goal

Create one typed configuration boundary. Application code must consume validated config objects, not
raw environment variables.

```txt
Environment variables are external input.
External input is untrusted until validated.
Invalid critical configuration fails fast at startup.
```

## Core rules

- Use Zod for env validation.
- Read `process.env` only inside env/config modules, tooling config, or explicit test setup.
- Validate env during startup.
- Application code consumes typed config objects.
- Separate server-only env from client-exposed env.
- Secrets never enter client bundles.
- Secrets are never logged.
- `.env.example` documents required variables.
- `.env.local`, production env files, and secret env files are not committed.
- Env names use `SCREAMING_SNAKE_CASE`.
- Boolean env values are parsed explicitly from `"true"` or `"false"`.
- Number env values are parsed into numbers before use.
- List env values are parsed into arrays before use.
- `NODE_ENV` and `APP_ENV` are different concepts.
- Adapters receive config through constructor/factory arguments.
- Providers and SDKs must not read `process.env` directly.
- Runtime application config is separate from tooling config.

## Folder standard

Backend/server:

```txt
src/shared/config/server-env.ts
src/shared/config/app-config.ts
src/shared/config/config-error.ts
```

Frontend/browser:

```txt
src/shared/config/client-env.ts
src/shared/config/app-config.ts
```

Fullstack:

```txt
src/shared/config/server-env.ts
src/shared/config/client-env.ts
src/shared/config/app-config.ts
```

Rules:

- `server-env.ts` may read server-only secrets.
- `client-env.ts` exposes only browser-safe/public values.
- `client-env.ts` must not import `server-env.ts`.
- `server-env.ts` must not be imported into browser/client code.

## Naming standard

Use `SCREAMING_SNAKE_CASE` for schema constants and parsed env objects:

```ts
export const SERVER_ENV_SCHEMA = z.object({});
export const SERVER_ENV = SERVER_ENV_SCHEMA.parse(process.env);

export const CLIENT_ENV_SCHEMA = z.object({});
export const CLIENT_ENV = CLIENT_ENV_SCHEMA.parse({});
```

Use PascalCase for inferred types:

```ts
export type ServerEnv = z.infer<typeof SERVER_ENV_SCHEMA>;
export type ClientEnv = z.infer<typeof CLIENT_ENV_SCHEMA>;
```

## Server env pattern

```ts
import { z } from "zod";

export const SERVER_ENV_SCHEMA = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_ENV: z.enum(["local", "development", "staging", "production", "test"]).default("local"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().url(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  CORS_ORIGINS: z.string().optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  SENTRY_DSN: z.string().url().optional(),
});

export type ServerEnv = z.infer<typeof SERVER_ENV_SCHEMA>;
export const SERVER_ENV = SERVER_ENV_SCHEMA.parse(process.env);
```

Use `safeParse` only when you need a custom startup message:

```ts
const parsed = SERVER_ENV_SCHEMA.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.format());
  process.exit(1);
}

export const SERVER_ENV = parsed.data;
```

## Client env pattern

Client env may contain only public values.

Vite-style:

```ts
export const CLIENT_ENV_SCHEMA = z.object({
  APP_ENV: z.enum(["local", "development", "staging", "production", "test"]).default("local"),
  PUBLIC_API_BASE_URL: z.string().url(),
});

export type ClientEnv = z.infer<typeof CLIENT_ENV_SCHEMA>;

export const CLIENT_ENV = CLIENT_ENV_SCHEMA.parse({
  APP_ENV: import.meta.env.MODE,
  PUBLIC_API_BASE_URL: import.meta.env.VITE_PUBLIC_API_BASE_URL,
});
```

Next.js-style:

```ts
export const CLIENT_ENV = CLIENT_ENV_SCHEMA.parse({
  APP_ENV: process.env.NODE_ENV,
  PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
```

Rules:

- Public env uses framework public prefixes such as `VITE_` or `NEXT_PUBLIC_` when required.
- Secret env must never use public prefixes.
- Client config may expose only values safe to ship to a browser.

## `process.env` rule

Allowed direct access:

- `server-env.ts`
- `client-env.ts`
- framework/tooling config files
- explicit test setup files

Forbidden direct access:

- domain code
- use-cases/application services
- controllers/routes
- repositories
- adapters/SDK clients
- UI components
- validation schemas outside config modules

Wrong:

```ts
export class OpenAiAdapter {
  private readonly apiKey = process.env.OPENAI_API_KEY;
}
```

Right:

```ts
export type OpenAiConfig = { API_KEY: string };

export class OpenAiAdapter {
  constructor(private readonly config: OpenAiConfig) {}
}
```

Composition root:

```ts
const openAiAdapter = new OpenAiAdapter({
  API_KEY: SERVER_ENV.OPENAI_API_KEY,
});
```

## NODE_ENV vs APP_ENV

```txt
NODE_ENV = runtime/tooling mode: development | test | production
APP_ENV  = deployment environment: local | development | staging | production | test
```

Examples:

- Staging usually runs `NODE_ENV=production` and `APP_ENV=staging`.
- Tests use `NODE_ENV=test` and `APP_ENV=test`.
- Do not use `NODE_ENV` as the only deployment environment switch.

## Boolean, number, and list env parsing

Do not parse booleans with `Boolean(value)`. `Boolean("false")` is `true`.

```ts
const BOOLEAN_ENV_SCHEMA = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");
```

Number values must become numbers:

```ts
PORT: z.coerce.number().int().min(1).max(65535).default(3000),
REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
```

Comma-separated values must become arrays:

```ts
const COMMA_SEPARATED_LIST_SCHEMA = z
  .string()
  .transform((value) =>
    value.split(",").map((item) => item.trim()).filter(Boolean),
  );

CORS_ORIGINS: COMMA_SEPARATED_LIST_SCHEMA.default(""),
```

Application code should consume normalized values, not raw strings.

## Secrets

Treat these as sensitive by default:

```txt
*_SECRET
*_TOKEN
*_KEY
*_PRIVATE_KEY
DATABASE_URL
JWT_SECRET
OPENAI_API_KEY
STRIPE_SECRET_KEY
SUPABASE_SERVICE_ROLE_KEY
WEBHOOK_SECRET
COOKIE_SECRET
SESSION_SECRET
```

Rules:

- Do not commit secrets.
- Do not log secrets.
- Do not expose secrets to client bundles.
- Do not include secrets in examples, docs, tests, snapshots, screenshots, or OpenAPI examples.
- If a secret leaks, rotate it; deleting the commit is not enough.

Public values such as `PUBLIC_API_BASE_URL`, `PUBLIC_APP_URL`, `PUBLIC_SUPABASE_URL`, and
`PUBLIC_SUPABASE_ANON_KEY` still require backend authorization, RLS, or provider security rules.

## Config objects

Do not pass the entire env object everywhere. Create focused typed config objects.

```ts
export const DATABASE_CONFIG = {
  URL: SERVER_ENV.DATABASE_URL,
} as const;

export const LOGGER_CONFIG = {
  LEVEL: SERVER_ENV.LOG_LEVEL,
} as const;

export const HTTP_CONFIG = {
  PORT: SERVER_ENV.PORT,
  CORS_ORIGINS: SERVER_ENV.CORS_ORIGINS,
} as const;
```

Adapters receive focused config, not raw env. Keep config construction in config/composition-root
code.

## `.env` file standard

Required:

```txt
.env.example
```

Local or secret files are not committed:

```txt
.env.local
.env.production
.env.staging
```

Test env may be committed only if it contains no secrets.

`.env.example` must document required variables:

```env
NODE_ENV=development
APP_ENV=local
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/app
LOG_LEVEL=info
CORS_ORIGINS=http://localhost:3000
OPENAI_API_KEY=
```

When env changes, update the env schema, config object, `.env.example`, deployment docs when
affected, and critical config tests.

## Test environment safety

Tests must not accidentally connect to production or staging services.

```ts
if (SERVER_ENV.NODE_ENV === "test" && SERVER_ENV.DATABASE_URL.toLowerCase().includes("prod")) {
  throw new Error("Test environment cannot use production database.");
}
```

Use explicit test config, local/test database URLs, and no production/staging API keys. Mock/fake
external providers unless a real integration test is intentional.

## Runtime config vs tooling config

Keep runtime app config under `src/shared/config/`. Tooling config files such as `eslint.config.js`,
`vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, and `drizzle.config.ts` may read env
when required by the tool. Business/application code still must not.

## AI coding workflow

When adding or changing config:

1. Classify the value as server-only, client-public, test-only, or tooling-only.
2. Add it to the correct env schema.
3. Validate and normalize it with Zod.
4. Expose only a focused typed config object.
5. Pass config into adapters/factories through constructor or factory args.
6. Update `.env.example`.
7. Update deployment docs when deployment changes.
8. Add/adjust tests for critical config behavior.
9. Ensure secrets are not logged, exposed, or used in examples.

## Review checklist

Before approving config/environment changes, verify:

- [ ] No `process.env` usage outside allowed files.
- [ ] New env variable is validated with Zod.
- [ ] Critical missing/invalid env fails fast.
- [ ] Server-only secret is not exposed to client code.
- [ ] Client env uses appropriate public prefix.
- [ ] Boolean env parsing does not use `Boolean(value)`.
- [ ] Number/list env values are normalized before use.
- [ ] `NODE_ENV` and `APP_ENV` are not confused.
- [ ] Adapter receives config via constructor/factory, not direct env access.
- [ ] `.env.example` is updated.
- [ ] Secret values are not logged or committed.
- [ ] Tests cannot connect to production/staging services accidentally.
- [ ] Deployment documentation is updated when relevant.

## Common anti-patterns

Do not introduce:

```ts
const apiKey = process.env.OPENAI_API_KEY;
```

outside config modules.

Do not parse booleans like this:

```ts
const enabled = Boolean(process.env.FEATURE_ENABLED);
```

Do not expose server secrets to client code:

```ts
export const CLIENT_ENV = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};
```

Do not pass raw env everywhere:

```ts
new StripeAdapter(process.env);
```

Do not log env/config objects wholesale:

```ts
LOGGER.info({ env: process.env });
LOGGER.info({ config: SERVER_ENV });
```

## Required tests

Add tests when config is critical or security-sensitive:

- missing `DATABASE_URL` fails
- invalid URL fails
- boolean env accepts only `"true"` / `"false"`
- number env parses to number and rejects invalid values
- list env parses to array
- test environment rejects production-looking database URLs
- client env schema does not include server-only secrets

Example:

```ts
describe("SERVER_ENV_SCHEMA", () => {
  it("rejects missing DATABASE_URL", () => {
    const result = SERVER_ENV_SCHEMA.safeParse({
      NODE_ENV: "development",
      APP_ENV: "local",
      PORT: "3000",
    });

    expect(result.success).toBe(false);
  });
});
```

## Final rule

If code needs configuration, it should receive a typed config object. If code reaches for
`process.env`, stop and move that access to the config boundary.
