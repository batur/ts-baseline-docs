import { randomUUID } from "node:crypto";

import { ensureUserEmailIsAvailable } from "./user.policy.js";

import type { CreateUserInput, User, UserRepository } from "./user.types.js";

export async function createUser(
  input: CreateUserInput,
  repository: UserRepository,
): Promise<User> {
  const existingUser = await repository.findByEmail(input.organizationId, input.email);

  ensureUserEmailIsAvailable(existingUser);

  return repository.create({
    ...input,
    createdAt: new Date(),
    id: `usr_${randomUUID()}`,
  });
}
