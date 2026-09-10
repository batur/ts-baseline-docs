import { CLIENT_CONFIG } from "../../shared/config";
import { ClientContractError } from "../../shared/errors";
import { ApiClient } from "../../shared/http";

import {
  CREATE_USER_SCHEMA,
  LIST_USERS_INPUT_SCHEMA,
  USER_COLLECTION_ENVELOPE_SCHEMA,
  USER_SUCCESS_ENVELOPE_SCHEMA,
} from "./user.schema";

import type { CreateUserInput, ListUsersInput, UserResponse } from "./user.types";
import type { ApiRequestOptions } from "../../shared/http";

export interface UsersHttpClient {
  request(options: ApiRequestOptions): Promise<unknown>;
}

const defaultClient = new ApiClient({ baseUrl: CLIENT_CONFIG.API_BASE_URL });

export async function listUsers(
  input: ListUsersInput,
  client: UsersHttpClient = defaultClient,
): Promise<readonly UserResponse[]> {
  const validInput = LIST_USERS_INPUT_SCHEMA.parse(input);
  const payload = await client.request({
    method: "GET",
    path: "/users",
    query: { limit: validInput.limit, organizationId: validInput.organizationId },
  });
  const result = USER_COLLECTION_ENVELOPE_SCHEMA.safeParse(payload);

  if (!result.success)
    throw new ClientContractError("The users response did not match the API contract.");

  return result.data.data;
}

export async function createUser(
  input: CreateUserInput,
  client: UsersHttpClient = defaultClient,
): Promise<UserResponse> {
  const payload = await client.request({
    body: CREATE_USER_SCHEMA.parse(input),
    method: "POST",
    path: "/users",
  });
  const result = USER_SUCCESS_ENVELOPE_SCHEMA.safeParse(payload);

  if (!result.success)
    throw new ClientContractError("The created user response did not match the API contract.");

  return result.data.data;
}
