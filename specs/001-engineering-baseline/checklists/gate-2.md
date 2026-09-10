# Gate 2: Implementation Plan and Contract Approval

**Status**: Approved

**Prepared**: 2026-09-10

## Preconditions

- [x] Gate 1 is approved for the current specification, Example Mapping, and Gherkin artifacts.
- [x] The feature remains classified as Full.
- [x] No implementation task or production-code migration has started.

## Review Results

- [x] The implementation plan covers every FR-001 through FR-018 and SC-001 through SC-012
  outcome through phased design, task ordering, or release convergence.
- [x] Research resolves the BDD/TDD relationship, Spec Kit component model, persistence model,
  traceability source model, profile tooling, compatibility defaults, and workflow shell security.
- [x] The data model defines feature, requirement, criterion, scenario, evidence, manifest,
  traceability, configuration, bundle, and approval states.
- [x] No unresolved planning or clarification marker remains.
- [x] The contract-manifest, baseline-config, and traceability-report JSON schemas parse as valid
  JSON.
- [x] The users OpenAPI contract and feature contract manifest parse as valid YAML.
- [x] Pinned Redocly CLI 2.51.2 accepts the authoritative OpenAPI contract with every recommended
  rule except the two documented migration-parity exceptions.
- [x] The contract manifest references existing FR and SC identifiers.
- [x] Every manifest operation and type selector resolves in the authoritative OpenAPI contract.
- [x] The manifest's `artifactSha256` matches the authoritative OpenAPI artifact.
- [x] Dereferenced users paths, operations, schemas, statuses, and security are semantically
  equivalent to the current generated OpenAPI document after non-semantic `$schema` annotations
  are normalized.
- [x] OpenAPI version and API information remain unchanged.
- [x] The source-of-truth migration is classified as additive because it removes no consumer
  capability, while its required migration strategy and 0.1.0 deadline are explicit.
- [x] The plan requires separate review for any contract/runtime mismatch found during migration.
- [x] The plan preserves literal fixed shell commands and forbids workflow expression interpolation
  in shell steps.
- [x] Human approves the implementation plan and applicable contracts before task generation and
  implementation.

## Applicable Contract Set

- `contracts/openapi/baseline-api.yaml` is the authoritative external users REST contract.
- `contract-manifest.schema.json` defines the baseline-owned machine-readable change manifest.
- `baseline-config.schema.json` defines profile selection and version pins.
- `traceability-report.schema.json` defines the generated report consumed by CI and reviewers.
- `redocly.yaml` fixes the OpenAPI entry point and records narrow exceptions for server and license
  metadata absent from the current generated contract.
- No live AsyncAPI, GraphQL, or gRPC provider/consumer interface is introduced by this feature;
  those profiles are implemented and proven through isolated compatible/breaking fixtures.

## Reviewed Artifact Digests

| Artifact | SHA-256 |
| --- | --- |
| plan.md | 380fee8d446f2af41f5b75c7571c01f625945f5b7829642bf03127c17127c21b |
| research.md | 39e4724e0be80e6a09929702cb54b0d43184467a1189448afa0656bd0a018db2 |
| data-model.md | fa8a322db26f337f29a40fe1e45406ba1b5392324d719ddaef50af8a1ebfe08d |
| quickstart.md | 79492a19cd0a2fad193ac6616484c052ef1e67e1cd0e2d317cb7440270658aed |
| contracts/baseline-config.schema.json | 0ddb66c122a3b89ea9dda75250812b6146e1871ee68b4b19ef1b7dc325a0cedb |
| contracts/contract-manifest.schema.json | a9c897dffe457a52b554c80ea7ff2df404fb18d039c0af257b9be7ed0a300a7c |
| contracts/traceability-report.schema.json | 900cc9787368670b59b6197cef791efe9dcc9826c6ae358c97c0cb3ddc5afe0b |
| contracts/engineering-baseline.contracts.yaml | 91c6440f52368e2cdd94858aea2b8ef8bcf521171324e03a3936c0bad6e448a9 |
| ../../../contracts/openapi/baseline-api.yaml | 80c9bfff77589cffae0506c2e87e9d1b3c6d513ffd56a5a16a9351eda9b5a0a6 |
| ../../../redocly.yaml | 37dae431e387e54e87e70da6473e29bc99b585a0bab8f425a55b41313683a8e3 |

Any change to a reviewed artifact invalidates this gate and requires a new human decision.

## Human Decision

**Decision**: Approved

**Approver**: Repository owner (via Codex session)

**Decision date**: 2026-09-10

**Notes**: Explicit user instruction: "Approve Gate 2".
