@wip
Feature: Human approval controls implementation
  The accountable human reviews durable intent and interfaces before an AI coding agent implements
  a Full-lane change.

  @FR-002 @FR-003
  Scenario: Specification and behavior are approved before planning
    Given a Full-lane change has a living specification and executable behavior examples
    When the specification and behavior verification succeeds
    Then the workflow pauses at Gate 1 for human approval

  @FR-003
  Scenario: Rejected specification returns to discovery
    Given a Full-lane workflow is waiting at Gate 1
    When the human rejects the specification or behavior examples
    Then the workflow stops before planning and returns the change for clarification

  @FR-004 @FR-012
  Scenario: Plan and contracts are approved before implementation
    Given Gate 1 is approved and the plan and applicable contracts pass verification
    When the workflow reaches its second approval point
    Then implementation remains blocked until the human approves Gate 2

  @FR-004
  Scenario: A change without an external contract still receives plan approval
    Given an approved Full-lane change has no independently owned system boundary
    When its implementation plan passes verification
    Then Gate 2 presents the plan and records that no contract is applicable
