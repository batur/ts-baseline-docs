# Security Standard

## Principle

Projects are secure by default. External input is untrusted until validated. Authorization is enforced server-side.

## Input Validation

- All external input is validated at the boundary with Zod.
- Public API schemas use `.strict()` by default.
- Unknown fields are rejected.

## Authentication

- Authentication is centralized in guards/middleware/provider adapters.
- Application code receives normalized `AuthContext`, not raw tokens or provider-specific session objects.
- Provider SDKs do not enter business logic.

## Authorization

- Server-side authorization is mandatory.
- Client-side permission checks are UX helpers only.
- Permission format: `resource:action`.
- Business-sensitive use-cases must enforce permission checks.

## Tenant Boundary

- Tenant-scoped resource queries require `organizationId` or `tenantId`.
- Cross-tenant access may return `404` to avoid resource enumeration.

## Secrets

- Secrets are never committed.
- Secrets are never logged.
- Secrets are never exposed to client bundles.
- `process.env` is read only inside config/env modules.
- Any `*_SECRET`, `*_TOKEN`, `*_KEY` value is sensitive by default.

## CORS

- Production CORS is allowlist-based.
- `credentials: true` cannot be combined with wildcard origin.

## Security Headers

Default backend/web apps should enable relevant security headers:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `X-Frame-Options` or CSP `frame-ancestors`
- `Content-Security-Policy`, especially for web apps
- `Strict-Transport-Security`, in production HTTPS

## Rate Limiting

Rate limiting must be available for public/expensive endpoints such as login, signup, OTP, password reset, AI generation and expensive searches.

## Injection Prevention

- Do not build SQL, shell commands, HTML or URLs with untrusted string concatenation.
- Raw SQL must be parameterized.
- Shell commands must use argument arrays, not interpolated strings.
- `dangerouslySetInnerHTML` requires security review.

## SSRF Prevention

User-provided URLs must not be fetched without allowlist and network safety checks.

Minimum checks:

- allow `https` only when possible
- block localhost/internal IP ranges
- block cloud metadata IPs
- check redirect chain
- set timeout
- set max response size

## File Uploads

File uploads are untrusted. Validate size, MIME type, extension and path. Use random server-side filenames.

## Webhooks

Webhook payloads must be signature-verified before processing. Replay protection and idempotency should be used.

## Logging and PII

Sensitive data is excluded by design, not merely redacted after logging. Do not log raw request bodies, tokens, secrets, authorization headers, cookies or provider raw responses.

## Dependency Security

- Commit lockfile.
- Run dependency audit in CI.
- Document accepted exceptions.

## AI-Generated Code

AI-generated code is untrusted until reviewed. It must pass review, tests and security checks before merge.
