# Gate 2: Implementation Plan and Contract Approval

**Status**: Approved

**Prepared**: 2026-09-10

## Preconditions

- [x] Gate 1 is approved for the current specification, Example Mapping, and Gherkin artifacts.
- [x] The feature remains classified as Full.
- [x] No implementation task or production-code migration has started.

## Review Results

- [x] The implementation plan covers every active FR-001 through FR-018 and SC-001 through SC-012
  outcome through phased design, task ordering, or release convergence.
- [x] Research resolves the BDD/TDD relationship, persistence model,
  traceability source model, profile tooling, compatibility defaults, and workflow shell security.
- [x] The data model defines feature, requirement, criterion, scenario, evidence, manifest,
  traceability, configuration, and approval states.
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
| plan.md | 40063b7fc5439a0e6d721a377c6a4425f7944ac7d4f0cff9709bef03dc18c7da |
| research.md | a714249f3fb3e9d799fe825696dce61b2ecc32a81b04926efe8ca6cf63d27e27 |
| data-model.md | 1f2778c4c33f2fb9f6cf3501dc5a47dec4df9f7819826db488507ac2f792f641 |
| quickstart.md | a37432dda328797941053d47fb3e31a1167ed5c49bcdc7f8c7e3df7a57de12ba |
| contracts/baseline-config.schema.json | b0b96e7dc3e32f907dc38a0ee1b55284fe4a9d1a359b9016debe67712b733ec8 |
| contracts/contract-manifest.schema.json | a9c897dffe457a52b554c80ea7ff2df404fb18d039c0af257b9be7ed0a300a7c |
| contracts/traceability-report.schema.json | 900cc9787368670b59b6197cef791efe9dcc9826c6ae358c97c0cb3ddc5afe0b |
| contracts/engineering-baseline.contracts.yaml | 91c6440f52368e2cdd94858aea2b8ef8bcf521171324e03a3936c0bad6e448a9 |
| ../../../contracts/openapi/baseline-api.yaml | 80c9bfff77589cffae0506c2e87e9d1b3c6d513ffd56a5a16a9351eda9b5a0a6 |
| ../../../redocly.yaml | 37dae431e387e54e87e70da6473e29bc99b585a0bab8f425a55b41313683a8e3 |

Any change to a reviewed artifact invalidates this gate and requires a new human decision.

## Re-approval After ADR-0021

ADR-0021 (2026-10-06) withdrew FR-013 and SC-005 to SC-007. The reviewed artifacts above were edited
to withdraw them and, in a follow-up, to remove the remaining references to the withdrawn
specification tooling. Their digests were refreshed in the same pull requests. The repository
owner's approval and merge of each pull request is the human re-approval of this gate for the
refreshed digests.

## Human Decision

**Decision**: Approved

**Approver**: Repository owner (via Codex session)

**Decision date**: 2026-09-10

**Notes**: Explicit user instruction: "Approve Gate 2".
