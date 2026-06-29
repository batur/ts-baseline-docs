# ADR-0016: Documentation and ADR Standard

## Status

Accepted.

## Context

Humans and AI coding assistants need clear project documentation, decision records and architecture rules.

## Decision

Documentation lives in the repository. Root README is onboarding entry point. Detailed docs live under `docs/`. ADRs live under `docs/adr/`. ADR files use sequential numbering and kebab-case titles. ADR numbers are never reused.

ADR statuses are Proposed, Accepted, Deprecated, Superseded and Rejected. Accepted ADRs preserve history; new decisions supersede old ADRs.

Mermaid is the default diagram format. Diagram source is text and is the source of truth.

`.github/copilot-instructions.md` is required and contains AI coding assistant rules.

Docs are updated in the same PR when behavior, architecture, API, environment variables, DB schema, security behavior or deployment process changes.

If docs conflict with ADRs, the newest accepted ADR wins.

## Consequences

Decision history is traceable and onboarding is easier for both humans and AI assistants.
