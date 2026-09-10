import { describe, expect, it } from "vitest";

import { CreateUserResponse, ListUsersResponse } from "../../src/generated/openapi/zod.js";
import { InMemoryUserRepository, createUserRoutes } from "../../src/modules/users/index.js";

describe("users provider conforms to authoritative OpenAPI", () => {
  it("returns the documented create envelope and status", async () => {
    const routes = createUserRoutes(new InMemoryUserRepository());
    const response = await routes.createUser({
      body: { displayName: "Ada", email: "ada@example.com", organizationId: "org-a" },
      headers: {},
      query: {},
      requestId: "req-create",
    });

    expect(response.status).toBe(201);
    expect(CreateUserResponse.safeParse(response.body).success).toBe(true);
  });

  it("returns the documented tenant-scoped collection envelope", async () => {
    const repository = new InMemoryUserRepository();
    const routes = createUserRoutes(repository);
    await routes.createUser({
      body: { displayName: "Ada", email: "ada@example.com", organizationId: "org-a" },
      headers: {},
      query: {},
      requestId: "req-a",
    });
    await routes.createUser({
      body: { displayName: "Grace", email: "grace@example.com", organizationId: "org-b" },
      headers: {},
      query: {},
      requestId: "req-b",
    });

    const response = await routes.listUsers({
      body: undefined,
      headers: {},
      query: { organizationId: "org-a" },
      requestId: "req-list",
    });
    expect(response.status).toBe(200);
    expect(ListUsersResponse.safeParse(response.body).success).toBe(true);
    expect("data" in response.body && response.body.data).toHaveLength(1);
  });
});
