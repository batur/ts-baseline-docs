# Implementation Plan: TypeScript AI Engineering Baseline 0.1.0

**Branch**: `feat/engineering-baseline-0.1.0` | **Date**: 2026-09-10 | **Spec**: [spec.md](spec.md)

**Input**: Approved Full-lane feature specification from
`specs/001-engineering-baseline/spec.md`. Gate 1 was approved on 2026-09-10.

## Summary

Build and dogfood an executable engineering baseline for strict ESM TypeScript projects. Living
specifications own intent; Cucumber is the outer executable acceptance loop;
Vitest is the inner RED -> GREEN -> REFACTOR loop; protocol-specific contracts are authoritative
for independently deployed, released, or owned boundaries; deterministic validators produce a
complete traceability report and enforce two human approvals.

The repository enables all four contract
profiles to validate the full architecture, while adopting projects install and execute only the
profiles selected in their checked-in baseline configuration.

## Technical Context

**Language/Version**: Node.js 22, strict ESM TypeScript 6.0.3, ES2022 target

**Primary Dependencies**: pnpm 11.9.0; Vitest 4.1.10; Cucumber-JS with
the existing tsx ESM loader; Zod 4.4.3; YAML 2.9.0; profile-specific Redocly, Orval, Prism,
oasdiff, AsyncAPI CLI/Modelina, GraphQL ESLint/Code Generator/Inspector, and Buf tooling pinned to
exact reviewed versions in `package.json` and `pnpm-lock.yaml`

**Storage**: Checked-in Markdown, Gherkin, YAML, JSON, GraphQL SDL, and Protobuf artifacts; no
runtime database is introduced

**Testing**: Vitest for validator, generator, profile, and parity tests;
Cucumber for acceptance behavior; provider conformance tests for active contracts; existing
Playwright command retained for applicable browser flows

**Target Platform**: Linux CI and developer environments capable of Node.js 22, pnpm, and Git

**Project Type**: Single TypeScript library/sample API plus reusable engineering tooling

**Performance Goals**: Deterministic validators and report generation complete without network
access and use linear scans over feature and contract artifacts; a normal repository validation
run remains suitable for a pre-implementation hook, while the complete CI matrix remains within
the existing 15-minute job budget or is split into bounded jobs

**Constraints**: No workflow shell command interpolates human or agent output; each shell step is
a literal invocation of a fixed repository script; generators are reproducible; a second
generation run leaves the worktree clean; tests never use production or staging services; public
API corrections discovered during migration are reported separately

**Scale/Scope**: One dogfood Full-lane feature, five acceptance feature files, four selectable
contract profiles, one migrated users REST API, three new focused skills, seven extended skills,
and two ADRs

## Constitution Check

*GATE: Passed before research and re-checked after design.*

| Principle | Design evidence | Result |
| --- | --- | --- |
| Living specifications | `spec.md` remains authoritative; generated/derived artifacts declare their sources and drift checks | PASS |
| Behavior-driven acceptance | Approved Gherkin stays under `acceptance/`; Cucumber executes ready scenarios with isolated Worlds | PASS |
| Test-driven implementation | Tasks must order Cucumber RED, focused Vitest RED, minimum implementation, GREEN, and refactor evidence | PASS |
| Contract-first boundaries | The users OpenAPI contract and manifest are prepared before provider/client migration; all profiles have compatibility fixtures | PASS |
| Traceability and approval | Stable FR/SC IDs, verification evidence, manifests, artifact digests, Gate 1 record, and Gate 2 record are required | PASS |
| Proportional delivery | Lane templates and validators preserve Full, Standard, and Lightweight branches without inventing Gherkin/contracts for inapplicable work | PASS |
| Deterministic execution | Workflow shell steps call only fixed scripts and never contain `{{ ... }}` interpolation | PASS |

No constitution violation requires a complexity exception.

## Project Structure

### Documentation and Design Artifacts

```text
specs/001-engineering-baseline/
├── spec.md
├── example-mapping.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── verification.yaml                 # created during implementation from planned evidence
├── acceptance/
│   └── *.feature
├── checklists/
│   ├── requirements.md
│   ├── gate-1.md
│   └── gate-2.md
└── contracts/
    ├── baseline-config.schema.json
    ├── contract-manifest.schema.json
    ├── traceability-report.schema.json
    └── engineering-baseline.contracts.yaml
```

### Authoritative Contracts and Generated Outputs

```text
contracts/
├── openapi/
│   └── baseline-api.yaml              # authoritative users REST contract
├── asyncapi/                           # authoritative event contracts when selected
├── graphql/                            # SDL and checked-in operations when selected
└── proto/                              # versioned .proto sources when selected

src/generated/openapi/                 # Orval-generated types, client functions, Zod, and MSW
docs/openapi/openapi.yaml               # published derivative
docs/openapi/openapi.json               # published derivative
redocly.yaml                            # recommended rules plus reviewed parity exceptions
```

### Baseline Runtime and Validators

```text
engineering-baseline.config.json       # selected profiles and fixed artifact locations
cucumber.mjs                           # strict default/dry-run/ready profiles; zero retries
scripts/engineering-baseline/
├── install.mjs                        # exact dependency groups selected from validated config
├── verify.mjs                         # deterministic aggregate entry point
├── contracts.mjs                      # fixed contract command dispatcher
└── clean-checkout.mjs                 # isolated release/parity checks
tooling/engineering-baseline/
├── src/
│   ├── specification/
│   ├── traceability/
│   ├── contracts/
│   └── generation/
└── fixtures/
    ├── specification/
    ├── traceability/
    └── contracts/{openapi,asyncapi,graphql,proto}/
tests/acceptance/
├── world.ts
├── hooks.ts
└── steps/
```

**Structure Decision**: Keep application behavior in the existing component-oriented `src/`
layout. Put reusable validation/generation logic in one focused tooling component, and keep fixed
repository entry scripts thin. Generated application artifacts live under `src/generated`
and never become the source of policy.

## Design and Implementation Phases

### Phase 1 - Freeze contracts and validator interfaces

1. Approve the users OpenAPI contract, the contract-manifest schema, baseline configuration
   schema, traceability report schema, and current feature manifest at Gate 2.
2. Capture the current published OpenAPI semantics and `src/index.ts` public declarations as
   migration-parity fixtures before replacing the generator.
3. Treat any mismatch found between the captured runtime and contract as a separate reviewed
   correction; do not silently normalize it during migration.

### Phase 2 - Build deterministic validation through Vitest TDD

1. Add a failing fixture test for each required rejection and its valid counterpart.
2. Implement pure parsers and validators for specification metadata, FR/SC definitions, Gherkin
   tags/status, success evidence, gate digests, contract manifests/selectors, profile activation,
   and generated drift.
3. Produce stable findings with codes, source paths, and locations; sort all output so runs are
   byte-reproducible.
4. Generate the read-only traceability report from specifications, Gherkin, contract manifests,
   and `verification.yaml`; compare generated content instead of mutating it in verification mode.

### Phase 3 - Build the outer and inner behavior loops

1. Add pinned Cucumber-JS dependencies and strict `cucumber.mjs` profiles using tsx ESM, no
   retries, isolated Worlds, and failure-only CI reports.
2. Implement shared glue under `tests/acceptance` and automate the approved baseline workflow
   scenarios plus users capability scenarios.
3. Retain co-located Vitest tests for validators, policies, schemas, serializers, adapters, and
   failure paths; do not duplicate complete acceptance examples.
4. Require PR evidence for a meaningful failing acceptance/unit test and the final passing
   command without claiming CI can prove historical ordering.

### Phase 4 - Implement contract profiles and REST migration

1. Install exact tool groups only when a profile is enabled. The dogfood repository enables all
   four; isolated fixtures prove inactive groups are neither installed nor invoked.
2. Implement the six canonical `contracts:*` scripts and deprecated `openapi:*` aliases for the
   0.1.x line.
3. Validate each authoritative artifact, resolve every manifest selector, generate deterministic
   derivatives, compare compatible/breaking fixtures, and run provider conformance.
   Redocly retains recommended linting except for the existing absent server and license metadata,
   which remain explicit parity exceptions until a separately reviewed contract change.
4. Generate users types, client functions, Zod schemas, and MSW mocks from
   `contracts/openapi/baseline-api.yaml`. Preserve existing class/function/type exports with a
   compatibility facade and declaration-level parity tests.
5. Remove `scripts/generate-openapi.ts`, `src/openapi.ts`, and route metadata only after semantic,
   behavior, generated-output, and public-export parity all pass.

### Phase 5 - Withdrawn

This phase was withdrawn by ADR-0021. Its number is not reused.

### Phase 6 - Governance, CI, and release convergence

1. Add ADR-0018 and ADR-0019; mark ADR-0013 superseded without altering its historical decision.
2. Add the three focused skills and extend the routed skills, README, delivery/testing/API/docs,
   Copilot, PR template, and CODEOWNERS guidance.
3. Reorder CI exactly as specified and upload Cucumber reports only on failure.
4. Run all-profile/breaking, migration parity,
   clean-checkout generation, and complete CI tests.
5. Keep every owned component and release document at 0.1.0 until SC-001 through SC-011 pass;
   only then may the feature converge as the dogfood release. Stable 1.0.0 remains out of scope.

## Task-Generation Ordering Rules

The subsequent `tasks.md` must respect this order for each behavior slice:

1. Author or update applicable contracts and manifests.
2. Add/enable one failing Cucumber scenario for stakeholder-visible behavior.
3. Add one focused failing Vitest test for the next implementation behavior.
4. Implement only enough production/tooling code to pass the focused test.
5. Refactor with Vitest green, then make the outer scenario green.
6. Run contract generation/conformance and deterministic verification.
7. Record evidence in `verification.yaml` and the PR template.

Parallel tasks are permitted only when they edit disjoint files and do not bypass these
dependencies.

## Post-Design Constitution Re-check

Phase 1 design introduces only contracts, schemas, manifests, and validation guidance before
implementation. The REST source migration preserves the current interface, contract tooling is
profile-selective, both gates are retained, and fixed shell commands contain no dynamic
interpolation. All constitution checks remain PASS.

## Complexity Tracking

No constitution violations or unjustified architecture exceptions are present.
