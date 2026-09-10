@wip
Feature: Executable behavior and implementation feedback remain traceable
  Engineers use business-readable acceptance examples outside focused test-driven implementation
  cycles.

  @FR-005 @FR-006
  Scenario: Acceptance and unit tests protect different behavior levels
    Given an approved scenario describes an observable system outcome
    When an engineer implements one behavior increment
    Then Cucumber verifies the outer outcome and Vitest guides the internal design

  @FR-006
  Scenario: TDD evidence records a meaningful red state
    Given a behavior increment requires implementation
    When the engineer observes a focused Vitest test fail for the intended reason
    Then the PR records the red evidence and the final passing verification

  @FR-007 @FR-009
  Scenario: Requirements appear in the generated traceability report
    Given a Full-lane specification defines unique functional and success identifiers
    And its ready scenarios carry matching requirement tags
    When traceability validation runs
    Then every requirement and success criterion appears with its verification relationships

  @FR-008
  Scenario Outline: Invalid traceability fails deterministically
    Given a feature package contains <violation>
    When specification validation runs
    Then validation fails with a stable finding for that violation

    Examples:
      | violation |
      | a duplicate requirement identifier |
      | a dangling scenario requirement tag |
      | a Full-lane requirement without a scenario |
      | a success criterion without evidence |
      | an unresolved clarification marker |

  @FR-008
  Scenario: Draft work may be explicitly marked unfinished
    Given a draft specification has an unfinished scenario marked wip
    When specification validation runs
    Then the unfinished scenario is allowed but excluded from ready execution

  @FR-008
  Scenario: Completed work cannot remain unfinished
    Given a completed specification has a scenario marked wip
    When specification validation runs
    Then validation fails before the feature can be accepted
