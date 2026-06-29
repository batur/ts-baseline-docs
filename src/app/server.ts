import { createUserRoutes } from "../modules/users/index.js";

import type { AppContainer } from "./container.js";
import type { UserResponse } from "../modules/users/index.js";
import type {
  ApiCollectionEnvelope,
  ApiErrorEnvelope,
  ApiRequest,
  ApiResponse,
  ApiSuccessEnvelope,
} from "../shared/http/index.js";

export interface AppServer {
  readonly createUser: (
    request: ApiRequest,
  ) => Promise<ApiResponse<ApiErrorEnvelope | ApiSuccessEnvelope<UserResponse>>>;
  readonly listUsers: (
    request: ApiRequest,
  ) => Promise<ApiResponse<ApiCollectionEnvelope<UserResponse> | ApiErrorEnvelope>>;
}

export function createServer(container: AppContainer): AppServer {
  const userRoutes = createUserRoutes(container.userRepository);

  return {
    createUser: userRoutes.createUser,
    listUsers: userRoutes.listUsers,
  };
}
