---
name: security-baseline
description: Enforce the project's secure-by-default TypeScript/Node.js security baseline. Use when creating or reviewing authentication, authorization, API endpoints, input handling, CORS, rate limits, secrets, logging, webhooks, file uploads, SSRF-sensitive URL fetching, dependency/security checks, or AI-generated code.
license: Proprietary
metadata:
  version: "1.0.0"
  owner: "software-architecture-baseline"
  project: "typescript-architecture-baseline"
---

# Security Baseline Skill

## When to use this skill

Use this skill when a task touches any security-relevant behavior:

- API endpoints, controllers, route handlers, middleware, guards, or request parsing
- authentication, authorization, roles, permissions, tenant or organization boundaries
- secrets, environment variables, API keys, tokens, sessions, cookies, or client/server config
- input validation, parsing, sanitization, file upload, webhooks, or third-party payloads
- database queries, raw SQL, user-provided URLs, network calls, SSRF-sensitive features
- logging, observability, error responses, PII handling, audit events, or external error tracking
- dependency changes, generated code, AI-generated code, scripts, CI checks, or pre-commit hooks
- AI application features such as tool calls, RAG, memory, model output parsing, or guardrails

This skill is a baseline. If a project has stricter domain, legal, compliance, customer, or regulatory requirements, follow the stricter rule.

## Goal

Make every TypeScript project secure by default without forcing unnecessary enterprise complexity into small projects. Security must be part of code design, not a last-minute review layer.

Core principle:

```txt
secure by default, explicit by exception, fail closed, never trust external input
```

## Baseline rules

- Treat all external input as untrusted.
- Validate external input at system boundaries with Zod or an approved runtime validation layer.
- Authenticate centrally through guards, middleware, or provider adapters.
- Authorize server-side in use-cases, policies, or application services.
- Do not treat client-side permission checks as security controls.
- Enforce tenant and organization boundaries in data access and use-case logic.
- Keep secrets out of source code, logs, client bundles, examples, screenshots, and test fixtures.
- Read `process.env` only inside config/environment modules.
- Do not expose stack traces, raw database errors, provider errors, or internal exception details to clients.
- Do not log raw request bodies, raw provider responses, tokens, passwords, cookies, authorization headers, API keys, or sensitive personal data.
- Do not build SQL, shell commands, HTML, JSON queries, or URLs with unsafe untrusted string concatenation.
- Require explicit review and written justification for raw SQL.
- Use allowlists for production CORS, external URL fetching, file types, webhook providers, and privileged operations.
- Add tests for security-sensitive behavior.
- Treat AI-generated code as untrusted until manually reviewed, tested, and security-checked.

## Security coding workflow

When implementing or modifying code:

1. Identify all external inputs.
2. Validate body, query, path params, headers, cookies, webhooks, file metadata, third-party responses, and AI output at the boundary.
3. Identify whether the operation is public, authenticated, authorized, tenant-scoped, destructive, expensive, or side-effect-producing.
4. Add authentication and authorization checks before business-sensitive actions.
5. Enforce tenant boundaries in repository/query methods, not only in the UI.
6. Decide whether rate limiting, idempotency, webhook signature verification, or audit logging is required.
7. Ensure secrets and sensitive data cannot be logged, returned, stored unsafely, or exposed to the client.
8. Add or update tests for the security boundary.
9. Update docs, OpenAPI, env examples, or ADRs when behavior or architecture changes.

## External input rules

External input includes:

- HTTP request body, query params, path params, headers, cookies, and form data
- browser storage, uploaded files, and user-provided filenames
- webhooks and signed provider events
- third-party API responses and SDK responses
- database records when crossing trust boundaries
- AI model output, tool-call arguments, memory, RAG documents, and structured model responses
- environment variables and runtime configuration

Rules:

- Public API input schemas use strict object validation by default.
- Unknown fields are rejected unless a documented protocol requires passthrough.
- Query, path, and env values may use controlled coercion.
- JSON request bodies should not silently coerce types by default.
- Zod errors are normalized into the standard API error envelope; raw validation errors are not returned directly.

## Authentication rules

- Authentication must be centralized in guards, middleware, or provider adapters.
- Use a normalized `AuthContext`; do not pass raw tokens, raw cookies, or provider-specific session objects into use-cases.
- Provider SDKs such as Supabase Auth, Auth.js, Firebase Auth, or custom JWT libraries stay behind adapters.
- Missing or invalid authentication returns `401`.
- API keys must be hashed at rest and shown only once when created.
- Raw API keys, tokens, session IDs, refresh tokens, and cookies must never be logged.

Example shape:

```ts
export type AuthContext = {
  userId: string;
  organizationId?: string;
  roles: string[];
  permissions: string[];
  authType: "session" | "bearer-token" | "api-key";
};
```

## Authorization rules

Authentication answers “who is this?” Authorization answers “can they do this?” Keep them separate.

- Enforce authorization server-side.
- Prefer permission-based authorization for business behavior.
- Permission format: `resource:action`.
- Roles may map to permissions, but business logic should check permissions or policies.
- Use-case/application layer must enforce authorization before sensitive mutations or reads.
- Return `403` when the actor is authenticated but lacks permission.
- Return `404` for cross-tenant or enumeration-sensitive resource access when hiding existence is safer.

Example:

```ts
await PERMISSIONS.require(authContext, "project:update", {
  organizationId: project.organizationId,
});
```

## Tenant and organization boundary rules

- Tenant-scoped data must include `organizationId` or `tenantId` in the access path.
- Avoid generic `findById` for tenant-scoped resources.
- Prefer methods such as `findByIdForOrganization(id, organizationId)`.
- Cross-tenant access must not reveal resource existence unless explicitly intended.
- Add tests proving users cannot read, update, delete, or infer resources from another organization.

Bad:

```ts
const project = await PROJECT_REPOSITORY.findById(projectId);
```

Good:

```ts
const project = await PROJECT_REPOSITORY.findByIdForOrganization(
  projectId,
  authContext.organizationId,
);
```

## Secret and config rules

- Any value ending in or containing `SECRET`, `TOKEN`, `KEY`, `PASSWORD`, or `PRIVATE` is sensitive by default.
- `process.env` is allowed only inside config/environment modules.
- Server env and client env must be separated.
- Service role keys are server-only.
- Public client keys must still rely on server-side checks or provider security rules.
- `.env.example` documents required variables but contains no real secret.
- Secret leaks require rotation; removing the commit is not enough.

Bad:

```ts
const apiKey = process.env.OPENAI_API_KEY;
```

Good:

```ts
const openAiAdapter = new OpenAiAdapter(OPENAI_CONFIG.API_KEY);
```

## HTTP security headers

Enable secure defaults for backend APIs and web apps.

Minimum considerations:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `X-Frame-Options` or CSP `frame-ancestors`
- `Content-Security-Policy` for web/frontends when applicable
- `Strict-Transport-Security` in production HTTPS environments

API-only services may not need a full CSP, but browser-facing apps should define one intentionally.

## CORS rules

- Production CORS must be allowlist-based.
- Do not use `origin: "*"` with `credentials: true`.
- Localhost origins may be allowed in development.
- CORS origins should be parsed from typed config, not hardcoded throughout the app.
- CORS is not authentication or authorization.

Bad:

```ts
origin: "*",
credentials: true,
```

Good:

```ts
origin: HTTP_CONFIG.CORS_ORIGINS,
credentials: true,
```

## Rate limiting rules

Rate limiting must be available for public, auth-sensitive, and expensive endpoints.

Apply or consider it for:

- login, signup, OTP send/verify, password reset
- AI generation, file processing, search, scraping, import/export
- public APIs and unauthenticated endpoints
- webhook endpoints when provider behavior and retry patterns allow it

Return `429 Too Many Requests` with the standard error envelope. Include `Retry-After` where useful.

## Injection prevention rules

Never build executable or interpreted strings with untrusted input.

- SQL: use ORM/query builder parameters or parameterized SQL.
- Shell: use `spawn`/argument arrays; never concatenate user input into shell strings.
- HTML: avoid unsafe HTML injection; review `dangerouslySetInnerHTML` explicitly.
- NoSQL/query objects: do not pass raw client objects as query operators.
- URLs: validate and allowlist before fetching or redirecting.

Bad SQL:

```ts
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

Good SQL:

```ts
const rows = await db.execute(sql`
  SELECT * FROM users
  WHERE email = ${email}
`);
```

## Raw SQL review gate

Raw SQL is allowed only with written justification and explicit review.

Every raw SQL block must explain:

- why ORM/query builder is insufficient
- how user input is parameterized
- how tenant/organization filtering is enforced
- whether transaction boundaries are required
- expected indexes/performance impact
- what tests cover behavior and security filters

Use this comment pattern:

```ts
/**
 * Raw SQL justification:
 * - Reason: The query builder cannot express this recursive CTE clearly.
 * - Safety: All user inputs are parameterized.
 * - Tenant boundary: organization_id is included in WHERE clauses.
 * - Review: Requires persistence/security review.
 */
```

## SSRF and user-provided URL rules

User-provided URLs must not be fetched without a guard.

Before fetching user-controlled URLs:

- allow only required protocols, usually `https:`
- block localhost, loopback, private, link-local, and metadata IP ranges
- validate after DNS resolution when possible
- validate every redirect target
- set timeouts and max response size
- use an allowlist when the target domain set is known
- do not forward internal credentials or cookies

Risky features include URL import, image fetchers, PDF downloaders, webhook testers, OG preview, proxy endpoints, and crawl jobs.

## File upload rules

File uploads are untrusted.

Minimum controls:

- max file size
- allowed MIME types and extensions
- server-generated file names
- path traversal prevention
- private/public storage decision
- optional malware scanning for higher-risk projects
- metadata validation before processing

Bad:

```ts
const path = `/uploads/${originalFileName}`;
```

Good:

```ts
const path = `/uploads/${randomUUID()}.pdf`;
```

## Webhook security rules

Webhook payloads must be verified before processing.

Required controls:

- signature verification
- raw body handling when provider requires it
- timestamp tolerance where supported
- replay protection
- idempotency using provider event ID
- safe failure responses that do not reveal secrets

Do not parse, store, or act on webhook payloads before signature verification.

## Error handling security rules

- Client error responses use the standard error envelope.
- Do not return stack traces, SQL errors, provider raw errors, SDK internals, or secret-related details.
- Normalize internal failures to safe error codes and messages.
- Log detailed debug context only after redaction/allowlisting.
- For enumeration-sensitive resources, prefer `404` over `403` when appropriate.

## Logging and PII rules

Log by allowlist, not by dumping objects.

Never log:

- passwords, tokens, API keys, private keys, secrets
- authorization headers, cookies, session IDs, refresh tokens
- raw request bodies, raw provider responses, full webhook payloads
- payment data or card data
- sensitive personal data unless explicitly approved and masked

Potential PII includes email, phone, address, national ID, IP address, location, VIN, and customer identifiers. Mask, hash, or omit unless the log has a documented need.

## Dependency and supply-chain rules

- Keep lockfiles committed.
- Audit dependency changes.
- Avoid adding dependencies for trivial utilities.
- Review new runtime dependencies for maintenance, security, license, and transitive risk.
- Run dependency audit in CI according to the CI/CD skill.
- Document accepted high/critical vulnerability exceptions with owner, mitigation, and review date.

## AI-generated code security rules

Treat AI-generated code as untrusted until reviewed.

Checklist:

- no hardcoded secrets
- no auth bypass
- no raw SQL without justification
- no unsafe `eval`, `new Function`, or shell execution with user input
- no unvalidated model output or tool-call arguments
- no destructive tool calls without explicit authorization and human review when required
- tests added or updated for security-sensitive behavior

## AI application security profile

When the project includes LLM or agent features, also check:

- prompt injection mitigation
- tool permission checks
- model output validation with Zod or equivalent
- PII masking before model calls when required
- retrieval source filtering
- cost/rate limits
- audit trail for tool calls
- human-in-the-loop for destructive or irreversible actions
- no blind trust in memory, retrieved documents, or model-generated JSON

## Required tests

Add or update tests when the feature includes:

- authentication or authorization
- tenant boundary or object-level access control
- webhook verification
- rate limiting
- file upload validation
- SSRF-sensitive URL fetching
- raw SQL or custom query logic
- sensitive error handling
- AI output/tool-call validation
- CORS/security header behavior where applicable

Minimum examples:

- unauthenticated request returns `401`
- missing permission returns `403`
- cross-tenant resource access returns `404` or the project’s chosen safe response
- unknown input fields are rejected
- invalid webhook signatures are rejected
- raw stack trace is not exposed to client
- sensitive values are not included in log context

## AI coding checklist

Before writing code:

- What external inputs does this feature accept?
- Does it require authentication?
- Does it require permission or policy checks?
- Is the resource tenant-scoped?
- Does it perform a side effect or destructive action?
- Does it call an external provider or fetch user-provided URLs?
- Does it store, transmit, log, or expose sensitive data?
- Does it need rate limiting, idempotency, audit logging, or webhook verification?

While writing code:

- Validate input at the boundary.
- Keep controllers/routes thin.
- Keep security decisions server-side.
- Use typed config instead of `process.env`.
- Use serializers for API responses.
- Use repositories/adapters for persistence and external systems.
- Add tests for the security boundary.

## AI review checklist

Reject or request changes if:

- authorization exists only in UI/client code
- raw token/session/provider object reaches use-case logic
- tenant-scoped query lacks `organizationId` or `tenantId`
- raw SQL lacks written justification or parameterization
- CORS uses wildcard with credentials
- secrets or PII are logged or returned
- client receives stack traces or raw provider/DB errors
- webhook payload is processed before signature verification
- user-provided URL is fetched without SSRF guard
- file uploads trust original filenames or lack size/type checks
- AI output is used without validation
- tests are missing for a security-sensitive change

## Common anti-patterns

- `if (user.role === "admin")` scattered across controllers instead of centralized policy/permission checks
- `findById(id)` for tenant-scoped resources
- `console.log(request.body)` or `LOGGER.info({ body })`
- `Boolean(process.env.FEATURE_ENABLED)` for boolean env parsing
- `origin: "*"` with cookies or credentials
- raw SQL with string interpolation
- webhook handlers that parse and process before verifying signatures
- client-side-only authorization
- service role keys exposed to frontend code
- storing API keys in plaintext
- treating LLM output as trusted JSON

## Output expectations

When this skill is applied, the agent should produce or review code that:

- is secure by default
- validates external input
- enforces server-side authorization
- preserves tenant boundaries
- avoids secret/PII leakage
- avoids unsafe injection/SSRF/file/webhook patterns
- includes tests for security-sensitive behavior
- documents exceptions such as raw SQL, destructive migrations, or accepted dependency risks
