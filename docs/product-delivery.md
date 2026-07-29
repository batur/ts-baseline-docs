# Product Delivery Standard

This document defines how projects using this baseline distinguish a proof of concept (PoC) from a minimum viable product (MVP).

## Choose the Delivery Mode

Use a PoC when a consequential product, technical, integration, data, performance or workflow assumption is still uncertain. Use an MVP when critical feasibility is sufficiently resolved and a defined early audience needs a usable end-to-end outcome.

| Concern          | Validate PoC                                                 | Build MVP                                                   |
| ---------------- | ------------------------------------------------------------ | ----------------------------------------------------------- |
| Primary goal     | Resolve a consequential uncertainty                          | Deliver and learn from a usable release                     |
| Audience         | Decision-makers and experiment participants                  | A defined early-user audience                               |
| Scope            | One to three high-impact assumptions                         | One primary end-to-end journey                              |
| Evidence         | Predefined thresholds, representative inputs and raw results | Acceptance criteria, operational evidence and user feedback |
| Quality boundary | Safe, isolated and reproducible experiment                   | Releasable quality floor for every applicable risk          |
| Exit             | Go, Pivot, Stop or Inconclusive                              | Iterate, Pivot, Expand, Pause or Retire                     |

Do not label a disconnected prototype as an MVP. Do not treat a successful PoC as production-ready.

## PoC Contract

Before implementation:

- state the decision the experiment must inform;
- define a falsifiable hypothesis;
- select only the assumptions needed for that decision;
- define success, failure and inconclusive criteria;
- set representative inputs, a time/cost/scope box and explicit non-goals;
- identify the exact evidence that will be captured.

Use the minimum fidelity that can test the uncertainty. The boundary under test must be real or representative; mocks may be used outside it. Keep disposable work isolated and mark simulated or omitted behavior.

A completed PoC records exact inputs, effective configuration, commands and raw observations, then makes one evidence-backed Go, Pivot, Stop or Inconclusive recommendation. It also identifies disposable code, potentially reusable code, missing production concerns, cleanup and the next decision.

## MVP Contract

Before implementation:

- define the early audience, problem and primary outcome;
- define one end-to-end journey and its acceptance criteria;
- state the business or learning hypothesis and observable signal;
- separate must-have scope, explicit non-scope and candidate-next work;
- verify that critical feasibility assumptions are sufficiently resolved.

An MVP is a release, not a quality exemption. Address each applicable area explicitly:

- authentication, authorization and ownership boundaries;
- validation and stable error behavior;
- secrets, privacy and data retention;
- migrations, constraints, transactions, idempotency, backup and recovery;
- dependency and integration failure behavior;
- core-path automated tests;
- structured logs, health signals and learning metrics;
- accessibility and usability for the intended audience;
- environment validation, deployment, rollback and support;
- legal, policy, licensing, billing and vendor constraints.

Prefer one thin vertical slice over several partial features. A manual internal step is acceptable only when it is intentional, safe, measurable, supported and documented.

## Transition from PoC to MVP

A Go decision authorizes evaluation of the next investment; it does not automatically authorize an MVP or release.

Before reusing PoC work:

1. Reassess the evidence and unresolved risks.
2. Define the MVP product contract and release boundary.
3. Audit reusable code against the current architecture, security, data, testing, observability and operations standards.
4. Replace shortcuts that weaken production behavior.
5. Record consequential scope or architecture decisions.

Return to a PoC when a newly discovered high-impact uncertainty could invalidate the MVP architecture, integration, economics or primary journey.

## Deployment and Safety

ADR-0015 still governs repository-integrated delivery: work merged to `main` must retain the project's working deployment path and CI gates. An isolated technical spike may use a sandbox, test project or separate entry point without public deployment, but it must remain reproducible and must not weaken production controls.

Neither mode authorizes production writes, contact with real users, material cost, sensitive data use or public release without the required user or release authorization.

## Agent Skills

- Use [`validate-poc`](../.agents/skills/validate-poc/SKILL.md) to plan, implement and evaluate feasibility experiments.
- Use [`build-mvp`](../.agents/skills/build-mvp/SKILL.md) to plan, implement, verify and prepare a bounded first release.
- Apply the relevant architecture, API, persistence, security, validation, testing, documentation and delivery skills alongside them.
