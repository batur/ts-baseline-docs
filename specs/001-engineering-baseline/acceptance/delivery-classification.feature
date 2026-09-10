@wip
Feature: Delivery controls scale with change risk
  Engineers apply complete controls where they add confidence and avoid invented artifacts where
  they do not.

  @FR-001
  Scenario Outline: A change receives the required delivery lane
    Given a proposed change is <change>
    When the baseline classifies its delivery risk
    Then the required lane is <lane>

    Examples:
      | change | lane |
      | user-visible behavior | Full |
      | security or authorization behavior | Full |
      | persistence semantics | Full |
      | an external interface | Full |
      | an internal defect without an external boundary | Standard |
      | a behavior-preserving refactor | Lightweight |
      | an editorial correction | Lightweight |

  @FR-001 @FR-005
  Scenario: Standard observable fixes retain executable behavior
    Given a Standard-lane defect changes an observable rule
    When its regression protection is prepared
    Then its living specification and Gherkin example are reconciled before TDD implementation

  @FR-001
  Scenario: Lightweight work avoids artificial artifacts
    Given a change is editorial or demonstrably behavior-preserving
    When its intent and invariants are recorded
    Then the workflow requires relevant checks without inventing Gherkin or external contracts
