export const APP_NAME = "ts-baseline-docs";

export { bootstrapApp } from "./app/bootstrap.js";
export { createUser, serializeUser, UsersApiClient } from "./modules/users/index.js";
export type { AppServer } from "./app/server.js";
export type {
  CreateUserInput,
  ListUsersInput,
  User,
  UserRepository,
  UserResponse,
} from "./modules/users/index.js";

export interface RequestContext {
  readonly organizationId: string;
  readonly requestId: string;
}

export interface UserRecord {
  readonly createdAt: string;
  readonly displayName: string;
  readonly id: string;
}

export function serializeExampleUser(user: UserRecord, context: RequestContext): UserRecord {
  return {
    createdAt: user.createdAt,
    displayName: `${user.displayName} (${context.organizationId})`,
    id: user.id,
  };
}

/*
 * Bad ESLint examples.
 *
 * Uncomment examples one at a time and run `pnpm lint` to verify the baseline
 * rules. Keep them commented during normal development so the repository stays
 * green.
 */

// import fs from "node:fs";

// import "./side-effect.js";

// export default APP_NAME;

// interface IUserRecord {
//   readonly id: string;
// }

// const user_name = "Ada";
// const runtimeEnvironment = process.env.NODE_ENV;

// function SerializeExampleUser(user: UserRecord): UserRecord {
//   return user;
// }
