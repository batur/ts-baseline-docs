import { ApplicationError } from "../../shared/errors/index.js";

import type { User } from "./user.types.js";

export function ensureUserEmailIsAvailable(existingUser: User | undefined): void {
  if (existingUser !== undefined) {
    throw new ApplicationError("User email already exists.", "USER_EMAIL_EXISTS");
  }
}
