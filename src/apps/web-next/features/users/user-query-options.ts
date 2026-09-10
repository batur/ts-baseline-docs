import { queryOptions } from "@tanstack/react-query";

import { listUsers } from "./user.api";

import type { ListUsersInput } from "./user.types";

export const USERS_QUERY_KEY = ["users"] as const;

export function usersQueryOptions(input: ListUsersInput) {
  const { limit, organizationId } = input;

  return queryOptions({
    queryFn: () => listUsers({ limit, organizationId }),
    queryKey: [...USERS_QUERY_KEY, organizationId, limit],
    staleTime: 30_000,
  });
}
