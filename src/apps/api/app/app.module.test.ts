import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";

import { UserService, UsersModule } from "../modules/users/index.js";

import { AppModule } from "./app.module.js";

describe("AppModule", () => {
  it("wires the users feature module through its public provider", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleRef.get(UsersModule)).toBeInstanceOf(UsersModule);
    expect(moduleRef.get(UserService)).toBeInstanceOf(UserService);

    await moduleRef.close();
  });
});
