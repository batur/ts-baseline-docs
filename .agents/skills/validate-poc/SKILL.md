---
name: validate-poc
description: >-
  Design, implement, and evaluate a time-boxed proof of concept that tests the
  riskiest product, technical, integration, data, performance, or workflow
  assumption using explicit success, failure, and exit criteria and an
  evidence-backed go, pivot, stop, or inconclusive recommendation. Use when the
  user says PoC, proof of concept, concept test, feasibility test, technical
  spike, validate an application flow, test whether an architecture or
  integration can work, or reduce uncertainty before full implementation. Do
  not use for a production release or a complete early-user product; use
  build-mvp after feasibility is sufficiently resolved.
---

# Validate PoC

## Purpose

Run the smallest safe experiment that can resolve a consequential uncertainty.
Optimize for trustworthy learning, not feature count or presentation polish.
Treat the result as evidence for a decision, not as proof of production
readiness.

Use applicable project, language, architecture, security, and testing skills for
the implementation details. Let this skill govern experiment scope, evidence,
and the exit decision.

## Establish the Experiment Contract

Before writing code:

1. Inspect the current repository, documentation, decisions, configuration,
   contracts, and exact upstream behavior relevant to the uncertainty.
2. State the decision the PoC must inform.
3. Express the central hypothesis in a falsifiable form:
   `Given <conditions>, <approach> will achieve <measurable result> within
   <constraints>.`
4. Rank assumptions by impact if false and uncertainty. Select only the one to
   three assumptions necessary for the decision.
5. Define:
   - success thresholds;
   - failure thresholds;
   - conditions that make the result inconclusive;
   - representative inputs and relevant edge or failure cases;
   - a time, cost, and scope box;
   - explicit non-goals.
6. Identify the evidence to capture before choosing the implementation.

Do not implement an experiment that cannot distinguish success from failure.
When requirements remain ambiguous but a safe assumption permits progress,
record the assumption instead of broadening the PoC.

## Choose the Minimum Valid Fidelity

Match the artifact to the uncertainty:

- Use a sketch or interaction prototype for comprehension or usability.
- Use a technical spike for a library, protocol, algorithm, or platform
  capability.
- Use a narrow integrated slice when the hypothesis concerns an application
  flow or interaction between components.
- Use a representative benchmark when the hypothesis concerns latency,
  throughput, cost, or resource use.

Use mocks only outside the boundary being tested. Use the real component,
protocol, data shape, or failure behavior at the boundary whose feasibility is
in question. Prefer sanitized representative data over convenient toy data when
the difference could change the decision.

Isolate disposable work through a sandbox, test project, feature flag, separate
entry point, or similarly bounded mechanism. Preserve the user's existing
changes and avoid unnecessary production architecture.

## Execute Proportionately

If the user requested analysis or a PoC plan only, deliver the experiment
contract without implementing it. If the user requested a working PoC:

1. Implement only what the experiment requires.
2. Keep the measurement path deterministic and inspectable.
3. Exercise the representative happy path and at least one material failure,
   boundary, or edge case.
4. Repeat measurements when variance could affect the conclusion.
5. Capture exact commands, effective configuration, inputs, raw outputs, logs,
   timings, costs, or screenshots needed to reproduce the finding.
6. Compare observations with the predefined thresholds.

For nondeterministic AI or ML behavior, use a representative evaluation set and
multiple trials where appropriate. Measure relevant quality, latency, cost, data
readiness, and safety dimensions; do not validate from cherry-picked examples.

## Protect Safety and Result Integrity

Keep these constraints even when the code is disposable:

- Do not write to production systems, contact real users, incur material cost,
  or use sensitive data without explicit authorization.
- Use least-privilege credentials, sanitized data, bounded quotas, and
  reversible operations.
- Never commit or expose secrets.
- Do not weaken a production control merely to make the PoC pass.
- Label mocked, omitted, or simulated behavior clearly.
- Record confounding factors and limitations that could invalidate
  extrapolation.

If public exposure, persistent user data, authentication, billing, destructive
effects, or regulated data enters scope, apply the corresponding production
safeguards or reclassify the work as an MVP, pilot, or production change. The
PoC label is not a security exemption.

## Decide and Hand Off

Conclude with exactly one status:

- **Go**: the evidence meets the criteria and supports the stated next
  investment.
- **Pivot**: the underlying goal remains useful, but the tested approach should
  change.
- **Stop**: the evidence fails the criteria or the value no longer justifies
  investment.
- **Inconclusive**: the experiment could not resolve the hypothesis; state the
  smallest next experiment and why it would be decisive.

Separate:

- code or design that may be reusable after review;
- deliberately disposable code;
- missing production concerns;
- new risks or unknowns;
- cleanup actions;
- the recommended next step.

Do not silently turn a successful PoC into an MVP. Audit any reused code against
the target project's architecture, security, data, testing, observability, and
operations requirements first.

## Provide an Evidence Receipt

Report the result in this compact order:

1. Decision being informed
2. Hypothesis and selected assumptions
3. Scope, non-goals, timebox, and environment
4. Success, failure, and inconclusive criteria
5. Experiment implemented or proposed
6. Evidence and verification commands
7. Limitations and non-production shortcuts
8. Go, pivot, stop, or inconclusive decision
9. Cleanup and recommended next step
