---
name: build-mvp
description: >-
  Plan, implement, verify, and prepare the smallest releasable product or
  bounded first release that delivers one primary end-to-end outcome to a
  defined early audience and creates measurable feedback. Use when the user
  says MVP, minimum viable product, first usable release, early release, core
  product flow, private beta, or asks to turn a validated PoC or prototype into
  a usable product. Keep non-core features out of scope while retaining
  essential security, data integrity, validation, error handling, testing,
  observability, deployment, rollback, and support requirements. Do not use
  merely to test feasibility; use validate-poc when critical assumptions remain
  unresolved.
---

# Build MVP

## Purpose

Deliver the smallest coherent release that lets a defined early audience
complete a valuable outcome and lets the team learn from actual use. Minimize
scope, not viability, safety, or result integrity.

Use applicable project, language, architecture, API, persistence, security,
testing, documentation, and delivery skills for implementation details. Let
this skill govern release scope, the quality floor, and the feedback loop.

## Establish the Product Contract

Before implementation:

1. Inspect the current repository, newest decisions and documentation, existing
   behavior, effective configuration, and any PoC or prototype evidence.
2. Identify:
   - the defined early audience;
   - the problem and primary user outcome;
   - the single end-to-end journey that delivers that outcome;
   - the business or learning hypothesis;
   - the observable signal that will inform the next decision.
3. Verify that critical feasibility assumptions are sufficiently resolved.
   Apply `validate-poc` first when a high-impact unknown could invalidate the
   architecture, integration, economics, or user flow.
4. State material assumptions and constraints. Do not hide unresolved
   showstoppers in a later backlog.

If no real or representative user can complete a meaningful outcome, classify
the work as a prototype or PoC instead of calling it an MVP.

## Draw the Minimum Viable Boundary

Define the release before building it:

- Write acceptance criteria for the primary journey.
- Separate **must have now**, **explicitly out of scope**, and **candidate
  next** items.
- Include a feature only when it is required to complete the journey, protect
  users or data, operate the release, or measure the hypothesis.
- Prefer one thin vertical slice across the necessary UI, API, domain,
  persistence, and integration boundaries over several disconnected partial
  features.
- Defer speculative abstractions, secondary personas, advanced customization,
  premature scale, and convenience features.
- Record consequential scope or architecture decisions in the repository's
  established format.

The core outcome must be real at the learning boundary. A manual internal step
is acceptable when it is intentional, safe, measurable, operationally
supported, and documented; do not disguise a stubbed or broken core flow as an
MVP.

## Preserve the Release Quality Floor

Tailor controls to the product's exposure and risk, but address each applicable
area explicitly:

- authentication, authorization, ownership, and tenant boundaries;
- input and boundary validation;
- safe error handling and stable user-facing failure behavior;
- secrets, privacy, data minimization, and retention;
- schema migrations, constraints, transactions, idempotency, backup, and
  recovery for stateful flows;
- dependency and third-party integration failure behavior;
- core-path unit, integration, contract, and end-to-end tests;
- structured logs, request or job correlation, health signals, and the metrics
  needed to operate and learn;
- accessible and usable behavior for the intended audience;
- environment validation, deployment configuration, rollback, and support
  ownership;
- applicable legal, policy, licensing, billing, and vendor constraints.

Mark an item not applicable only with a concrete reason. Do not use “MVP” to
justify insecure defaults, missing data integrity, an unrecoverable deployment,
or an unverifiable core path.

## Implement the Vertical Slice

1. Preserve existing user changes and follow current repository conventions.
2. Complete the primary journey before adding enhancements.
3. Use the simplest maintainable design that satisfies the current contract.
4. Reassess PoC code before reuse. Replace shortcuts that weaken production
   behavior, and retain only code that meets the target quality floor.
5. Keep integrations outside transactions when appropriate, make external
   effects safe to retry, and expose failure states rather than silently losing
   work.
6. Update tests, configuration examples, migrations, API contracts,
   architecture decisions, and operating documentation required by the change.

Do not broaden scope merely because adjacent work is convenient. Surface a
material new dependency or product decision instead of inventing it.

## Verify Release Readiness

Run the checks relevant to the repository and risk:

- dependency or lockfile validation;
- formatting and linting;
- static type checking;
- unit, integration, contract, and end-to-end tests;
- build and packaging;
- migration validation and rollback or recovery checks;
- effective configuration and sanitized payload inspection;
- core acceptance criteria, relevant failure paths, and authorization
  boundaries;
- deployment or release dry-run where available.

Inspect exact failures and raw provider responses before making causal claims.
Do not claim the MVP is releasable when required checks are skipped or failing;
state the remaining blocker and its impact.

## Release and Learn

When release is authorized:

1. Prefer a controlled audience, staged rollout, feature flag, or other bounded
   exposure appropriate to the product.
2. Confirm rollback, support ownership, health monitoring, and feedback
   collection before increasing exposure.
3. Measure the predefined outcome and learning signals.
4. Combine observed behavior, operational evidence, and direct feedback.
5. Decide whether to iterate, pivot, expand, pause, or retire the product.

When release is not authorized, deliver a verified release candidate and the
exact remaining release steps without changing external state.

## Provide an MVP Receipt

Report completion in this compact order:

1. Target audience, problem, and primary outcome
2. Included scope and explicit non-scope
3. Architecture and consequential decisions
4. Quality-floor controls implemented or not applicable
5. Verification evidence and exact commands
6. Release status, rollout, rollback, and support state
7. Learning metric and feedback mechanism
8. Known constraints and prioritized next decision
