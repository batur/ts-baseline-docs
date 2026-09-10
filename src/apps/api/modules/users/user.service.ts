import { Inject, Injectable } from "@nestjs/common";

import { createUser } from "./create-user.use-case.js";
import { listUsers } from "./list-users.use-case.js";
import { USER_REPOSITORY } from "./user.repository.js";

import type { CreateUserInput, ListUsersInput, User, UserRepository } from "./user.types.js";

@Injectable()
export class UserService {
  public constructor(@Inject(USER_REPOSITORY) private readonly repository: UserRepository) {}

  public create(input: CreateUserInput): Promise<User> {
    return createUser(input, this.repository);
  }

  public list(input: ListUsersInput): Promise<readonly User[]> {
    return listUsers(input, this.repository);
  }
}
