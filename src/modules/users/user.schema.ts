import { z } from "zod";

import type { CreateUserInput, ListUsersInput } from "./user.types.js";
import type { ValidationResult } from "../../shared/validation/index.js";

export const CREATE_USER_SCHEMA_NAME = "create-user";

export const CREATE_USER_SCHEMA = z
  .object({
    displayName: z.string().min(1),
    email: z.email(),
    organizationId: z.string().min(1),
  })
  .strict();

export const LIST_USERS_QUERY_SCHEMA = z
  .object({
    cursor: z.string().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    organizationId: z.string().min(1),
  })
  .strict();

export const USER_RESPONSE_SCHEMA = z
  .object({
    createdAt: z.iso.datetime(),
    displayName: z.string(),
    id: z.string().startsWith("usr_"),
  })
  .strict();

export const USER_SUCCESS_ENVELOPE_SCHEMA = z
  .object({
    data: USER_RESPONSE_SCHEMA,
    meta: z
      .object({
        requestId: z.string().min(1),
      })
      .strict(),
  })
  .strict();

export const USER_COLLECTION_ENVELOPE_SCHEMA = z
  .object({
    data: z.array(USER_RESPONSE_SCHEMA),
    meta: z
      .object({
        requestId: z.string().min(1),
      })
      .strict(),
    pagination: z
      .object({
        hasNextPage: z.boolean(),
        limit: z.number().int(),
        nextCursor: z.string().nullable(),
      })
      .strict(),
  })
  .strict();

export const USER_ERROR_ENVELOPE_SCHEMA = z
  .object({
    error: z
      .object({
        code: z.string(),
        details: z
          .array(
            z
              .object({
                code: z.string(),
                field: z.string(),
                message: z.string(),
              })
              .strict(),
          )
          .optional(),
        message: z.string(),
        requestId: z.string(),
      })
      .strict(),
  })
  .strict();

export function validateCreateUserInput(input: unknown): ValidationResult<CreateUserInput> {
  const parsedInput = CREATE_USER_SCHEMA.safeParse(input);

  if (!parsedInput.success) {
    return {
      issues: parsedInput.error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.join(".") || CREATE_USER_SCHEMA_NAME,
      })),
      success: false,
    };
  }

  return {
    data: parsedInput.data,
    success: true,
  };
}

export function validateListUsersQueryInput(input: unknown): ValidationResult<ListUsersInput> {
  const parsedInput = LIST_USERS_QUERY_SCHEMA.safeParse(input);

  if (!parsedInput.success) {
    return {
      issues: parsedInput.error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.join(".") || "list-users",
      })),
      success: false,
    };
  }

  const inputData: ListUsersInput =
    parsedInput.data.cursor === undefined
      ? {
          limit: parsedInput.data.limit,
          organizationId: parsedInput.data.organizationId,
        }
      : {
          cursor: parsedInput.data.cursor,
          limit: parsedInput.data.limit,
          organizationId: parsedInput.data.organizationId,
        };

  return {
    data: inputData,
    success: true,
  };
}
