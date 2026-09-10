import { Module } from "@nestjs/common";

import { UserController } from "./user.controller.js";
import { USER_REPOSITORY, InMemoryUserRepository } from "./user.repository.js";
import { UserService } from "./user.service.js";

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: InMemoryUserRepository,
    },
  ],
  exports: [UserService],
})
// Nest modules are decorator-driven classes and may intentionally have no own members.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UsersModule {}
