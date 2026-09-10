import { ApplicationError } from "../errors/index.js";

import type { PipeTransform } from "@nestjs/common";
import type { z } from "zod";

export class ZodValidationPipe<TOutput> implements PipeTransform<unknown, TOutput> {
  public constructor(private readonly schema: z.ZodType<TOutput>) {}

  public transform(value: unknown): TOutput {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new ApplicationError("Validation failed.", "VALIDATION_ERROR", {
        details: result.error.issues.map((issue) => ({
          code: "INVALID_INPUT",
          field: issue.path.join(".") || "request",
          message: issue.message,
        })),
        status: 400,
      });
    }

    return result.data;
  }
}
