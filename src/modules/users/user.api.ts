import { API_VERSION_PREFIX, JsonApiClient } from "../../shared/http/index.js";

import type { CreateUserInput, ListUsersInput, UserResponse } from "./user.types.js";
import type {
  ApiCollectionEnvelope,
  ApiSuccessEnvelope,
  JsonApiClientOptions,
} from "../../shared/http/index.js";

export class UsersApiClient {
  readonly #client: JsonApiClient;

  public constructor(options: JsonApiClientOptions) {
    this.#client = new JsonApiClient(options);
  }

  public createUser(input: CreateUserInput): Promise<ApiSuccessEnvelope<UserResponse>> {
    return this.#client.request<ApiSuccessEnvelope<UserResponse>, CreateUserInput>({
      body: input,
      method: "POST",
      path: `${API_VERSION_PREFIX}/users`,
    });
  }

  public listUsers(input: ListUsersInput): Promise<ApiCollectionEnvelope<UserResponse>> {
    return this.#client.request<ApiCollectionEnvelope<UserResponse>>({
      method: "GET",
      path: `${API_VERSION_PREFIX}/users`,
      query: {
        cursor: input.cursor,
        limit: input.limit,
        organizationId: input.organizationId,
      },
    });
  }
}
