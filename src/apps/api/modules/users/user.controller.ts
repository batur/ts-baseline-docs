import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req } from "@nestjs/common";

import { createCollectionEnvelope, createSuccessEnvelope } from "../../shared/http/index.js";
import { ZodValidationPipe } from "../../shared/validation/index.js";

import { CREATE_USER_SCHEMA, LIST_USERS_QUERY_SCHEMA, toListUsersInput } from "./user.schema.js";
import { serializeUser } from "./user.serializer.js";
import { UserService } from "./user.service.js";

import type { CreateUserInput } from "./user.types.js";
import type { RequestWithId } from "../../shared/http/index.js";
import type { z } from "zod";

type CreateUserRequest = z.output<typeof CREATE_USER_SCHEMA>;
type ListUsersQuery = z.output<typeof LIST_USERS_QUERY_SCHEMA>;

@Controller("users")
export class UserController {
  public constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async createUser(
    @Req() request: RequestWithId,
    @Body(new ZodValidationPipe<CreateUserInput>(CREATE_USER_SCHEMA))
    input: CreateUserRequest,
  ) {
    const user = await this.userService.create(input);

    return createSuccessEnvelope(serializeUser(user), request.requestId);
  }

  @Get()
  public async listUsers(
    @Req() request: RequestWithId,
    @Query(new ZodValidationPipe<ListUsersQuery>(LIST_USERS_QUERY_SCHEMA))
    query: ListUsersQuery,
  ) {
    const users = await this.userService.list(toListUsersInput(query));

    return createCollectionEnvelope(
      users.map((user) => serializeUser(user)),
      {
        hasNextPage: false,
        limit: query.limit,
        nextCursor: null,
      },
      request.requestId,
    );
  }
}
