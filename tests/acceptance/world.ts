import { World, setWorldConstructor } from "@cucumber/cucumber";

import { InMemoryUserRepository } from "../../src/modules/users/index.js";

import type { User } from "../../src/modules/users/index.js";
import type { Diagnostic } from "../../tooling/engineering-baseline/src/core/index.js";
import type { IWorldOptions } from "@cucumber/cucumber";

export class BaselineWorld extends World {
  public change = "";
  public contractProfile = "";
  public diagnostics: Diagnostic[] = [];
  public errorCode: string | undefined;
  public expectedCode = "";
  public expectedState = "";
  public lane = "";
  public listedUsers: readonly User[] = [];
  public organizationId = "";
  public projectRoot = "";
  public readonly repository = new InMemoryUserRepository();
  public state = "";
  public user: User | undefined;

  public constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(BaselineWorld);
