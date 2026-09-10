@wip
Feature: Projects receive the executable baseline as a versioned bundle
  Baseline maintainers distribute policy and verification consistently across TypeScript projects.

  @FR-013 @FR-014
  Scenario: A fresh project installs the complete baseline
    Given a fresh TypeScript project uses a supported AI coding integration
    When it installs the pinned engineering baseline bundle
    Then it receives the preset, verifier, gated workflow, and fixed verification commands

  @FR-013
  Scenario: Brownfield adoption preserves unrelated project files
    Given an existing TypeScript project has source files and agent skills
    When it installs the engineering baseline bundle
    Then unrelated source, configuration, and skills remain unchanged

  @FR-013
  Scenario: Bundle lifecycle operations are idempotent
    Given a project has installed the engineering baseline bundle
    When it updates, removes, and reinstalls the same pinned version
    Then the final managed artifact set matches a clean installation

  @FR-015 @FR-016
  Scenario: Agent guidance and CI enforce the same workflow
    Given the bundle is installed in a project
    When an AI coding session and CI evaluate a change
    Then both apply the same delivery lane, traceability, contract, and verification rules

  @FR-018
  Scenario: Stability is blocked until acceptance is complete
    Given the bundle is dogfooded as version 0.1.0
    When any clean, adoption, profile, parity, CI, or human-gate criterion is incomplete
    Then release readiness rejects a stable 1.0.0 declaration
