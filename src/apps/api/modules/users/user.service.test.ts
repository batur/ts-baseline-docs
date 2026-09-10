import { describe, expect, it } from "vitest";

import { InMemoryUserRepository } from "./user.repository.js";
import { UserService } from "./user.service.js";

describe("UserService", () => {
  it("coordinates user creation through the repository port", async () => {
    const service = new UserService(new InMemoryUserRepository());

    const user = await service.create({
      displayName: "Ada Lovelace",
      email: "ada@example.com",
      organizationId: "org_demo",
    });

    expect(user).toMatchObject({
      displayName: "Ada Lovelace",
      email: "ada@example.com",
      organizationId: "org_demo",
    });
    expect(user.id).toMatch(/^usr_/u);
  });

  it("lists users through the same feature-owned repository port", async () => {
    const service = new UserService(new InMemoryUserRepository());

    await service.create({
      displayName: "Ada Lovelace",
      email: "ada@example.com",
      organizationId: "org_demo",
    });

    const users = await service.list({
      limit: 20,
      organizationId: "org_demo",
    });

    expect(users).toHaveLength(1);
  });
});
