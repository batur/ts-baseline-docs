---
schemaVersion: 1
feature: "[feature-name]"
lane: "[full|standard|lightweight]"
status: draft
contractProfiles: []
---

# Feature Specification: [Title]

Use the lane-specific template selected by `speckit.classify`. Update this living specification
before reconciling examples, contracts, plans, tasks, or tests.

## Scope and Intent

## Requirements

Use stable, unique identifiers: `FR-001`, `FR-002`, and so on.

## Success Criteria

Use stable, unique identifiers: `SC-001`, `SC-002`, and so on. Each criterion declares automated
evidence or a justified manual measurement.

## Behavior

Record observable rules and examples. Full-lane requirements link to Gherkin with `@FR-###` tags.

## Contract Impact

State selected profiles and manifest paths, or justify why no independently owned boundary changes.

## Test Strategy

Define the Cucumber outer loop when applicable and the focused Vitest RED -> GREEN -> REFACTOR loop.

## Non-Goals

## Verification
