# Example Mapping: TypeScript AI Engineering Baseline 0.1.0

> **Spec Kit removed (ADR-0021):** Spec Kit, its OpenCode integration, and the reusable Spec Kit
> bundle are no longer part of the baseline. FR-013 and SC-005 to SC-007 are withdrawn. Passages
> below that describe Spec Kit components, the bundle, or `specKitVersion` are historical.

**Date**: 2026-09-10

**Participants**: Human baseline owner; AI engineering collaborator

**Status**: Ready for Gate 1 review

## Story

Upgrade the reusable TypeScript engineering baseline so AI coding sessions preserve intent,
agree behavior and system boundaries before implementation, use test-first feedback, and leave
deterministic evidence that the delivered result matches the approved specification.

## Rules and Examples

### Rule 1: Delivery ceremony is proportional to risk

- Full: A public API change runs the complete specification, BDD, contract, two-gate, TDD, and
  convergence process.
- Standard: An internal defect receives a concise spec amendment and a failing regression test;
  Gherkin is added only when observable behavior changes.
- Lightweight: A spelling correction or behavior-preserving rename records intent but creates no
  artificial acceptance scenario or external contract.

### Rule 2: The specification owns intent

- A changed requirement is edited in the living spec before its scenario, contract, plan, task, or
  implementation is reconciled.
- Architectural rationale discovered during planning is preserved in an ADR rather than making a
  derived task list authoritative.

### Rule 3: Human approval prevents premature implementation

- Gate 1 blocks planning until the human accepts scope, requirements, non-goals, success criteria,
  and executable examples.
- Gate 2 blocks implementation until the human accepts the plan and every applicable external
  contract.
- A rejected gate returns to the artifact that owns the issue.

### Rule 4: Cucumber and Vitest serve different feedback loops

- A Cucumber scenario expresses a business-visible outcome at the application or API boundary.
- Vitest tests guide a small policy, validator, serializer, adapter, or use case through RED,
  GREEN, and REFACTOR.
- A unit test does not repeat an entire acceptance flow only to increase test count.

### Rule 5: Traceability is complete and deterministic

- Every Full-lane FR identifier appears on at least one ready Gherkin scenario.
- A dangling tag, duplicate identifier, missing success evidence, unresolved clarification, or
  invalid completed wip scenario fails validation.
- A generated report links requirements to scenarios, contracts, checks, and success criteria
  without editing its sources.

### Rule 6: Contracts precede independently developed sides

- An OpenAPI operation is approved and can produce a mock and client before its provider route or
  consumer integration is implemented.
- AsyncAPI messages, GraphQL schema fields and consumer operations, and Protobuf services follow
  their profile-specific compatibility rules.
- A manifest selector that no longer resolves makes the feature stale and fails validation.

### Rule 7: The baseline is distributable executable policy

- A fresh TypeScript project receives the same preset, verifier, workflow, and agent commands from
  one pinned bundle.
- A brownfield install preserves unrelated files and existing skills.
- Repeating bundle lifecycle operations produces the same final state.

### Rule 8: Stability is earned

- The first complete bundle is 0.1.0.
- Version 1.0.0 remains blocked until clean checkout, profile fixtures, fresh and brownfield
  adoption, REST migration parity, CI, and human-gate acceptance all pass.

## Questions

No unresolved product or workflow questions remain. The user explicitly confirmed BDD/TDD
separation, complete day-one traceability, executable Spec Kit components, proportional delivery
lanes, two human gates, and the 0.1.0 dogfood policy.

## Deferred Design Decisions

Exact dependency versions, generator configuration, manifest schema encoding, and workflow
component file formats belong in the implementation plan and contract gate. They must preserve the
rules and acceptance examples above.
