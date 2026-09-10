import { z } from "zod";

const APP_ENV_SCHEMA = z.object({
  HOST: z.string().min(1).default("127.0.0.1"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
});

const parsedEnvironment = APP_ENV_SCHEMA.parse({
  HOST: process.env.HOST,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
});

export const APP_CONFIG = {
  HOST: parsedEnvironment.HOST,
  NODE_ENV: parsedEnvironment.NODE_ENV,
  PORT: parsedEnvironment.PORT,
} as const;

export type AppConfig = typeof APP_CONFIG;
