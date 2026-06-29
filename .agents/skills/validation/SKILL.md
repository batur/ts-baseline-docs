---
name: validation
description: >
  Apply the project's Zod runtime validation standard for TypeScript APIs, forms, env/config,
  webhooks, third-party responses, and AI outputs. Use when creating or reviewing schemas, DTO
  inputs, request body/query/path parsing, PATCH validation, Zod error mapping, or boundary
  validation.
compatibility:
  Designed for VS Code Agent Skills and Agent Skills compatible coding agents working in TypeScript
  projects.
metadata:
  version: "1.0.0"
  domain: "software-architecture"
---

# Validation Skill

## Goal

Use this skill to create or review runtime validation in TypeScript projects.

Project rule:

```txt
TypeScript = compile-time safety.
Zod = runtime boundary safety.
```

Every external input is untrusted until it is validated at the system boundary and converted into a
typed DTO/input object.

## When to use this skill

Use this skill for:

- HTTP request body validation
- Query parameter validation
- Path/header/cookie validation
- PATCH/update schema design
- Environment/config validation
- Frontend form validation
- Webhook payload validation
- Third-party API response validation or normalization
- AI structured output validation
- Zod error mapping to API error details
- Reviewing whether raw external data leaks into application/domain logic

## Core validation flow

```txt
unknown external input
→ Zod parse/safeParse at boundary
→ typed input DTO
→ application/use-case layer
→ domain/business logic
```

Do not pass raw request bodies, raw query objects, raw webhooks, raw provider responses, raw AI
outputs, or raw `process.env` into use-cases or domain logic.

## Schema ownership

Place schemas close to the component that owns the input.

```txt
src/modules/users/user.schema.ts
src/shared/validation/zod-error.mapper.ts
```

Rules:

- Feature/module-specific schemas stay inside the owning component.
- Do not move business-specific schemas into `shared/`.
- `shared/validation` may contain generic helpers, mappers, and reusable primitive validators.
- Cross-component consumers import intentionally public schemas through the component `index.ts`
  API.

## Naming standard

Schema constants use `SCREAMING_SNAKE_CASE`.

Inferred types use `PascalCase`.

```ts
export const CREATE_USER_SCHEMA = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
});

export type CreateUserInput = z.infer<typeof CREATE_USER_SCHEMA>;
```

Examples:

```txt
CREATE_USER_SCHEMA      -> CreateUserInput
UPDATE_USER_SCHEMA      -> UpdateUserInput
LIST_USERS_QUERY_SCHEMA -> ListUsersQuery
USER_PATH_PARAMS_SCHEMA -> UserPathParams
SERVER_ENV_SCHEMA       -> ServerEnv
```

## Request body validation

Request bodies use direct DTOs. Do not wrap request input in a top-level envelope.

Good request body:

```json
{
  "email": "ali@example.com",
  "displayName": "Ali"
}
```

Good schema:

```ts
export const CREATE_USER_SCHEMA = z
  .object({
    email: z.string().email(),
    displayName: z.string().min(1).max(100),
  })
  .strict();
```

Rules:

- Public API request body object schemas use `.strict()` by default.
- Unknown fields return `400 Bad Request`.
- Do not use request body coercion by default. JSON clients should send correct JSON types.
- Validate before calling the use-case.

Good:

```ts
const body = await request.json();
const input = CREATE_USER_SCHEMA.parse(body);
await createUser(input);
```

## Query validation

Query values are string-based, so controlled coercion is allowed.

```ts
export const LIST_USERS_QUERY_SCHEMA = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().min(1).optional(),
    sort: z.enum(["createdAt", "-createdAt", "displayName", "-displayName"]).optional(),
    status: z.enum(["active", "inactive"]).optional(),
    search: z.string().min(1).max(100).optional(),
  })
  .strict();
```

Rules:

- Query schemas use `.strict()`.
- Unsupported query params return `400 Bad Request`.
- Document supported filters, sort, and search in OpenAPI for public endpoints.

## Path validation

Path params are external string input.

```ts
export const USER_ID_SCHEMA = z.string().regex(/^usr_[a-zA-Z0-9]+$/);

export const USER_PATH_PARAMS_SCHEMA = z.object({
  userId: USER_ID_SCHEMA,
});
```

Status rule:

```txt
/users/invalid-id  -> 400 Bad Request
/users/usr_missing -> 404 Not Found
```

Invalid format is `400`; valid format but missing resource is `404`.

## PATCH/update validation

PATCH schemas are partial update DTOs.

Rules:

- PATCH is the default partial update method.
- PUT is only for full replacement.
- Omitted field means unchanged.
- `null` means clear only if the field is nullable.
- Empty body returns `400 EMPTY_UPDATE`.
- Unknown field returns `400 Bad Request`.
- Known but semantically invalid field returns `422 Unprocessable Entity`.

Example:

```ts
export const UPDATE_USER_SCHEMA = z
  .object({
    displayName: z.string().min(1).max(100).optional(),
    timezone: z.string().min(1).optional(),
    avatarUrl: z.string().url().nullable().optional(),
  })
  .strict()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one field must be provided.",
    path: [],
  });
```

Patch semantics:

```txt
displayName omitted -> unchanged
displayName string  -> updated
avatarUrl omitted   -> unchanged
avatarUrl null      -> cleared
avatarUrl string    -> updated
```

When applying patches, check `!== undefined`; do not use truthiness.

Bad:

```ts
if (input.displayName) user.displayName = input.displayName;
```

Good:

```ts
if (input.displayName !== undefined) user.displayName = input.displayName;
```

## Environment/config validation

Environment variables are external input.

Rules:

- Read `process.env` only inside env/config modules.
- Validate env at startup.
- Fail fast if critical env is missing or invalid.
- Runtime code consumes typed config objects.
- Separate server env from client env.
- Never expose secrets to the client bundle.

```ts
export const SERVER_ENV_SCHEMA = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_ENV: z.enum(["local", "development", "staging", "production", "test"]).default("local"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().url(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  FEATURE_AI_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export const SERVER_ENV = SERVER_ENV_SCHEMA.parse(process.env);
```

Boolean env rule:

```txt
Allowed raw values: "true" or "false".
Do not use Boolean(process.env.FEATURE_FLAG).
```

List env values must be parsed into arrays before application code consumes them.

## Webhook validation

Webhook flow:

1. Verify provider signature first.
2. Apply timestamp/replay protection when available.
3. Validate or normalize parsed payload with Zod.
4. Store provider event IDs for idempotency when needed.
5. Never pass raw webhook payloads into business logic.

Invalid signature stops processing before schema validation.

## Third-party response validation

Provider responses are external input.

Rules:

- Critical provider responses must be validated or normalized at the adapter boundary.
- Raw provider responses must not leak into application/domain logic.
- Low-risk SDK responses may be normalized instead of fully validated, but raw SDK shapes should not
  pass inward.

```ts
const rawCustomer = await stripe.customers.retrieve(customerId);
const customer = STRIPE_CUSTOMER_SCHEMA.parse(rawCustomer);
return mapStripeCustomer(customer);
```

## AI output validation

AI model output is untrusted.

Rules:

- Structured AI output must be validated with Zod before use.
- Reject missing fields, invalid enum values, invalid score ranges, unsafe tool data, and malformed
  JSON.
- Failed AI output validation should map to a safe application/provider error.
- Do not execute tool calls or write to databases from unvalidated model output.

```ts
export const JOB_SCORE_SCHEMA = z.object({
  score: z.number().min(0).max(100),
  reasons: z.array(z.string()),
  hardVeto: z.boolean(),
});
```

## `parse` vs `safeParse`

Use `parse` when fail-fast is appropriate:

- Startup env validation
- Test fixture setup
- Internal invariant checks

Use `safeParse` when controlled error mapping is needed:

- Request body
- Query params
- Path params
- Headers/cookies
- Webhook payloads
- Third-party responses
- AI output

API boundary default:

```txt
safeParse -> map error -> standard API error envelope
```

## Coerce and transform rules

Coercion is allowed by default for:

- Query params
- Path params when appropriate
- Environment variables

Coercion is not default for JSON request bodies.

Transforms are for normalization only:

- trim
- lowercase normalize
- date parsing
- comma-separated env parsing
- boolean env parsing

Do not hide business decisions inside transforms.

## Strict, passthrough, strip

Default for public API input objects:

```txt
.strict()
```

Use `passthrough` only for intentional dynamic payloads:

- Provider webhook metadata
- User-defined metadata objects
- Provider-specific dynamic fields

Use `strip` rarely. It can hide client mistakes. Prefer rejecting unknown fields with `400` for
public APIs.

## Zod error mapping

Do not return raw Zod errors to clients.

Map Zod issues to standard API error details:

```ts
export type ApiErrorDetail = {
  field?: string;
  message: string;
  code?: string;
};
```

Rules:

- Include stable high-level `error.code`.
- Include field paths when safe and useful.
- Keep messages user-safe.
- Do not expose stack traces, provider internals, or DB internals.

## Input validation vs domain validation

Input validation checks:

- required fields
- type
- format
- length
- enum values
- basic ranges
- unknown fields

Domain/application validation checks:

- authorization
- tenant boundary
- state transitions
- uniqueness
- subscription/quota/payment policy
- immutable fields in current state

Do not put business policy into Zod when it belongs in application/domain logic.

## Response validation

Runtime response validation is not required by default.

Default response safety comes from:

- explicit serializers
- response DTO types
- tests for critical contracts
- OpenAPI generation/checks

Use response validation for:

- third-party responses
- AI outputs
- public API contract tests
- generated SDK workflows

Do not return database rows directly from API responses.

## Coding workflow

When adding or changing validation:

1. Identify the boundary: body, query, path, env, webhook, provider, form, or AI output.
2. Place the schema in the owning component or config/shared validation module.
3. Name the schema constant in `SCREAMING_SNAKE_CASE`.
4. Export the inferred type in `PascalCase`.
5. Use `.strict()` for public API object inputs.
6. Use `safeParse` at API boundaries if standard error mapping is needed.
7. Map validation failures to the standard error envelope.
8. Keep business policy in application/domain logic.
9. Add or update tests for critical schemas.
10. Update OpenAPI docs when public API inputs change.

## Review checklist

Verify:

- External input is not passed raw into use-cases/domain logic.
- Public API object schemas use `.strict()`.
- Unknown fields return `400`.
- Query/path/env coercion is controlled.
- JSON body coercion is not used by default.
- PATCH schemas reject empty objects.
- Nullable fields intentionally support `null` clear semantics.
- Zod errors are normalized before returning to clients.
- Business policy is not hidden in transforms/refinements.
- `process.env` is read only inside config modules.
- Webhooks verify signatures before processing.
- Third-party/AI outputs are validated or normalized at adapter boundaries.
- Tests cover critical schemas and failure cases.
- OpenAPI is updated for public API contract changes.

## Required tests

Add tests for critical schemas: auth, payment/billing, webhook payloads, AI structured outputs,
PATCH update schemas, permission-sensitive inputs, and env schemas.

PATCH schema tests should cover empty update rejection, unknown field rejection, nullable clear
semantics, non-nullable null rejection, and valid partial updates.

Error mapping tests should cover `details[].field`, `VALIDATION_ERROR`, `requestId`, and no raw Zod
error leakage.

## Anti-patterns

Do not:

- Pass `await request.json()` directly into a use-case.
- Use TypeScript types as a substitute for runtime validation.
- Put feature-specific schemas in `shared/validation`.
- Accept unknown fields silently in public API inputs.
- Use `Boolean(process.env.FLAG)` for boolean env values.
- Use broad `z.coerce` on JSON request bodies.
- Hide authorization or business policy inside Zod transforms.
- Return raw Zod errors to clients.
- Execute AI tool calls from unvalidated model output.
- Log raw request bodies or validation payloads that may include secrets or PII.
