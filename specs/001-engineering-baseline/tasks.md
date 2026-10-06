---
description: "Dependency-ordered implementation tasks for the TypeScript engineering baseline"
---

# Tasks: TypeScript AI Engineering Baseline 0.1.0

> **Spec Kit removed (ADR-0021):** Spec Kit, its OpenCode integration, and the reusable Spec Kit
> bundle are no longer part of the baseline. FR-013 and SC-005 to SC-007 are withdrawn. Passages
> below that describe Spec Kit components, the bundle, or `specKitVersion` are historical.

**Input**: Design artifacts in `specs/001-engineering-baseline/`

**Prerequisites**: Gate 1 and Gate 2 are approved for the recorded artifact digests. The feature is
classified as Full. Contracts and tests precede implementation within every behavior slice.

**Test policy**: Cucumber is the outer executable behavior loop. Vitest is the inner
RED -> GREEN -> REFACTOR loop. Tests are mandatory, must be observed failing for the intended
reason before implementation, and must avoid duplicating full acceptance assertions.

**Implementation status**: Complete for the 0.1.0 dogfood baseline. The implementation and
verification commands listed below have been executed successfully; the generated task checkboxes
are retained as the original dependency-ordered record.

## Format

`[ID] [P?] [Story] Description with exact path and traceability identifiers`

- **[P]**: May run in parallel because it edits disjoint files and has no unmet dependency.
- **[Story]**: Maps the task to a user story from `spec.md`.
- Every implementation task names the FR/SC identifiers it advances.

## Phase 1: Approved Foundations and Project Setup

**Purpose**: Preserve the approved gates and establish deterministic, pinned project entry points.

- [X] T001 Record the approved Gate 1 and Gate 2 decisions and reviewed digests in `specs/001-engineering-baseline/checklists/gate-1.md` and `specs/001-engineering-baseline/checklists/gate-2.md` (FR-003, FR-004, SC-011)
- [X] T002 [P] Author the pre-implementation schemas, users OpenAPI source, manifest, and Redocly parity policy in `specs/001-engineering-baseline/contracts/`, `contracts/openapi/baseline-api.yaml`, `specs/001-engineering-baseline/contracts/engineering-baseline.contracts.yaml`, and `redocly.yaml` (FR-010, FR-017, SC-008)
- [ ] T003 Add exact baseline dependency pins and fixed script entry points in `package.json` and `pnpm-lock.yaml`, retaining deprecated `openapi:*` aliases for 0.1.x (FR-005, FR-011, FR-012, FR-014, FR-016)
- [ ] T004 [P] Add checked-in baseline, Cucumber, Orval, GraphQL, AsyncAPI, and Buf configuration in `engineering-baseline.config.json`, `cucumber.mjs`, `orval.config.ts`, `.graphqlrc.yml`, `asyncapi.config.mjs`, and `buf.yaml` (FR-005, FR-011, FR-012, FR-017)
- [ ] T005 [P] Add deterministic generated/report/cache exclusions without hiding authoritative artifacts in `.gitignore`, `.prettierignore`, and `.npmignore` (SC-001)

---

## Phase 2: Foundational Validator and Fixture Infrastructure

**Purpose**: Create the pure, deterministic primitives that block every user-story implementation.

**Critical**: No user-story implementation begins until these tasks pass.

- [ ] T006 Write failing Vitest tests for sorted diagnostics, stable hashing, YAML/frontmatter loading, and path normalization in `tooling/engineering-baseline/src/core/core.test.ts` (FR-008, FR-014, SC-001, SC-003)
- [ ] T007 Implement typed diagnostic, hashing, loading, command-result, and filesystem primitives in `tooling/engineering-baseline/src/core/` and make T006 green (FR-008, FR-014, SC-001)
- [ ] T008 [P] Create valid and invalid specification, traceability, contract-profile, generated-drift, and bundle lifecycle fixture roots under `tooling/engineering-baseline/fixtures/` (SC-003, SC-004, SC-005, SC-006, SC-007)
- [ ] T009 Write failing schema/model tests for feature metadata, requirements, criteria, manifests, evidence, configuration, and traceability records in `tooling/engineering-baseline/src/model/model.test.ts` (FR-007, FR-009, FR-010, FR-011)
- [ ] T010 Implement strict runtime schemas and TypeScript model types in `tooling/engineering-baseline/src/model/` and make T009 green (FR-007, FR-009, FR-010, FR-011)
- [ ] T011 Add a deterministic command harness and focused process tests in `tooling/engineering-baseline/src/core/command.ts` and `tooling/engineering-baseline/src/core/command.test.ts`, restricting callers to enumerated fixed repository scripts (FR-014)

**Checkpoint**: Pure validation and fixture infrastructure is available without network access.

---

## Phase 3: User Story 1 - Approve Intent Before Implementation (Priority: P1) MVP

**Goal**: Full-lane execution cannot pass either pre-implementation boundary without current human
approval.

**Independent Test**: Run the approval-workflow feature and gate validator fixtures; planning and
implementation remain blocked until current Gate 1 and Gate 2 records are approved.

### Tests for User Story 1

- [ ] T012 [US1] Enable the approved Gate 1 scenarios as the outer failing slice in `specs/001-engineering-baseline/acceptance/approval-workflow.feature` and record the intended Cucumber RED result in `specs/001-engineering-baseline/verification.yaml` (FR-003, SC-011)
- [ ] T013 [P] [US1] Write failing Vitest fixtures for absent, rejected, and stale Gate 1/Gate 2 records in `tooling/engineering-baseline/src/specification/gates.test.ts` (FR-003, FR-004, FR-008, SC-003, SC-011)

### Implementation for User Story 1

- [ ] T014 [US1] Implement artifact-set hashing and Gate 1/Gate 2 state validation in `tooling/engineering-baseline/src/specification/gates.ts` and make T013 green (FR-003, FR-004, FR-008, SC-011)
- [ ] T015 [US1] Implement isolated Cucumber World state, hooks, and approval workflow glue in `tests/acceptance/world.ts`, `tests/acceptance/hooks.ts`, and `tests/acceptance/steps/approval.steps.ts`, then make T012 green (FR-003, FR-004, FR-005, SC-011)
- [ ] T016 [US1] Add literal gate verification entry points in `scripts/engineering-baseline/verify.mjs` and record the final focused Vitest/Cucumber commands in `specs/001-engineering-baseline/verification.yaml` (FR-003, FR-004, FR-014, SC-011)

**Checkpoint**: Both approval gates are executable, digest-aware, and independently testable.

---

## Phase 4: User Story 2 - Executable Behavior and Complete Traceability (Priority: P1)

**Goal**: Requirements, examples, inner-loop tests/checks, contracts, and success evidence are
validated and joined into one deterministic report.

**Independent Test**: Run every validator fixture, generate the report twice byte-for-byte, and run
the four isolated users capability scenarios.

### Tests for User Story 2

- [ ] T017 [US2] Enable the approved behavior/traceability and users behavior scenarios as failing outer slices in `specs/001-engineering-baseline/acceptance/behavior-and-traceability.feature` and `specs/001-engineering-baseline/acceptance/users-api.feature`, recording Cucumber RED evidence in `specs/001-engineering-baseline/verification.yaml` (FR-005, FR-007, FR-008, FR-009, SC-002, SC-010)
- [ ] T018 [P] [US2] Write failing Vitest pass/fail fixtures for duplicate IDs, dangling tags, missing Full-lane scenarios, unresolved clarification markers, invalid completed `@wip`, and missing success evidence in `tooling/engineering-baseline/src/specification/specification.test.ts` (FR-007, FR-008, SC-003, SC-009)
- [ ] T019 [P] [US2] Write failing Vitest tests for requirement-to-scenario-to-contract-to-check-to-criterion report generation and drift detection in `tooling/engineering-baseline/src/traceability/traceability.test.ts` (FR-009, SC-001, SC-002, SC-003)

### Implementation for User Story 2

- [ ] T020 [US2] Implement specification, Gherkin tag/status, clarification, and success-evidence validators in `tooling/engineering-baseline/src/specification/` and make T018 green (FR-002, FR-007, FR-008, SC-003, SC-009)
- [ ] T021 [US2] Implement stable traceability graph generation and read-only drift checking in `tooling/engineering-baseline/src/traceability/`, generating `specs/001-engineering-baseline/traceability.json`, and make T019 green (FR-009, SC-001, SC-002)
- [ ] T022 [US2] Implement users API acceptance glue with a fresh in-memory application per scenario in `tests/acceptance/steps/users.steps.ts` and make successful creation, invalid input, duplicate email, and tenant-visible listing scenarios green (FR-005, SC-010)
- [ ] T023 [US2] Add strict, zero-retry dry and execution profiles plus failure-only report output in `cucumber.mjs` and fixed `test:bdd:dry`/`test:bdd` scripts in `package.json` (FR-005, FR-016, SC-009, SC-010)
- [ ] T024 [US2] Record meaningful inner-loop RED causes and final passing commands, without duplicating acceptance assertions, in `specs/001-engineering-baseline/verification.yaml` and `.github/pull_request_template.md` (FR-006)

**Checkpoint**: All Full-lane requirements and success criteria are traceable and the outer/inner
loops are independently executable.

---

## Phase 5: User Story 3 - Contract-First System Interfaces (Priority: P1)

**Goal**: Every selected contract profile validates, generates, classifies compatibility, and
verifies provider boundaries from an authoritative contract before implementation acceptance.

**Independent Test**: Run the four profile matrices; compatible fixtures pass, breaking fixtures
fail for the intended reason, inactive profiles do not execute, and the migrated users API retains
semantic and public-export parity.

### Tests for User Story 3

- [ ] T025 [US3] Enable the approved contract-first scenarios as failing outer slices in `specs/001-engineering-baseline/acceptance/contract-first.feature`, recording Cucumber RED evidence in `specs/001-engineering-baseline/verification.yaml` (FR-010, FR-011, FR-012, SC-004)
- [ ] T026 [P] [US3] Write failing manifest tests for missing/stale artifacts, bad digests, unresolved operations/messages/fields/types/RPCs, owners, compatibility, migration, and deprecation metadata in `tooling/engineering-baseline/src/contracts/manifest.test.ts` (FR-008, FR-010, SC-003)
- [ ] T027 [P] [US3] Add compatible and intentional-breaking OpenAPI, AsyncAPI, GraphQL, and Protobuf fixtures under `tooling/engineering-baseline/fixtures/contracts/` with failing profile-matrix tests in `tooling/engineering-baseline/src/contracts/profiles.test.ts` (FR-011, FR-012, SC-004)
- [ ] T028 [P] [US3] Capture current published OpenAPI semantics and `src/index.ts` declaration exports as parity fixtures, then write failing migration-parity tests in `tooling/engineering-baseline/src/contracts/openapi-parity.test.ts` (FR-017, SC-008)

### Implementation for User Story 3

- [ ] T029 [US3] Implement manifest digest, metadata, and profile-aware selector validation in `tooling/engineering-baseline/src/contracts/manifest.ts` and make T026 green (FR-008, FR-010, SC-003)
- [ ] T030 [US3] Implement enabled-profile selection and pinned OpenAPI lint/generation/compatibility/conformance adapters in `tooling/engineering-baseline/src/contracts/openapi.ts` and `scripts/engineering-baseline/contracts.mjs` (FR-011, FR-012, SC-004)
- [ ] T031 [P] [US3] Implement pinned AsyncAPI validation/generation/compatibility adapters in `tooling/engineering-baseline/src/contracts/asyncapi.ts` (FR-011, FR-012, SC-004)
- [ ] T032 [P] [US3] Implement pinned GraphQL lint/codegen/consumer-operation/compatibility adapters in `tooling/engineering-baseline/src/contracts/graphql.ts` (FR-011, FR-012, SC-004)
- [ ] T033 [P] [US3] Implement pinned Buf lint/generation/breaking adapters and reserved-field enforcement in `tooling/engineering-baseline/src/contracts/proto.ts` (FR-011, FR-012, SC-004)
- [ ] T034 [US3] Add canonical `contracts:lint`, `contracts:generate`, `contracts:check-generated`, `contracts:breaking`, `contracts:test`, and `contracts:check` scripts plus 0.1.x `openapi:*` aliases in `package.json` and make T027 green (FR-011, FR-012, SC-004)
- [ ] T035 [US3] Configure OpenAPI-authoritative Orval generation and check in published YAML/JSON, TypeScript request/response types, Zod boundary schemas, client functions, and MSW mocks under `docs/openapi/` and `src/generated/openapi/` (FR-012, FR-017, SC-001, SC-008)
- [ ] T036 [US3] Replace users route/schema dependencies on code-first OpenAPI metadata with generated-contract compatibility facades in `src/modules/users/` and `src/index.ts`, then make T028 and existing users tests green (FR-017, SC-008)
- [ ] T037 [US3] Remove the superseded code-first OpenAPI generator and metadata only after semantic, generated, runtime, and public-export parity are green in `scripts/generate-openapi.ts`, `src/openapi.ts`, and `src/modules/users/user.openapi.ts` (FR-017, SC-008)
- [ ] T038 [US3] Implement provider conformance tests and contract-first Cucumber glue in `tests/contracts/` and `tests/acceptance/steps/contracts.steps.ts`, then make T025 green (FR-010, FR-012, FR-017, SC-004, SC-008)

**Checkpoint**: All four selectable profiles and the users REST migration are contract-first and
deterministically verified.

---

## Phase 6: User Story 4 - Reusable Spec Kit Baseline (Priority: P2)

**Goal**: The complete methodology is installable as a pinned, integration-agnostic Spec Kit 1.0.5
bundle and survives fresh/brownfield lifecycle operations.

**Independent Test**: Validate/build the bundle, install into fresh Codex and Copilot fixtures,
prove brownfield preservation, and run install/update/remove/reinstall twice without drift.

### Tests for User Story 4

- [ ] T039 [US4] Enable the approved bundle-adoption scenarios as failing outer slices in `specs/001-engineering-baseline/acceptance/bundle-adoption.feature`, recording Cucumber RED evidence in `specs/001-engineering-baseline/verification.yaml` (FR-013, FR-018, SC-005, SC-006, SC-007)
- [ ] T040 [P] [US4] Write failing structural tests for component versions, required templates/sections, fixed-shell security, hook registration, workflow stages/branches, and Spec Kit 1.0.5 compatibility in `tooling/engineering-baseline/src/bundle/components.test.ts` (FR-002, FR-013, FR-014)
- [ ] T041 [P] [US4] Write failing fresh Codex/Copilot, brownfield preservation, build, update, remove, reinstall, and second-run idempotency tests in `tooling/engineering-baseline/src/bundle/lifecycle.test.ts` (FR-013, FR-018, SC-005, SC-006, SC-007)

### Implementation for User Story 4

- [ ] T042 [US4] Implement the `typescript-baseline-sdd` 0.1.0 preset with Full, Standard, Lightweight templates, stable IDs, mandatory sections, contract/test-first task order, and living-spec reconciliation in `tooling/spec-kit/typescript-engineering-baseline/presets/typescript-baseline-sdd/` (FR-001, FR-002, FR-006, FR-007, FR-013)
- [ ] T043 [US4] Implement the `engineering-baseline-verify` 0.1.0 extension, command, fixed script, and mandatory before/after implementation hooks in `tooling/spec-kit/typescript-engineering-baseline/extensions/engineering-baseline-verify/` (FR-008, FR-009, FR-013, FR-014)
- [ ] T044 [US4] Implement the `typescript-delivery` 0.1.0 workflow with classify through converge stages, explicit lane branches, Gate 1/Gate 2 verdicts, and literal fixed shell commands in `tooling/spec-kit/typescript-engineering-baseline/workflows/typescript-delivery/workflow.yml` (FR-001, FR-003, FR-004, FR-013, FR-014, SC-011)
- [ ] T045 [US4] Implement the integration-agnostic 0.1.0 bundle manifest with exact owned-component pins and Spec Kit 1.0.5 requirement in `tooling/spec-kit/typescript-engineering-baseline/bundle.yml` (FR-013, FR-018, SC-012)
- [ ] T046 [US4] Implement deterministic local validate/build/install/update/remove/reinstall helpers in `tooling/engineering-baseline/src/bundle/` and fixed `scripts/engineering-baseline/bundle.mjs`, then make T040 and T041 green (FR-013, FR-014, FR-018, SC-005, SC-006, SC-007)
- [ ] T047 [US4] Implement bundle lifecycle Cucumber glue in `tests/acceptance/steps/bundle.steps.ts` and make T039 green (FR-013, FR-018, SC-005, SC-006, SC-007)

**Checkpoint**: The 0.1.0 baseline can be installed safely into supported TypeScript projects.

---

## Phase 7: User Story 5 - Proportional Delivery Lanes (Priority: P2)

**Goal**: Full, Standard, and Lightweight changes receive exactly the artifacts and checks their
risk and behavior require.

**Independent Test**: Classify representative changes, verify deterministic lane decisions, and
exercise each workflow branch's required and omitted stages.

### Tests for User Story 5

- [ ] T048 [US5] Enable the approved delivery-classification scenarios as failing outer slices in `specs/001-engineering-baseline/acceptance/delivery-classification.feature`, recording Cucumber RED evidence in `specs/001-engineering-baseline/verification.yaml` (FR-001)
- [ ] T049 [P] [US5] Write failing table-driven classification and artifact-policy tests in `tooling/engineering-baseline/src/specification/classification.test.ts` (FR-001, FR-002)

### Implementation for User Story 5

- [ ] T050 [US5] Implement deterministic Full/Standard/Lightweight classification and required-artifact policy in `tooling/engineering-baseline/src/specification/classification.ts` and make T049 green (FR-001, FR-002)
- [ ] T051 [US5] Implement classification Cucumber glue in `tests/acceptance/steps/classification.steps.ts`, verify every preset/workflow lane against the same policy, and make T048 green (FR-001, FR-013)

**Checkpoint**: The complete process is enforced proportionally rather than universally.

---

## Phase 8: Governance, CI, Release Evidence, and Convergence

**Purpose**: Route humans and agents through the executable baseline and prove the dogfood release
criteria from a clean checkout.

- [ ] T052 [P] Add ADR-0018 and ADR-0019 and mark ADR-0013 superseded without rewriting its historical decision in `docs/decisions/` (FR-015)
- [ ] T053 [P] Add focused `spec-driven-development`, `behavior-driven-development`, and `contract-first` skills and extend the relevant existing skills under `.agents/skills/` (FR-015)
- [ ] T054 [P] Update `README.md`, testing/API/product-delivery/engineering documentation, `.github/copilot-instructions.md`, `.github/pull_request_template.md`, and `.github/CODEOWNERS` with lane, gate, traceability, contract, TDD, generation, migration, and ownership guidance (FR-006, FR-015)
- [ ] T055 Reorder `.github/workflows/ci.yml` to run component/spec, traceability, contracts, static checks, Vitest, Cucumber dry/ready, provider conformance, Playwright, build, secret scan, and audit gates, with Cucumber reports uploaded only on failure (FR-016)
- [ ] T056 Implement the aggregate fixed `pnpm baseline:check` and release-readiness/clean-checkout verification in `scripts/engineering-baseline/verify.mjs`, `scripts/engineering-baseline/clean-checkout.mjs`, and `tooling/engineering-baseline/src/release/` (FR-014, FR-016, FR-018, SC-001, SC-012)
- [ ] T057 Run formatting, lint, typecheck, Vitest, Cucumber dry/ready, all contract checks, provider conformance, applicable Playwright, build, secret scan, audit, bundle lifecycle, migration parity, generated-drift, and `pnpm baseline:check`; record commands/results in `specs/001-engineering-baseline/verification.yaml` (FR-016, FR-018, SC-001 through SC-012)
- [X] T058 Run Spec Kit analyze and converge, append and complete any uncovered tasks in `specs/001-engineering-baseline/tasks.md`, and confirm no requirement, criterion, scenario, contract element, or verification evidence remains unaccounted for (FR-002, FR-007, FR-009, FR-018, SC-002, SC-012)

---

## Dependencies and Execution Order

### Phase Dependencies

- Phase 1 contains the approved inputs and deterministic project setup.
- Phase 2 depends on Phase 1 and blocks every user story.
- User Story 1 depends on Phase 2 and establishes executable gate enforcement.
- User Story 2 depends on User Story 1 so traceability can include current approvals.
- User Story 3 depends on User Story 2's model/report primitives and the Gate 2 contracts.
- User Story 4 depends on the fixed validators and contract commands it packages.
- User Story 5 depends on the preset/workflow skeleton and validates proportional branches.
- Phase 8 depends on all five user stories and produces release evidence.

### Within Every Behavior Slice

1. Preserve or author the applicable contract and manifest.
2. Enable an approved Gherkin scenario and observe the outer RED result.
3. Add one focused Vitest test and observe the intended RED result.
4. Implement the minimum behavior to make the focused test green.
5. Refactor with Vitest green, then make the outer scenario green.
6. Run contract generation/conformance and deterministic verification.
7. Record RED cause and final passing commands in `verification.yaml`.

### Parallel Opportunities

- Tasks marked `[P]` edit disjoint files and may run concurrently after their phase prerequisites.
- Fixture construction for independent contract profiles may proceed concurrently.
- Documentation and focused skill edits may proceed concurrently after behavior is stable.
- Parallel work never bypasses Gate 1, Gate 2, contract-first ordering, or the RED observation.

## Implementation Strategy

The minimal independently demonstrable increment is User Story 1 after Setup and Foundational
work. The locked scope, however, is the complete 0.1.0 architecture: implementation continues
through all five stories, governance, clean-checkout verification, and convergence. Final PR/merge
approval remains human-controlled, and stable 1.0.0 remains out of scope.
