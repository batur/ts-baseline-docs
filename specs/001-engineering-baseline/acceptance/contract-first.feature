@wip
Feature: External system boundaries are agreed before implementation
  Provider and consumer owners share an authoritative, compatible interface description.

  @FR-010 @FR-012
  Scenario: A contract manifest resolves to approved interface elements
    Given a feature changes an independently owned system boundary
    And its manifest identifies owners, requirements, affected elements, and compatibility data
    When contract verification runs before Gate 2
    Then every selector resolves in the authoritative contract

  @FR-008 @FR-010
  Scenario: A stale contract manifest blocks approval
    Given a contract manifest references an element absent from its authoritative contract
    When contract verification runs
    Then validation fails with the stale selector and artifact path

  @FR-011
  Scenario Outline: Each supported boundary selects its contract profile
    Given a TypeScript project communicates through <boundary>
    When the project activates the matching contract profile
    Then the baseline validates and generates from <artifact>

    Examples:
      | boundary | artifact |
      | REST HTTP | OpenAPI |
      | asynchronous messages | AsyncAPI |
      | a graph API | GraphQL SDL and consumer operations |
      | remote procedure calls | Protobuf |

  @FR-011 @FR-014
  Scenario: Inactive profiles add no execution dependency
    Given a project activates only the OpenAPI contract profile
    When baseline setup and verification run
    Then AsyncAPI, GraphQL, and Protobuf tools are neither installed nor executed

  @FR-012
  Scenario: A breaking contract requires an approved migration
    Given compatibility analysis identifies a breaking external interface change
    When the feature is prepared for Gate 2
    Then approval requires a new version or a coordinated migration and deprecation plan

  @FR-017
  Scenario: Users API migration preserves the public surface
    Given the users API behavior and exports are captured before migration
    When OpenAPI becomes its authoritative interface contract
    Then its paths, envelopes, statuses, security declarations, and exported types remain compatible
