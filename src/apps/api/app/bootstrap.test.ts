import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";

import { createNestApplication } from "./bootstrap.js";

import type { Server } from "node:net";

interface UserSuccessBody {
  readonly data: {
    readonly displayName: string;
    readonly id: string;
  };
  readonly meta: {
    readonly requestId: string;
  };
}

interface ApiErrorBody {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly requestId: string;
  };
}

describe("Nest HTTP application", () => {
  let app: Awaited<ReturnType<typeof createNestApplication>> | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it("composes middleware, Zod validation, controller, service and serializer", async () => {
    app = await createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer() as unknown as Server)
      .post("/api/v1/users")
      .set("X-Request-Id", "req_example")
      .send({
        displayName: "Ada Lovelace",
        email: "ada@example.com",
        organizationId: "org_demo",
      })
      .expect(201);

    expect(response.headers["x-request-id"]).toBe("req_example");
    const body = response.body as UserSuccessBody;
    expect(body.data.displayName).toBe("Ada Lovelace");
    expect(body.data.id).toMatch(/^usr_/u);
    expect(body.meta.requestId).toBe("req_example");
  });

  it("returns the standard error envelope for invalid Zod input", async () => {
    app = await createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer() as unknown as Server)
      .post("/api/v1/users")
      .send({ displayName: "" })
      .expect(400);

    const body = response.body as ApiErrorBody;
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toBe("Validation failed.");
    expect(body.error.requestId).toMatch(/^[-\w]+$/u);
  });
});
