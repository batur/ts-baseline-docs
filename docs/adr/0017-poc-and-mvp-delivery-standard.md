# ADR-0017: PoC and MVP Delivery Standard

## Status

Accepted.

## Context

Projects need a consistent way to choose between testing feasibility and building a releasable first product. Treating every prototype as an MVP creates unsafe or incomplete releases. Treating an MVP as a disposable experiment removes the security, data integrity, testing, observability and operational controls required for real users.

The baseline now includes `validate-poc` and `build-mvp` agent skills. Their boundaries and handoff must be explicit so humans and AI coding assistants optimize for the correct outcome.

## Decision

A PoC is a time-boxed experiment that resolves one to three consequential uncertainties. It starts with a falsifiable hypothesis plus explicit success, failure and inconclusive criteria; uses the minimum valid fidelity; captures reproducible evidence; and ends with exactly one Go, Pivot, Stop or Inconclusive recommendation. A successful PoC is evidence for a next investment, not proof of production readiness.

An MVP is the smallest releasable product that lets a defined early audience complete one valuable end-to-end outcome and produces a measurable learning signal. It minimizes feature scope, not viability or safety. Applicable authentication, authorization, validation, data integrity, error handling, testing, observability, deployment, rollback, support and policy requirements remain part of the release boundary.

Use `validate-poc` before `build-mvp` when a high-impact feasibility assumption could invalidate the architecture, integration, economics or primary journey. PoC code must be audited against the target quality floor before reuse in an MVP.

ADR-0015 continues to govern repository-integrated work: changes merged to `main` retain the working deployment path and CI gates. Isolated spikes may remain non-public when they are reproducible, bounded and do not weaken production controls.

## Consequences

- Teams choose an experiment or release based on the decision and audience rather than using PoC and MVP as interchangeable labels.
- PoCs require explicit thresholds, representative evidence and cleanup or handoff notes.
- MVPs require a coherent vertical slice and an explicit release quality floor.
- A Go result does not automatically authorize release or make experimental code production-ready.
- Some work will pause for a smaller PoC before MVP implementation, reducing feature throughput while avoiding larger invalid investments.
- MVP scope may be smaller, but safety, operability and measurable learning cannot be deferred merely because the release is early.

## Alternatives considered

- Treat PoC and MVP as informal project labels: rejected because the labels do not provide testable exit criteria or a reliable quality boundary.
- Apply the full production quality floor to every PoC: rejected because it adds implementation that does not improve the experiment's decision value.
- Permit MVPs to defer security, integrity and operational controls: rejected because real users and persistent data make those controls part of viability.
- Automatically promote successful PoC code into the MVP: rejected because experimental shortcuts and evidence do not establish production readiness.

## Follow-up work

- Keep `docs/product-delivery.md` and the two delivery skills aligned with this decision.
- Use the PoC evidence receipt and MVP release receipt defined by the corresponding skills.
- Update project-specific ADRs when a delivery transition introduces consequential scope or architecture decisions.
