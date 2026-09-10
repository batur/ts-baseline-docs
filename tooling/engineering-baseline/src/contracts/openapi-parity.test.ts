import { access, readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

import { checkProfileCompatibility } from "./profiles.js";

describe("users OpenAPI source migration", () => {
  it("preserves the published operation and schema surface", async () => {
    const published = await readFile("docs/openapi/openapi.yaml", "utf8");
    const authoritative = await readFile("contracts/openapi/baseline-api.yaml", "utf8");

    expect(checkProfileCompatibility("openapi", published, authoritative)).toEqual([]);
    expect(checkProfileCompatibility("openapi", authoritative, published)).toEqual([]);

    const document = parseYaml(authoritative) as {
      paths: Record<
        string,
        Record<string, { responses: Record<string, unknown>; security?: unknown }>
      >;
    };
    expect(Object.keys(document.paths)).toEqual(["/api/v1/users"]);
    expect(Object.keys(document.paths["/api/v1/users"]?.post?.responses ?? {})).toEqual([
      "201",
      "409",
      "422",
    ]);
    expect(Object.keys(document.paths["/api/v1/users"]?.get?.responses ?? {})).toEqual([
      "200",
      "400",
      "401",
    ]);
    expect(document.paths["/api/v1/users"]?.post?.security).toEqual([{ bearerAuth: [] }]);
  });

  it("publishes generated types, Zod schemas, client functions, and MSW mocks", async () => {
    await expect(
      Promise.all([
        access("src/generated/openapi/models/createUserRequest.ts"),
        access("src/generated/openapi/zod.ts"),
        access("src/generated/openapi/client.ts"),
        access("src/generated/openapi/client.msw.ts"),
      ]),
    ).resolves.toEqual([undefined, undefined, undefined, undefined]);
  });

  it("preserves public users exports through a compatibility facade", async () => {
    const source = await readFile("src/modules/users/index.ts", "utf8");
    expect(source).toContain('export { USERS_API_ROUTES } from "./user.contract.js";');
    for (const name of [
      "createUser",
      "UsersApiClient",
      "serializeUser",
      "CreateUserInput",
      "ListUsersInput",
      "User",
      "UserRepository",
      "UserResponse",
    ]) {
      expect(await readFile("src/index.ts", "utf8")).toContain(name);
    }
  });

  it("has retired code-first OpenAPI generation", async () => {
    await expect(access("scripts/generate-openapi.ts")).rejects.toThrow();
    await expect(access("src/openapi.ts")).rejects.toThrow();
    await expect(access("src/modules/users/user.openapi.ts")).rejects.toThrow();
  });
});
