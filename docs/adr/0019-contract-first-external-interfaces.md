# ADR-0019: Define external interfaces contract-first

Status: Accepted
Date: 2026-09-10

## Context

Independently deployed, released, or owned providers and consumers need a shared interface before
either side implements. Code-first documentation makes the provider implementation the accidental
coordination point and cannot reliably describe compatibility, ownership, or migration intent.

## Decision

Use an authoritative protocol contract for external boundaries: OpenAPI 3.1.x for REST/HTTP,
AsyncAPI 3.x for events, GraphQL SDL plus checked-in consumer operations, and versioned Protobuf for
gRPC. Every contract-changing feature carries a machine-readable manifest with affected selectors,
`FR-###` links, owners, compatibility classification, migration/rollout data, and deprecation/removal
metadata. Only active profiles install and execute their pinned tool groups. Pact may complement,
but never replace, the authoritative schema.

This supersedes ADR-0013's code-first default for independently deployed, released, or owned REST
interfaces. In-process TypeScript interfaces do not require protocol contracts.

## Consequences

Providers and consumers can work against a reviewed boundary and CI can reject stale selectors,
generated drift, and breaking changes. Generators become part of the toolchain and must be pinned.
Small internal changes may select no profile. Migration from code-first requires semantic, runtime,
and public-export parity before retiring the old generator.

## Alternatives considered

- Code-first for every REST API: retained only where no independent boundary exists.
- Consumer tests as the only contract: rejected because they do not provide a complete source of truth.
- TypeScript interfaces for all boundaries: rejected because they cannot govern non-TypeScript systems.

## Follow-up work

- Maintain compatible/breaking fixtures for every profile.
- Prefer additive changes and require coordinated migration for breaking changes.
- Never reuse Protobuf field numbers; reserve removed names and numbers.
