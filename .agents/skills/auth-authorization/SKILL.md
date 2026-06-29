---
name: auth-authorization
description: Defines authentication and authorization rules for TypeScript applications. Use when adding or reviewing auth guards, AuthContext, provider adapters, role/permission checks, tenant or organization boundaries, API key auth, 401/403/404 behavior, protected routes, and server-side access control.
license: Proprietary
metadata:
  version: "1.0.0"
  project: "software-architecture-design"
  standard: "ADR-014 Authentication and Authorization Standard"
---

# Auth & Authorization Skill

## When to use this skill

Use this skill when a task touches:

- authentication, login state, sessions, JWTs, bearer tokens, cookies, API keys, SSO, or auth providers
- authorization, roles, permissions, guards, policies, or access checks
- tenant, organization, workspace, project, team, or account boundaries
- protected API routes, protected frontend pages, middleware, route handlers, or use-cases
- Supabase Auth, Auth.js/NextAuth, Firebase Auth, custom JWT, API key auth, or enterprise SSO
- 401, 403, or security-sensitive 404 behavior
- review of whether a user is allowed to read, update, delete, invite, bill, generate, export, or administer something

If the task is only UI visibility, still check whether server-side authorization exists.

## Goal

Separate identity from permission.

Authentication answers:

```txt
Who is this caller?
```

Authorization answers:

```txt
Can this caller perform this action on this resource in this context?
```

Do not treat a logged-in user as automatically authorized.

## Core rules

1. Authentication and authorization are separate concerns.
2. Authentication is centralized in guards, middleware, or provider adapters.
3. Application/use-case code receives a normalized `AuthContext`.
4. Application/use-case code must not receive raw tokens, raw sessions, provider SDK user objects, request headers, or cookies.
5. Provider SDKs are infrastructure details and must stay behind adapters.
6. Authorization is enforced server-side.
7. Client-side permission checks are UX helpers only; they are not security controls.
8. Business-sensitive use-cases must check permission before performing mutations or sensitive reads.
9. Tenant-scoped resources must enforce `organizationId` / `tenantId` boundaries at query and use-case level.
10. Role may be used for user management, but business authorization should be permission-based.
11. Permissions use the `resource:action` format.
12. API keys must be hashed at rest and shown only once at creation time.
13. Missing or invalid auth returns `401`.
14. Authenticated but unauthorized access returns `403`.
15. Cross-tenant or resource-enumeration-sensitive access may return `404`.

## Standard AuthContext

Use a normalized auth context instead of provider-specific objects.

```ts
export type AuthType = "session" | "bearer-token" | "api-key";

export type AuthContext = {
  userId: string;
  organizationId?: string;
  roles: string[];
  permissions: string[];
  authType: AuthType;
};
```

For API keys:

```ts
export type ApiKeyAuthContext = {
  authType: "api-key";
  apiKeyId: string;
  organizationId: string;
  permissions: string[];
};
```

When a use-case needs authentication, pass `AuthContext` explicitly:

```ts
await updateProject({
  projectId,
  input,
  authContext,
});
```

Do not pass:

```ts
request.headers.authorization
```

Do not pass provider SDK session objects into use-cases.

## Authentication provider adapters

Auth providers are interchangeable details.

Supported provider examples:

- Supabase Auth
- Auth.js / NextAuth
- Firebase Auth
- custom JWT
- session cookie
- API key auth
- enterprise SSO

Use an adapter interface:

```ts
export interface AuthProvider {
  authenticate(request: Request): Promise<AuthContext | null>;
}
```

A route/guard can normalize provider-specific auth:

```ts
const authContext = await AUTH_GUARD.requireUser(request);
```

Application/domain logic must not import auth provider SDKs. Those imports belong in adapters, infrastructure, middleware, or composition root.

## Guard standard

Protected routes must be explicit.

```ts
export async function updateProjectController(request: Request) {
  const authContext = await AUTH_GUARD.requireUser(request);
  const input = UPDATE_PROJECT_SCHEMA.parse(await request.json());

  const result = await updateProject({
    projectId,
    input,
    authContext,
  });

  return { data: serializeProject(result) };
}
```

The controller/route handler should authenticate, validate input, call a use-case, and serialize output. It should not contain business authorization rules unless the framework requires a thin guard layer.

## Permission model

Prefer permission-based business authorization.

Permission format:

```txt
resource:action
```

Examples:

```txt
user:read
user:update
project:create
project:update
project:delete
billing:manage
organization:invite-member
api-key:create
api-key:revoke
ai-generation:create
```

Roles may map to permissions, but do not hard-code role checks in many places if permissions can express the rule.

Avoid:

```ts
if (authContext.roles.includes("admin")) {
  // allow everything
}
```

Prefer:

```ts
await PERMISSIONS.require(authContext, "project:update", {
  organizationId: project.organizationId,
});
```

## Authorization location

Authorization must be enforced in the application/use-case layer for business-sensitive operations.

Good:

```ts
export async function updateProject(params: {
  projectId: string;
  input: UpdateProjectInput;
  authContext: AuthContext;
}) {
  const project = await PROJECT_REPOSITORY.findByIdForOrganization(
    params.projectId,
    params.authContext.organizationId,
  );

  if (!project) {
    throw new AppError(PROJECT_ERROR_CODE.PROJECT_NOT_FOUND, "Project not found.", 404);
  }

  await PERMISSIONS.require(params.authContext, "project:update", {
    organizationId: project.organizationId,
  });

  return PROJECT_REPOSITORY.update(project.id, params.input);
}
```

Bad:

```ts
// UI hides the button, so backend does not check permission.
```

Bad:

```ts
// Controller checks a role, but the use-case can be called elsewhere without authorization.
```

## Tenant and organization boundary

For multi-tenant systems, permission checks are not enough. Queries must also be tenant-safe.

Prefer repository methods like:

```ts
findByIdForOrganization(id: string, organizationId: string)
```

Avoid tenant-scoped generic methods like:

```ts
findById(id: string)
```

unless they are clearly internal/admin-only:

```ts
findByIdForAdmin(id: string)
```

Tenant-scoped resource access must include `organizationId` or `tenantId` in the query.

For cross-tenant access, prefer `404` when resource existence should not be leaked.

## HTTP status behavior

Use this status mapping:

| Situation | Status |
|---|---:|
| No token/session/API key | 401 |
| Invalid token/session/API key | 401 |
| Expired token/session | 401 |
| Authenticated but missing permission | 403 |
| Resource does not exist | 404 |
| Resource belongs to another tenant and existence should be hidden | 404 |
| Resource exists but user is not allowed and existence is not sensitive | 403 |
| API key lacks required scope | 403 |

Use the standard error envelope:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "requestId": "req_123"
  }
}
```

Do not return provider raw auth errors to clients.

## API key auth

API keys are credentials and must be handled as secrets.

Rules:

1. Store only a hash of the API key.
2. Show the raw key only once when created.
3. Use a prefix for identification and environment separation.
4. Associate keys with organization/tenant context.
5. Assign explicit permissions/scopes.
6. Support revocation.
7. Never log raw API keys.
8. Never return raw API keys after creation.

Example prefix style:

```txt
sk_live_...
sk_test_...
```

## Supabase Auth notes

When using Supabase:

- Supabase is an auth provider adapter, not a domain dependency.
- Supabase JS client must not leak into domain/application logic.
- Client-side anon access must rely on reviewed RLS policies.
- Service role key is server-only.
- Server privileged operations must go through backend adapters/use-cases.
- RLS does not replace application-level business authorization when use-cases execute privileged operations.

## Firebase Auth notes

When using Firebase:

- Firebase Auth/Admin SDK belongs in an adapter.
- Firestore Security Rules are security controls and must be reviewed/tested.
- Backend use-cases still require explicit permission checks when using admin privileges.
- Do not trust client-side checks alone.

## Auth transport selection

Do not force one transport for every project.

Use these defaults:

- frontend/fullstack apps: session cookie or provider session can be used
- public/backend APIs: bearer token or API key can be used
- automation/service integrations: API key or signed webhook can be used
- enterprise apps: SSO can be added behind the provider adapter

The normalized `AuthContext` remains stable regardless of transport.

## Coding workflow

When adding or changing auth-related code:

1. Identify whether the task is authentication, authorization, or both.
2. Determine the caller type: user session, bearer token, API key, webhook, system job, or admin.
3. Normalize caller identity into `AuthContext`.
4. Validate input before use-case logic.
5. Load tenant-scoped resources with tenant-safe repository/query methods.
6. Perform server-side permission checks in the use-case/application layer.
7. Return 401/403/404 according to the status rules.
8. Do not leak provider error details, resource existence, tokens, or secrets.
9. Add or update tests for protected paths, forbidden paths, and tenant boundaries.
10. Update OpenAPI security definitions if the API contract changed.
11. Update docs/ADR if the auth model or permission model changed.

## Review checklist

Check every auth-related change for:

- [ ] Does application/use-case code receive `AuthContext`, not raw token/session/header/cookie?
- [ ] Is authentication centralized in guard/middleware/provider adapter?
- [ ] Is provider SDK usage isolated to adapter/infrastructure/composition code?
- [ ] Is authorization enforced server-side?
- [ ] Does the use-case check permission before sensitive read/write?
- [ ] Is the permission expressed as `resource:action`?
- [ ] Are role checks limited and not used as broad bypasses?
- [ ] Are tenant-scoped queries filtered by `organizationId` or `tenantId`?
- [ ] Does cross-tenant access avoid leaking resource existence when needed?
- [ ] Are 401, 403, and 404 used correctly?
- [ ] Are API keys hashed and never logged?
- [ ] Are API key scopes/permissions explicit?
- [ ] Are Supabase RLS / Firestore Security Rules reviewed when used?
- [ ] Are tests added for unauthenticated, unauthorized, allowed, and cross-tenant cases?
- [ ] Is OpenAPI security metadata updated for protected endpoints?

## Required tests

For protected endpoints/use-cases, add tests for:

- unauthenticated request returns 401
- invalid token/session/API key returns 401
- authenticated user missing permission returns 403
- cross-tenant resource access returns 404 or 403 according to project policy
- allowed permission succeeds
- tenant-scoped query cannot access another organization’s resource
- API key auth works with valid key
- API key missing scope returns 403
- API key raw value is not stored
- provider adapter maps provider failures safely

Business-sensitive use-cases must not be merged without authorization tests.

## Good examples

### Use-case receives AuthContext

```ts
export async function createProject(params: {
  input: CreateProjectInput;
  authContext: AuthContext;
}) {
  await PERMISSIONS.require(params.authContext, "project:create", {
    organizationId: params.authContext.organizationId,
  });

  return PROJECT_REPOSITORY.createForOrganization({
    organizationId: params.authContext.organizationId,
    name: params.input.name,
  });
}
```

### Tenant-safe read

```ts
const project = await PROJECT_REPOSITORY.findByIdForOrganization(
  projectId,
  authContext.organizationId,
);

if (!project) {
  throw new AppError(PROJECT_ERROR_CODE.PROJECT_NOT_FOUND, "Project not found.", 404);
}
```

### API key hashed storage

```ts
const rawKey = createApiKeySecret();
const keyHash = await hashSecret(rawKey);

await API_KEY_REPOSITORY.create({
  keyHash,
  prefix: getKeyPrefix(rawKey),
  organizationId,
  permissions,
});
```

## Anti-patterns

Do not:

- pass raw `Authorization` headers into use-cases
- pass provider SDK user/session objects into use-cases
- import Supabase/Firebase/Auth.js/JWT SDKs in domain/application logic
- rely on frontend button hiding as authorization
- use `role === "admin"` as a broad bypass without permission reasoning
- query tenant-scoped resources by ID alone
- store API keys in plain text
- log tokens, cookies, sessions, API keys, or auth provider raw errors
- return raw provider auth errors to clients
- return 403 for cross-tenant access when resource enumeration is sensitive
- allow background jobs/system users to bypass permissions without explicit system context

## Related skills

Use together with:

- `security-baseline` for secure-by-default checks
- `api-design` for protected endpoint design
- `error-handling` for 401/403/404 error mapping
- `validation` for auth input validation
- `database-persistence` for tenant-safe persistence access
- `testing` for auth and tenant boundary tests
- `openapi` for security scheme documentation
