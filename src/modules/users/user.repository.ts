import type { ListUsersInput, NewUserRecord, User, UserRepository } from "./user.types.js";

export class InMemoryUserRepository implements UserRepository {
  readonly #users = new Map<string, User>();

  public create(input: NewUserRecord): Promise<User> {
    const user: User = {
      createdAt: input.createdAt,
      displayName: input.displayName,
      email: input.email,
      id: input.id,
      organizationId: input.organizationId,
    };

    this.#users.set(user.id, user);

    return Promise.resolve(user);
  }

  public findByEmail(organizationId: string, email: string): Promise<User | undefined> {
    const user = Array.from(this.#users.values()).find(
      (user) => user.organizationId === organizationId && user.email === email,
    );

    return Promise.resolve(user);
  }

  public list(input: ListUsersInput): Promise<readonly User[]> {
    const users = Array.from(this.#users.values())
      .filter((user) => user.organizationId === input.organizationId)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, input.limit);

    return Promise.resolve(users);
  }
}
