# Research: TypeScript AI Engineering Baseline 0.1.0

## Decision: Nest TDD inside the Cucumber acceptance loop

**Decision**: Use Cucumber's Discovery -> Formulation -> Automation lifecycle for representative
stakeholder-visible examples. Automate one scenario at the lowest stable observable boundary,
then use focused Vitest RED -> GREEN -> REFACTOR cycles to implement the internal behavior.

**Rationale**: Cucumber distinguishes BDD discovery/formulation from automation and recommends
examples in domain language. TDD supplies the faster design feedback needed below that boundary.
The two suites therefore protect different risks and need not repeat complete assertions.

**Alternatives considered**:

- Cucumber-only testing was rejected because it is too broad for exhaustive policies, validation,
  serializers, and failure branches.
- Vitest-only testing was rejected because it does not preserve collaboratively reviewed behavior
  in a business-readable executable form.
- Mirroring every scenario in unit tests was rejected because it creates redundant brittle suites.

**Sources**: [Cucumber BDD](https://cucumber.io/docs/bdd/),
[Example Mapping](https://cucumber.io/docs/bdd/example-mapping/),
[Gherkin reference](https://cucumber.io/docs/gherkin/reference/),
[Cucumber state isolation](https://cucumber.io/docs/cucumber/state/),
[Kent Beck's Canon TDD](https://newsletter.kentbeck.com/p/canon-tdd)

## Decision: Use Spec Kit as intent/orchestration, not deterministic evidence

**Decision**: Pin GitHub Spec Kit 1.0.5. Own a preset for methodology, an extension for
deterministic verification, a branching workflow for orchestration and human gates, and an
integration-agnostic bundle for distribution.

**Rationale**: Core Spec Kit supplies durable specification, planning, tasking, analysis,
implementation, convergence, component installation, and resumable gates, but core templates do
not enforce executable Gherkin, strict TDD, protocol contracts, or complete traceability. Those
controls must be baseline-owned and checked by repository scripts.

**Alternatives considered**:

- Unreviewed community BDD/TDD components were rejected because the community catalog is explicitly
  unvetted.
- Repository-only documentation was rejected because future installations would depend on manual
  copying and agent memory.
- A Codex-specific package was rejected because bundle components can remain integration-agnostic
  and materialize commands for the active supported integration.

**Sources**: [Spec Kit agentic SDD](https://github.github.io/spec-kit/reference/agentic-sdd.html),
[presets](https://github.github.io/spec-kit/reference/presets.html),
[extensions](https://github.github.io/spec-kit/reference/extensions.html),
[workflows](https://github.github.io/spec-kit/reference/workflows.html),
[bundles](https://github.github.io/spec-kit/reference/bundles.html)

## Decision: Adopt living specifications with immutable decision history

**Decision**: Update `spec.md` first when intent changes, then reconcile Example Mapping,
Gherkin, contracts, plans, tasks, verification evidence, and generated reports. Preserve
architectural history in sequential ADRs rather than rewriting accepted decisions.

**Rationale**: This keeps current behavior discoverable while retaining the rationale and migration
history needed for governance. Gate digests prevent an earlier approval from silently applying to
changed content.

**Alternatives considered**:

- Immutable feature records only were rejected because they fragment the current behavioral source
  of truth.
- Rewriting accepted ADRs was rejected because it erases decision history.

**Source**: [Spec persistence models](https://github.github.io/spec-kit/concepts/spec-persistence.html)

## Decision: Use deterministic structured traceability sources

**Decision**: Parse specification frontmatter and stable Markdown IDs, parse Gherkin with the
Cucumber parser, validate manifests/config/evidence with strict runtime schemas, and generate a
sorted JSON/Markdown report. Introduce `verification.yaml` as the machine-readable source linking
tests/checks to FR and SC identifiers.

**Rationale**: Gherkin tags link requirements to scenarios, contract manifests link requirements
to boundary elements, and verification evidence links tests/checks to both requirements and
success criteria. A deterministic join across those sources can prove coverage and reject dangling
or ambiguous relationships without inferring intent from prose.

**Alternatives considered**:

- Filename conventions alone were rejected because they cannot express many-to-many relationships.
- AI-generated traceability without validation was rejected because it is neither reproducible nor
  suitable for CI.
- Timestamps in generated artifacts were rejected because they create drift without semantic
  changes.

## Decision: Make contracts authoritative only at external boundaries

**Decision**: Use OpenAPI 3.1.x for REST/HTTP, AsyncAPI 3.x plus payload schemas for events,
GraphQL SDL plus checked-in consumer operations for graph APIs, and versioned Protobuf files for
gRPC. Pact remains optional for known independently released consumers and complements the
authoritative schema.

**Rationale**: Independently developed sides need a shared interface before implementation. Normal
in-process TypeScript interfaces remain implementation design and do not justify protocol tooling.

**Alternatives considered**:

- Applying contract artifacts to every internal interface was rejected as disproportionate.
- Pact as the sole source of truth was rejected because contracts by example do not describe the
  full provider surface.
- OpenAPI 3.2 was deferred until the complete selected toolchain passes a reviewed compatibility
  upgrade.

**Sources**: [OpenAPI Specification](https://spec.openapis.org/oas/latest.html),
[AsyncAPI document structure](https://www.asyncapi.com/docs/concepts/asyncapi-document/structure),
[GraphQL schemas](https://graphql.org/learn/schema/),
[Protobuf best practices](https://protobuf.dev/best-practices/dos-donts/),
[Pact](https://docs.pact.io/)

## Decision: Enforce profile-specific compatibility policies

**Decision**:

- REST: Redocly lint/bundle, Orval generation, Prism mock/conformance, and oasdiff breaking analysis.
- Events: AsyncAPI validate/diff, Modelina generation, and backward-transitive registry
  compatibility for retained/replayed messages by default.
- GraphQL: lint SDL and operations, generate types, diff with Inspector, deprecate and usage-check
  before removal.
- gRPC: Buf lint/generate/breaking, version packages, never reuse field numbers, and reserve removed
  numbers and names.

**Rationale**: Each protocol has different structural and rollout compatibility rules. One generic
diff cannot safely classify all of them.

**Alternatives considered**:

- A single home-grown schema differ was rejected because it would duplicate mature
  protocol-specific semantics.
- Installing every tool in every adopting project was rejected because inactive profiles must add
  neither dependencies nor CI cost.

**Sources**: [Redocly CLI](https://redocly.com/docs/cli/),
[Orval](https://orval.dev/docs/), [Prism](https://github.com/stoplightio/prism),
[oasdiff](https://github.com/oasdiff/oasdiff),
[AsyncAPI CLI](https://www.asyncapi.com/docs/tools/cli/usage),
[Modelina](https://www.asyncapi.com/tools/modelina),
[GraphQL Code Generator](https://the-guild.dev/graphql/codegen/),
[GraphQL Inspector](https://the-guild.dev/graphql/inspector/docs),
[Buf breaking change detection](https://buf.build/docs/breaking/)

## Decision: Treat workflow shell text as a closed command allowlist

**Decision**: All workflow `shell` steps use literal commands such as `pnpm baseline:verify` and
contain no expression interpolation. Lane and approval values are constrained enums used by
workflow branching/gates, never concatenated into shell text. Fixed scripts discover checked-in
configuration and the active feature themselves.

**Rationale**: Spec Kit passes interpolated workflow values to `/bin/sh -c` without escaping and
provides no capability sandbox. Literal commands keep the executable surface reviewable.

**Alternatives considered**:

- Quoting interpolated values was rejected because quoting is not an injection boundary.
- Passing agent output to a shell script was rejected because agent output is untrusted.

**Source**: [Spec Kit workflow interpolation and shell safety](https://github.github.io/spec-kit/reference/workflows.html#interpolation-and-shell-safety)

## Decision: Preserve REST semantics before retiring code-first generation

**Decision**: Capture the current generated OpenAPI, runtime behavior, and TypeScript declaration
surface first. Author `contracts/openapi/baseline-api.yaml` to express the same paths, operations,
request/response schemas, statuses, and security. Generate new artifacts into an isolated path,
prove semantic and public-export parity, then remove route-metadata generation.

**Rationale**: The requested migration changes authority, not user-visible behavior. A staged
parallel comparison prevents cleanup from hiding a contract/runtime correction.

Redocly's recommended rules require server and license metadata that the captured document does
not contain. `redocly.yaml` records narrow `no-empty-servers` and `info-license` exceptions so the
migration contract can pass every other recommended rule without bundling an unrelated metadata
change.

**Alternatives considered**:

- Editing the API to match preferred REST conventions during migration was rejected because every
  discovered mismatch requires separate review.
- Byte-for-byte YAML comparison was rejected because references and ordering may differ without a
  semantic contract change.
