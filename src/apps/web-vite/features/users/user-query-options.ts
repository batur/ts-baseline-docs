import { queryOptions } from "@tanstack/react-query";

import { listUsers } from "./user.api";

import type { ListUsersInput, UserResponse } from "./user.types";

export const USERS_QUERY_KEY = ["users"] as const;

export type UsersLoader = (input: ListUsersInput) => Promise<readonly UserResponse[]>;

export function usersQueryOptions(input: ListUsersInput, loader: UsersLoader = listUsers) {
  const { limit, organizationId } = input;

  return queryOptions({
    queryFn: () => loader({ limit, organizationId }),
    queryKey: [...USERS_QUERY_KEY, organizationId, limit],
    staleTime: 30_000,
  });
}
