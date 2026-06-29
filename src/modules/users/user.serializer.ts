import type { User, UserResponse } from "./user.types.js";

export function serializeUser(user: User): UserResponse {
  return {
    createdAt: user.createdAt.toISOString(),
    displayName: user.displayName,
    id: user.id,
  };
}
