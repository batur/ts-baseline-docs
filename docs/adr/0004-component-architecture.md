# ADR-0004: Component Architecture

## Status

Accepted.

## Context

Projects need a modular architecture that avoids both technical-layer-only organization and unnecessary overengineering.

## Decision

Use component-based architecture organized by business capability/responsibility.

Backend business components live under `src/modules`. Frontend feature components live under `src/features`. Shared technical code lives under `src/shared`. Bootstrap/composition root lives under `src/app`.

Each component exposes public API through `index.ts`. Files not exported from `index.ts` are internal by default.

Dependency direction is presentation -> application -> domain. Infrastructure implements application/domain contracts. Shared code imports no business modules.

Start flat inside a component. Add domain/application/infrastructure/presentation folders only when complexity requires it.

## Consequences

Business capability boundaries become clear while avoiding empty architecture ceremony.
