import type { ListUsersInput, User, UserRepository } from "./user.types.js";

export async function listUsers(
  input: ListUsersInput,
  repository: UserRepository,
): Promise<readonly User[]> {
  return repository.list(input);
}
