import { NestFactory } from "@nestjs/core";

import { APP_CONFIG } from "../shared/config/index.js";
import { ApiExceptionFilter } from "../shared/errors/index.js";
import { API_VERSION_PREFIX } from "../shared/http/index.js";

import { AppModule } from "./app.module.js";

import type { INestApplication } from "@nestjs/common";

export async function createNestApplication(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(API_VERSION_PREFIX.slice(1));
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();

  return app;
}

export async function bootstrapApp(): Promise<INestApplication> {
  const app = await createNestApplication();

  await app.listen(APP_CONFIG.PORT, APP_CONFIG.HOST);

  return app;
}
