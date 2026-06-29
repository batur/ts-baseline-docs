import {
  createCollectionEnvelope,
  createErrorEnvelope,
  createJsonResponse,
  createSuccessEnvelope,
} from "../../shared/http/index.js";

import { createUser } from "./create-user.use-case.js";
import { listUsers } from "./list-users.use-case.js";
import { serializeUser } from "./user.serializer.js";

import type { UserRepository, UserResponse } from "./user.types.js";
import type {
  ApiCollectionEnvelope,
  ApiErrorEnvelope,
  ApiRequest,
  ApiResponse,
  ApiSuccessEnvelope,
} from "../../shared/http/index.js";

export interface UserRoutes {
  readonly createUser: (
    request: ApiRequest,
  ) => Promise<ApiResponse<ApiErrorEnvelope | ApiSuccessEnvelope<UserResponse>>>;
  readonly listUsers: (
    request: ApiRequest,
  ) => Promise<ApiResponse<ApiCollectionEnvelope<UserResponse> | ApiErrorEnvelope>>;
}

export function createUserRoutes(repository: UserRepository): UserRoutes {
  return {
    createUser: async (request) => {
      try {
        const user = await createUser(request.body, repository);

        return createJsonResponse(
          201,
          createSuccessEnvelope(serializeUser(user), request.requestId),
        );
      } catch (error) {
        return createJsonResponse(
          error instanceof Error && error.message.includes("already exists") ? 409 : 422,
          createErrorEnvelope(
            error instanceof Error && error.message.includes("already exists")
              ? "USER_EMAIL_EXISTS"
              : "VALIDATION_ERROR",
            error instanceof Error ? error.message : "Validation failed.",
            request.requestId,
          ),
        );
      }
    },
    listUsers: async (request) => {
      const users = await listUsers(request.query, repository);

      return createJsonResponse(
        200,
        createCollectionEnvelope(
          users.map((user) => serializeUser(user)),
          {
            hasNextPage: false,
            limit: Number(request.query.limit ?? 20),
            nextCursor: null,
          },
          request.requestId,
        ),
      );
    },
  };
}
