import { validateListUsersQueryInput } from "./user.schema.js";

import type { ListUsersInput, User, UserRepository } from "./user.types.js";

export async function listUsers(
  input: unknown,
  repository: UserRepository,
): Promise<readonly User[]> {
  const validation = validateListUsersQueryInput(input);

  if (!validation.success) {
    return [];
  }

  return listValidatedUsers(validation.data, repository);
}

function listValidatedUsers(
  input: ListUsersInput,
  repository: UserRepository,
): Promise<readonly User[]> {
  return repository.list(input);
}
