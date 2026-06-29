# ADR-0010: Security Baseline

## Status

Accepted.

## Context

Projects need a practical secure-by-default baseline.

## Decision

All external input is untrusted. Authentication is centralized. Authorization is enforced server-side. Tenant boundaries are enforced at use-case and data access levels.

Secrets are isolated, not logged, not committed and not exposed to client bundles. Production CORS is allowlist-based. Security headers are enabled by default where applicable. Public and expensive endpoints support rate limiting.

Unsafe string concatenation for SQL, shell commands, HTML or URLs is forbidden. User-provided URLs require SSRF protections. File uploads are untrusted. Webhooks require signature verification.

Dependencies are locked and audited. AI-generated code is reviewed, tested and security-scanned before acceptance.

## Consequences

Common security risks are addressed by default while allowing project-specific depth.
