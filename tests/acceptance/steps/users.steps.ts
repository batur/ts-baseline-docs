import { strict as assert } from "node:assert";

import { Given, Then, When } from "@cucumber/cucumber";

import { createUser, listUsers } from "../../../src/modules/users/index.js";

import type { BaselineWorld } from "../world.js";

Given(
  "an isolated users application for organization {string}",
  function (this: BaselineWorld, organizationId: string) {
    this.organizationId = organizationId;
  },
);

Given(
  "a user exists with email {string} and display name {string}",
  async function (this: BaselineWorld, email: string, displayName: string) {
    await createUser({ displayName, email, organizationId: this.organizationId }, this.repository);
  },
);

Given(
  "a user exists in organization {string} with email {string}",
  async function (this: BaselineWorld, organizationId: string, email: string) {
    await createUser({ displayName: "Other tenant", email, organizationId }, this.repository);
  },
);

When(
  "a user is created with email {string} and display name {string}",
  async function (this: BaselineWorld, email: string, displayName: string) {
    try {
      this.user = await createUser(
        { displayName, email, organizationId: this.organizationId },
        this.repository,
      );
    } catch (error: unknown) {
      this.errorCode =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "UNKNOWN";
    }
  },
);

When(
  "users are listed for organization {string}",
  async function (this: BaselineWorld, organizationId: string) {
    this.listedUsers = await listUsers({ limit: 20, organizationId }, this.repository);
  },
);

Then(
  "the user creation succeeds with an externally visible identifier",
  function (this: BaselineWorld) {
    assert.match(this.user?.id ?? "", /^usr_/u);
  },
);

Then("user creation fails with code {string}", function (this: BaselineWorld, code: string) {
  assert.equal(this.errorCode, code);
});

Then(
  "only users from organization {string} are visible",
  function (this: BaselineWorld, organizationId: string) {
    assert.ok(this.listedUsers.length > 0);
    assert.ok(this.listedUsers.every((user) => user.organizationId === organizationId));
  },
);
