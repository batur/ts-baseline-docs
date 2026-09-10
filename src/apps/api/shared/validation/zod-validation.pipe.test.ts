import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ApplicationError } from "../errors/index.js";

import { ZodValidationPipe } from "./index.js";

describe("ZodValidationPipe", () => {
  const pipe = new ZodValidationPipe(
    z
      .object({
        name: z.string().min(1),
      })
      .strict(),
  );

  it("returns validated boundary input", () => {
    expect(pipe.transform({ name: "Ada" })).toEqual({ name: "Ada" });
  });

  it("converts invalid input into the shared application error", () => {
    expect(() => pipe.transform({ name: "" })).toThrow(ApplicationError);

    try {
      pipe.transform({ name: "" });
    } catch (error) {
      expect(error).toMatchObject({
        code: "VALIDATION_ERROR",
        details: [
          {
            code: "INVALID_INPUT",
            field: "name",
          },
        ],
        status: 400,
      });
    }
  });
});
