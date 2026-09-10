import { z } from "zod";

export const CREATE_USER_SCHEMA = z
  .object({
    displayName: z.string().trim().min(1, "Display name is required."),
    email: z.email("Enter a valid email address."),
    organizationId: z.string().min(1),
  })
  .strict();

const USER_RESPONSE_SCHEMA = z
  .object({
    createdAt: z.iso.datetime(),
    displayName: z.string(),
    id: z.string().startsWith("usr_"),
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
