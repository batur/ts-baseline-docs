<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Added principles: Living Specifications; Behavior-Driven Acceptance; Test-Driven
  Implementation; Contract-First Boundaries; Traceability and Human Approval
- Added sections: Delivery Classification; Development Workflow
- Removed sections: none
- Deferred TODOs: none
-->

# TypeScript Engineering Baseline Constitution

## Core Principles

### I. Living Specifications Are the Source of Intent

Every non-editorial change MUST be classified and described by the applicable Spec Kit
artifact before implementation. `spec.md` is the authoritative statement of scope,
requirements, non-goals, and success criteria. When intent changes, contributors MUST update
`spec.md` first and then reconcile Gherkin, contracts, plans, and tasks. Plans and tasks are
derived artifacts; durable architectural rationale belongs in ADRs.

### II. Behavior-Driven Acceptance

Changes to externally observable behavior MUST use collaborative examples to establish shared
understanding before implementation. Full-lane requirements MUST be expressed as declarative,
business-readable Gherkin and automated with Cucumber at the lowest stable observable boundary.
Cucumber is the outer acceptance loop. Scenarios MUST be independent, MUST avoid implementation
details, and MUST assert outcomes visible to a user or external system.

### III. Test-Driven Implementation (NON-NEGOTIABLE)

Implementation behavior MUST be developed through short Vitest RED -> GREEN -> REFACTOR cycles.
The failing test MUST be observed to fail for the intended reason before production code is
written. Unit and integration tests MUST protect policies, validation, use cases, serializers,
adapters, and failure paths without duplicating complete Cucumber scenarios. CI proves the final
green state; the PR records the meaningful red-test evidence.

### IV. Contract-First External Boundaries

Every interface between independently deployed, released, or owned systems MUST have an approved
authoritative contract before any provider or consumer implementation begins. OpenAPI, AsyncAPI,
GraphQL SDL, or Protobuf is selected according to the protocol. Contract linting, deterministic
generation, compatibility analysis, mocks, and conformance tests MUST run for each active profile.
Ordinary in-process TypeScript interfaces do not require external contract artifacts.

### V. Traceability and Human Approval

Specifications MUST use unique `FR-###` and `SC-###` identifiers. Each full-lane functional
requirement MUST be referenced by at least one ready Gherkin scenario through an `@FR-###` tag.
Contract manifests MUST map affected elements to requirement IDs, owners, compatibility, and
migration or deprecation metadata. Implementation MUST pause for human approval after the
specification and behavior package, and again after the plan and applicable contracts. Final PR
and merge approval always remain human-controlled.

## Delivery Classification

- **Full**: Required for user-visible behavior, security or authorization behavior, persistence
  semantics, or an external interface change. The complete specification, BDD, TDD, contract,
  approval, analysis, and convergence workflow applies.
- **Standard**: Used for defects or internal behavior change without an external boundary. A
  concise living-spec amendment and TDD regression are mandatory. Gherkin is mandatory when an
  externally observable rule changes.
- **Lightweight**: Used for editorial work, maintenance, or demonstrably behavior-preserving
  refactoring. Intent and invariants are recorded, but artificial Gherkin and contracts MUST NOT
  be created.

The baseline targets strict ESM TypeScript projects using Node.js and pnpm. Active contract
profiles are selectable; inactive profiles MUST NOT add runtime or CI dependencies. Validation,
tests, generators, and workflow shell steps MUST be deterministic. Workflow shell steps MUST call
fixed repository scripts and MUST NOT interpolate user or agent-generated text.

## Development Workflow

The full workflow is:

`classify -> specify -> clarify/example-map -> formulate Gherkin -> verify -> Gate 1 -> plan and
contracts -> verify -> Gate 2 -> tasks -> analyze -> Cucumber RED -> Vitest RED/GREEN/REFACTOR ->
contract and acceptance verification -> converge`

Gate 1 approves the specification, Example Mapping results, and executable behavior. Gate 2
approves the implementation plan and every applicable contract. Rejected gates return work to the
artifact that owns the problem. No implementation command may bypass either applicable gate.

CI MUST validate skill, Spec Kit, specification, traceability, and contract artifacts before
formatting, linting, typechecking, Vitest, Cucumber, provider conformance, Playwright, build,
secret scanning, and dependency audit checks.

## Governance

This constitution is the highest-level project governance document. Accepted ADRs and current
standards MUST comply with it. Amendments require documented rationale, human approval, and a
migration plan. Constitution versions follow semantic versioning: MAJOR for incompatible
governance changes, MINOR for new or materially expanded principles, and PATCH for clarifications.

Every PR MUST declare its delivery lane and demonstrate applicable compliance. Reviewers MUST
reject missing traceability, bypassed gates, stale contracts, unverified behavior, or unexplained
exceptions. The `0.x` bundle line is dogfood quality; `1.0.0` requires the documented fresh,
brownfield, profile, migration-parity, CI, and clean-checkout acceptance criteria.

**Version**: 1.0.0 | **Ratified**: 2026-09-10 | **Last Amended**: 2026-09-10
