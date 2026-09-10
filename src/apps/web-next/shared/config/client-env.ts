import { z } from "zod";

const CLIENT_ENV_SCHEMA = z.object({
  apiBaseUrl: z.string().min(1).default("/api/v1"),
});

const parsedEnvironment = CLIENT_ENV_SCHEMA.parse({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export const CLIENT_CONFIG = {
  API_BASE_URL: parsedEnvironment.apiBaseUrl,
} as const;

export type ClientConfig = typeof CLIENT_CONFIG;
