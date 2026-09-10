@wip
Feature: Users capability remains observable through the migrated contract
  The existing users API behavior remains intact while OpenAPI becomes authoritative.

  @FR-005 @FR-017
  Scenario: Successful user creation
    Given an isolated users application for organization "org-a"
    When a user is created with email "ada@example.com" and display name "Ada"
    Then the user creation succeeds with an externally visible identifier

  @FR-005 @FR-017
  Scenario: Invalid user input
    Given an isolated users application for organization "org-a"
    When a user is created with email "not-an-email" and display name "Ada"
    Then user creation fails with code "USER_INPUT_INVALID"

  @FR-005 @FR-017
  Scenario: Duplicate email
    Given an isolated users application for organization "org-a"
    And a user exists with email "ada@example.com" and display name "Ada"
    When a user is created with email "ada@example.com" and display name "Another Ada"
    Then user creation fails with code "USER_EMAIL_EXISTS"

  @FR-005 @FR-017
  Scenario: Tenant-observable user listing
    Given an isolated users application for organization "org-a"
    And a user exists with email "ada@example.com" and display name "Ada"
    And a user exists in organization "org-b" with email "grace@example.com"
    When users are listed for organization "org-a"
    Then only users from organization "org-a" are visible
