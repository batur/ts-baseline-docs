import { randomUUID } from "node:crypto";

import { ApplicationError } from "../../shared/errors/index.js";

import { ensureUserEmailIsAvailable } from "./user.policy.js";
import { validateCreateUserInput } from "./user.schema.js";

import type { CreateUserInput, User, UserRepository } from "./user.types.js";

export async function createUser(input: unknown, repository: UserRepository): Promise<User> {
  const validation = validateCreateUserInput(input);

  if (!validation.success) {
    throw new ApplicationError("Invalid user input.", "USER_INPUT_INVALID");
  }

  return createValidatedUser(validation.data, repository);
}

async function createValidatedUser(
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
