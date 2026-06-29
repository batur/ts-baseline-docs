---
name: patch-update
description: >
  Design, implement, and review PATCH/partial-update behavior in TypeScript REST APIs. Use when
  adding or reviewing PATCH endpoints, update schemas, nullable field clearing, immutable fields,
  optimistic concurrency, update serializers, or tests for partial updates.
metadata:
  version: "1.0.0"
  project: "typescript-architecture-baseline"
---

# PATCH / Update Skill

Use this skill when implementing or reviewing partial update behavior in a TypeScript API.

For broader endpoint design, also apply `api-design`. For error mapping, apply `error-handling`. For
Zod schema details, apply `validation`.

## Goal

Implement update behavior that is explicit, safe, predictable, and compatible with the accepted REST
API baseline.

PATCH is the default update method for partial updates. PUT is reserved for full replacement only.

## Core rules

- Use `PATCH` for partial updates.
- Use `PUT` only for full replacement semantics.
- PATCH request bodies are direct partial DTOs. Do not wrap them in `data`, `payload`, or
  `attributes`.
- Omitted field means unchanged.
- `null` means clear the value only when the field is explicitly nullable.
- Empty PATCH object is invalid and returns `400 EMPTY_UPDATE`.
- Unknown fields are invalid and return `400 BAD_REQUEST` or `400 VALIDATION_ERROR`.
- Known but not allowed or semantically invalid fields return `422 VALIDATION_ERROR` or a
  domain-specific 422 code.
- Unique/state conflicts return `409 CONFLICT`.
- Optimistic concurrency mismatch returns `412 PRECONDITION_FAILED`.
- Successful PATCH returns `200 OK` with the updated resource by default.
- Use `204 No Content` only for explicit performance or protocol reasons.
- High-value mutable resources should consider ETag / If-Match optimistic concurrency.

## PATCH field semantics

Always preserve these semantics:

```txt
field omitted   -> unchanged
field: value    -> updated
field: null     -> clear only if nullable
field undefined -> not valid JSON; do not use as an API signal
```

Example request:

```json
{
  "displayName": "Ali Updated",
  "avatarUrl": null
}
```

Interpretation:

```txt
displayName -> update to "Ali Updated"
avatarUrl   -> clear, only if avatarUrl is nullable
all other fields -> unchanged
```

## Request schema rules

Use Zod for update schemas.

Schema constants use `SCREAMING_SNAKE_CASE`. Inferred types use `PascalCase`.

Good:

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
  });

export type UpdateUserInput = z.infer<typeof UPDATE_USER_SCHEMA>;
```

Rules:

- Use `.strict()` for public API update schemas.
- Reject unknown fields.
- Reject empty update objects.
- Do not use `z.coerce` by default for JSON request bodies.
- Do not hide business decisions inside Zod transforms.
- Keep feature-specific update schemas inside the owning component/module.
- Put generic validation helpers only under `shared/validation`.

## Request body shape

Good:

```json
{
  "displayName": "Ali Updated"
}
```

Bad:

```json
{
  "data": {
    "displayName": "Ali Updated"
  }
}
```

The accepted API baseline uses direct request DTOs and a custom response envelope.

## Response shape

Return the updated resource by default.

```json
{
  "data": {
    "id": "usr_123",
    "displayName": "Ali Updated",
    "avatarUrl": null,
    "updatedAt": "2026-06-28T12:00:00.000Z"
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

Rules:

- Do not return database rows directly.
- Use explicit serializers for API DTOs.
- JSON fields use `camelCase`.
- Timestamps are ISO 8601 strings.
- Include `X-Request-Id` response header and `meta.requestId` when applicable.

## Error behavior

Use the standard error envelope:

```json
{
  "error": {
    "code": "EMPTY_UPDATE",
    "message": "At least one field must be provided.",
    "requestId": "req_123"
  }
}
```

Recommended mapping:

| Situation                               | Status | Error code                          |
| --------------------------------------- | -----: | ----------------------------------- |
| Malformed JSON                          |    400 | `BAD_REQUEST`                       |
| Body missing or not object              |    400 | `BAD_REQUEST`                       |
| Empty PATCH body                        |    400 | `EMPTY_UPDATE`                      |
| Unknown field                           |    400 | `BAD_REQUEST` or `VALIDATION_ERROR` |
| Invalid field type/shape                |    400 | `VALIDATION_ERROR`                  |
| Known field fails semantic validation   |    422 | `VALIDATION_ERROR`                  |
| Known immutable field cannot be updated |    422 | `IMMUTABLE_FIELD`                   |
| Invalid state transition                |    422 | domain-specific code                |
| Target resource not found               |    404 | resource-specific not-found code    |
| Duplicate/unique conflict               |    409 | `CONFLICT` or domain-specific code  |
| ETag / If-Match mismatch                |    412 | `PRECONDITION_FAILED`               |
| Rate limited update                     |    429 | `RATE_LIMITED`                      |
| Unexpected failure                      |    500 | `INTERNAL_ERROR`                    |

Do not return stack traces, database errors, provider errors, or raw Zod errors to the client.

## Immutable fields

Do not silently ignore immutable fields.

Examples:

```txt
id
createdAt
createdBy
organizationId
tenantId
role
status, in some state machines
billingPlan, outside billing flow
```

Rules:

- Unknown/sensitive fields not in the schema are rejected as 400.
- Fields that are known but not allowed for this endpoint or current state return 422.
- Prefer endpoint-specific schemas over broad generic update schemas.
- Avoid `EntitySchema.partial()` if it exposes immutable, admin-only, tenant, or security-sensitive
  fields.

## Applying a patch

When applying a patch, distinguish omitted fields from `null`.

Good:

```ts
export function applyUserPatch(user: User, input: UpdateUserInput): User {
  return {
    ...user,
    ...(input.displayName !== undefined && {
      displayName: input.displayName,
    }),
    ...(input.timezone !== undefined && {
      timezone: input.timezone,
    }),
    ...(input.avatarUrl !== undefined && {
      avatarUrl: input.avatarUrl,
    }),
    updatedAt: new Date(),
  };
}
```

Rules:

- Check `!== undefined` to detect provided fields.
- Do not use truthiness checks for update values.
- Do not write `...(input.name && { name: input.name })`.
- Preserve `null` when null means clear.
- Do not mutate existing objects unless the domain model explicitly uses mutation.

## Authorization and tenant boundaries

A PATCH endpoint is a mutation and must enforce authorization.

Rules:

- Authenticate at guard/middleware level.
- Pass normalized `AuthContext` to the use-case.
- Enforce authorization server-side in the use-case/application layer.
- Client-side permission checks are only UX helpers.
- Tenant-scoped resources must be loaded with tenant/organization boundary.

Good:

```ts
const project = await PROJECT_REPOSITORY.findByIdForOrganization(
  projectId,
  authContext.organizationId,
);

if (!project) {
  throw new AppError(PROJECT_ERROR_CODE.PROJECT_NOT_FOUND, "Project not found.", 404);
}

await PERMISSIONS.require(authContext, "project:update", {
  organizationId: project.organizationId,
});
```

For tenant-scoped resources, generic `findById` can leak cross-tenant existence unless it is an
explicit admin/internal method.

## Transactions

Use explicit transactions for multiple related writes.

Transaction required examples:

```txt
update user + write audit log
update order + update inventory
update billing settings + write billing audit record
update resource + outbox event
update status + state transition history
```

Rules:

- Transaction boundary belongs in the use-case/application layer.
- Repository methods may accept a transaction context.
- Do not let unrelated repository calls create hidden transaction behavior.

## Optimistic concurrency

Use ETag / If-Match for high-value mutable resources where lost updates matter.

Recommended for:

```txt
billing settings
organization settings
collaborative content
profile/settings forms
inventory/order status
admin configuration
```

Example request:

```http
PATCH /api/v1/users/usr_123
If-Match: "user-v7"
```

If the resource changed, return `412 Precondition Failed` with `PRECONDITION_FAILED`.

## Idempotency

For side-effect-producing update operations, consider idempotency.

Examples:

```txt
billing-relevant updates
external provider updates
email/SMS-triggering updates
job creation as part of update
AI generation stored as a mutation
```

Use `Idempotency-Key` when the endpoint can produce duplicate side effects on retries.

## OpenAPI documentation

When adding or changing a PATCH endpoint, update OpenAPI metadata.

Document:

- `operationId`
- tags
- summary
- path params
- request body schema
- `200` success response
- relevant `400`, `401`, `403`, `404`, `409`, `412`, `422`, `429`, and `500` responses
- security scheme
- examples for update and nullable clear behavior

Keep `operationId` stable.

## Coding workflow

When implementing a PATCH endpoint:

1. Identify the owning component/module.
2. Define a narrow update input schema for the endpoint.
3. Use `.strict()` and reject empty objects.
4. Decide nullable fields explicitly.
5. Decide immutable fields explicitly.
6. Implement route/controller as thin boundary code.
7. Validate input at boundary with Zod.
8. Authenticate and pass `AuthContext`.
9. Load tenant-scoped resource safely.
10. Enforce server-side authorization.
11. Apply patch semantics without truthiness bugs.
12. Use a transaction if multiple related writes occur.
13. Serialize the updated resource into API DTO.
14. Return `200 OK` with `{ data, meta }`.
15. Add or update tests.
16. Update OpenAPI when the API contract changes.

## Review checklist

Use this checklist for AI code review:

- Is the endpoint using PATCH for partial update rather than PUT?
- Is PUT used only for full replacement?
- Is the request body a direct partial DTO with no envelope?
- Does the schema use `.strict()`?
- Does the schema reject an empty object?
- Are unknown fields rejected?
- Are nullable fields explicitly modeled with `.nullable().optional()`?
- Does `null` mean clear only for nullable fields?
- Are immutable fields excluded or rejected?
- Is `z.coerce` avoided for JSON body fields unless justified?
- Does the use-case receive typed input, not raw request body?
- Is authorization enforced server-side?
- Is tenant-scoped data loaded with organization/tenant boundary?
- Are omitted fields preserved?
- Is patch application using `!== undefined` instead of truthiness?
- Are multiple related writes inside a transaction?
- Is conflict mapped to 409?
- Is concurrency mismatch mapped to 412?
- Does the response return the updated resource by default?
- Is a serializer used instead of returning a DB row?
- Are error responses using the standard error envelope?
- Are tests added for empty body, unknown fields, null clearing, immutable fields, auth, tenant
  boundary, and success?
- Is OpenAPI updated if the API changed?

## Required tests

Minimum schema tests:

```txt
empty update rejected
unknown field rejected
nullable field can be cleared with null
non-nullable field rejects null
valid partial update accepted
```

Minimum API/use-case tests:

```txt
unauthenticated request -> 401
authenticated but unauthorized -> 403
cross-tenant resource -> 404 or project-specific protected response
resource not found -> 404
immutable field update -> 422
duplicate/conflict -> 409
successful update -> 200 + updated resource
omitted fields remain unchanged
```

Add concurrency tests when ETag / If-Match is implemented.

## Anti-patterns

Do not:

- Use PUT for partial updates.
- Accept empty PATCH objects.
- Treat omitted and `null` as the same.
- Use truthiness checks to apply fields.
- Use `EntitySchema.partial()` if it exposes immutable/admin-only fields.
- Silently ignore unknown or immutable fields.
- Put business rules in Zod transforms.
- Return raw database rows.
- Let controllers contain business update logic.
- Let frontend permission checks replace server-side authorization.
- Fetch tenant-scoped resources without tenant/organization filter.
- Return stack traces or raw provider/database errors.
- Forget OpenAPI changes for API behavior changes.

## Good endpoint shape

```ts
export async function updateUserController(request: Request) {
  const requestId = getRequestId(request);
  const authContext = await AUTH_GUARD.requireUser(request);
  const params = USER_PATH_PARAMS_SCHEMA.parse(getPathParams(request));
  const input = UPDATE_USER_SCHEMA.parse(await request.json());

  const user = await updateUser({
    userId: params.userId,
    input,
    authContext,
  });

  return json(
    {
      data: serializeUser(user),
      meta: { requestId },
    },
    {
      status: 200,
      headers: { "X-Request-Id": requestId },
    },
  );
}
```

## Completion criteria

A PATCH/update implementation is acceptable only when:

- Update semantics are explicit and tested.
- Authorization and tenant boundaries are enforced.
- Error mapping follows the standard envelope and HTTP status rules.
- The response is serialized and does not leak database models.
- OpenAPI and tests are updated when relevant.
