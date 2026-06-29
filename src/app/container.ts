import { InMemoryUserRepository } from "../modules/users/index.js";

import type { UserRepository } from "../modules/users/index.js";

export interface AppContainer {
  readonly userRepository: UserRepository;
}

export function createContainer(): AppContainer {
  return {
    userRepository: new InMemoryUserRepository(),
  };
}
