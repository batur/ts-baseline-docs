## Summary

## Why

## Delivery evidence

- Lane: Full / Standard / Lightweight
- Feature spec: `specs/<feature>/spec.md` or lightweight intent record
- Requirement IDs: `FR-###`
- Success criteria: `SC-###`
- Gate 1 approval and current digest: N/A / linked evidence
- Gate 2 approval and current digest: N/A / linked evidence

## Behavior and TDD

- Acceptance scenarios changed: N/A / paths and scenario names
- Meaningful RED command:
- Intended RED failure and why it failed:
- Final passing command:
- Unit tests avoid duplicating complete acceptance assertions: Yes / explanation

## Contract impact

- Profiles: none / OpenAPI / AsyncAPI / GraphQL / gRPC
- Manifest: N/A / path
- Compatibility: N/A / additive / deprecation / breaking
- Provider and consumer owners:
- Migration strategy and deadline: N/A / details
- Deprecation and intended removal release: N/A / details
- Generated artifacts updated and drift-checked: N/A / Yes

## Verification

List the exact commands and results, including `pnpm baseline:check` for baseline-managed work.

## Risk / rollback

## Human review checklist

- [ ] Scope, non-goals, `FR-###`, and `SC-###` are current.
- [ ] Required Gate 1 and Gate 2 approvals match the reviewed artifact digests.
- [ ] Cucumber covers changed observable behavior and Vitest protects implementation behavior.
- [ ] Contract selectors resolve and compatibility/migration metadata is complete.
- [ ] Formatting, lint, typecheck, tests, and build pass.
- [ ] No secrets or sensitive data were added or logged.
- [ ] Database migrations, environment examples, and raw SQL were reviewed when applicable.
- [ ] Documentation and ADRs were updated when behavior or decisions changed.
- [ ] AI-generated changes received manual review.
- [ ] Final merge approval remains human-controlled.
