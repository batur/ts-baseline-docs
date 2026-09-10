import { Module, RequestMethod } from "@nestjs/common";

import { UsersModule } from "../modules/users/index.js";
import { RequestIdMiddleware } from "../shared/http/index.js";

import type { MiddlewareConsumer, NestModule } from "@nestjs/common";

@Module({
  imports: [UsersModule],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes({
      method: RequestMethod.ALL,
      path: "*path",
    });
  }
}
