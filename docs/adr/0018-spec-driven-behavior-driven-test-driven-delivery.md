# ADR-0018: Use spec-driven, behavior-driven, and test-driven delivery

Status: Accepted
Date: 2026-09-10

## Context

AI coding sessions can produce implementation before scope, intent, examples, and verification are
durable. Unit tests alone do not provide a stakeholder-readable acceptance boundary, while a large
acceptance suite is too slow and coarse to guide implementation design.

## Decision

Use Spec Kit 1.0.5 for living scope and intent. Use Cucumber/Gherkin as the outer executable
acceptance loop following Discovery, Formulation, and Automation. Use Vitest as the inner
RED -> GREEN -> REFACTOR loop. Full changes require stable `FR-###`/`SC-###` traceability and two
human gates: specification/behavior before planning, then plan/applicable contracts before
implementation. Standard and Lightweight lanes apply the same principles proportionally.

## Consequences

Intent and observable behavior become reviewable before code. Fast tests still shape internal
design without duplicating complete Cucumber assertions. Contributors must maintain identifiers,
evidence, gate records, and generated traceability; Full work has more deliberate ceremony.

## Alternatives considered

- Prompt-to-code plus unit tests: rejected because intent and approval disappear with the session.
- Cucumber for all test levels: rejected because it duplicates assertions and weakens the fast TDD loop.
- One mandatory heavyweight lane: rejected because artificial artifacts encourage bypasses.

## Follow-up work

- Keep the `typescript-engineering-baseline` bundle at 0.1.0 until its acceptance matrix passes.
- Upgrade Spec Kit or the testing toolchain only through reviewed compatibility changes.
