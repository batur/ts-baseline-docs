@wip
Feature: Agent guidance, CI, and release readiness enforce one workflow
  Baseline maintainers keep AI coding guidance, CI, and release metadata aligned with the same
  executable delivery rules.

  @FR-015 @FR-016
  Scenario: Agent guidance and CI enforce the same workflow
    Given the repository provides agent guidance and a CI workflow
    When an AI coding session and CI evaluate a change
    Then both apply the same delivery lane, traceability, contract, and verification rules

  @FR-018
  Scenario: Stability is blocked until acceptance is complete
    Given the baseline is dogfooded as version 0.1.0
    When any clean, profile, parity, CI, or human-gate criterion is incomplete
    Then release readiness rejects a stable 1.0.0 declaration
