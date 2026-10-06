# Data Model: TypeScript AI Engineering Baseline 0.1.0

The baseline stores governance and verification state in checked-in files. Runtime validation
uses strict schemas; unknown fields are rejected unless a versioned schema explicitly permits
them.

## Delivery Feature

Represents one living-specification feature package under `specs/<feature>/`.

| Field | Type | Rules |
| --- | --- | --- |
| `schemaVersion` | integer | Must be `1` |
| `feature` | string | Stable kebab-case identifier; directory remains `NNN-feature` |
| `lane` | enum | `full`, `standard`, or `lightweight` |
| `status` | enum | `draft`, `planned`, `in-progress`, `complete` |
| `contractProfiles` | array | Unique subset of `openapi`, `asyncapi`, `graphql`, `grpc` |
| `requirements` | array | Unique functional requirements parsed from `FR-###` definitions |
| `successCriteria` | array | Unique criteria parsed from `SC-###` definitions |

Validation rules:

- Full is mandatory for external interfaces, security/authorization, persistence semantics, and
  user-visible behavior.
- Standard requires concise intent and TDD; Gherkin is required when observable behavior changes.
- Lightweight records intent/invariants and cannot claim an external contract change.
- `complete` forbids clarification markers and unfinished Cucumber status.

## Functional Requirement

| Field | Type | Rules |
| --- | --- | --- |
| `id` | string | `FR-` followed by three digits; unique in the feature |
| `text` | string | Non-empty normative statement |
| `scenarios` | relationship | Full-lane requirement has at least one ready scenario |
| `contractElements` | relationship | Required when the requirement changes an external boundary |
| `verificationEvidence` | relationship | At least one test/check relationship by completion |

## Success Criterion

| Field | Type | Rules |
| --- | --- | --- |
| `id` | string | `SC-` followed by three digits; unique in the feature |
| `text` | string | Measurable outcome |
| `evidenceKind` | enum | `automated` or `manual` |
| `evidence` | string | Fixed command/check, or justified manual method |
| `verificationEvidence` | relationship | Must resolve by completion |

## Behavior Scenario

| Field | Type | Rules |
| --- | --- | --- |
| `uri` | string | `specs/<feature>/acceptance/*.feature` |
| `name` | string | Unique with URI and line |
| `requirementIds` | array | One or more valid `FR-###` tags |
| `wip` | boolean | Allowed only while feature status is `draft` |
| `ready` | boolean | Included in strict ready execution |
| `steps` | array | Declarative Given/When/Then phrases |

Every scenario receives a new World and isolated application state. Completion rejects undefined,
ambiguous, pending, skipped, or wip ready scenarios.

## Verification Evidence Manifest

Checked in as `specs/<feature>/verification.yaml` during implementation.

| Field | Type | Rules |
| --- | --- | --- |
| `schemaVersion` | integer | Must be `1` |
| `feature` | string | Must match the feature package |
| `evidence[].id` | string | Stable `VE-###`, unique in the feature |
| `evidence[].kind` | enum | `cucumber`, `vitest`, `contract`, `playwright`, `script`, `manual` |
| `evidence[].path` | string | Existing repository-relative file, when applicable |
| `evidence[].command` | string | Fixed package script, when automated |
| `evidence[].requirementIds` | array | Valid `FR-###` references |
| `evidence[].successCriterionIds` | array | Valid `SC-###` references |
| `evidence[].manualJustification` | string/null | Required only for manual evidence |

This manifest supplies the test/check-to-success-criterion join that cannot be inferred safely
from prose or filenames.

## Contract Manifest

Defined by `contracts/contract-manifest.schema.json` within the feature package.

| Field | Type | Rules |
| --- | --- | --- |
| `schemaVersion` | integer | Must be `1` |
| `feature` | string | Must resolve to a feature package |
| `contracts[].id` | string | Unique stable contract-change identifier |
| `contracts[].profile` | enum | `openapi`, `asyncapi`, `graphql`, or `grpc` |
| `contracts[].artifact` | string | Existing authoritative repository-relative path |
| `contracts[].artifactSha256` | string | Lowercase SHA-256 of authoritative artifact |
| `contracts[].selectors` | object | Non-empty affected operations/messages/fields/types/RPC methods |
| `contracts[].requirementIds` | array | Non-empty valid `FR-###` references |
| `contracts[].owners.provider` | array | At least one owner |
| `contracts[].owners.consumers` | array | At least one owner |
| `contracts[].compatibility.classification` | enum | `additive`, `deprecation`, or `breaking` |
| `contracts[].compatibility.baseline` | string/null | Required for changed established contracts |
| `contracts[].migration` | object | Required flag, strategy, deadline, rollout notes |
| `contracts[].deprecation` | object | Deprecated elements, notes, intended removal release |

Selector rules by profile:

- OpenAPI operations resolve by `operationId`; fields/types resolve through Schema Objects.
- AsyncAPI messages resolve by component/message name or operation/channel selector.
- GraphQL fields/types resolve against SDL; checked-in operations must validate against it.
- gRPC methods resolve as fully qualified service/method names; fields resolve by message and number
  or name.

The artifact digest detects stale metadata even when selectors still exist.

## Traceability Report

A read-only derived artifact generated in stable order from the feature specification, Gherkin,
contract manifests, and verification evidence.

| Field | Type | Rules |
| --- | --- | --- |
| `schemaVersion` | integer | Must be `1` |
| `feature` | string | Source feature identifier |
| `sourceDigest` | string | Digest of normalized source artifacts; no timestamp |
| `relationships` | array | Sorted by requirement ID |
| `relationships[].requirementId` | string | Existing `FR-###` |
| `relationships[].scenarios` | array | Sorted source locations |
| `relationships[].contractElements` | array | Sorted manifest/artifact/selectors |
| `relationships[].evidence` | array | Sorted `VE-###` records |
| `relationships[].successCriteria` | array | Sorted `SC-###` records reached through evidence |

## Baseline Configuration

Checked in as `engineering-baseline.config.json` and validated against the feature's baseline
configuration schema.

| Field | Type | Rules |
| --- | --- | --- |
| `schemaVersion` | integer | Must be `1` |
| `baselineVersion` | string | Exact baseline version; initially `0.1.0` |
| `profiles` | object | All four keys exist; each has `enabled` and authoritative artifact globs |

Only enabled profile entries may cause dependencies or checks to be installed/executed.

## Approval Gate and State Transitions

```text
draft
  -> Gate 1 approved for exact spec/example/Gherkin digests
  -> planned with applicable contracts
  -> Gate 2 approved for exact plan/contract digests
  -> in-progress through tasks/analyze/implementation
  -> complete after verification and convergence
```

- Changing a Gate 1 source invalidates Gate 1 and all downstream approvals.
- Changing a Gate 2 source invalidates Gate 2 but retains Gate 1 if its sources are unchanged.
- A rejected gate returns to the artifact-owning stage.
- Final merge approval is never represented as an automated state transition.
