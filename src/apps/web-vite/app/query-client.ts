import { QueryClient } from "@tanstack/react-query";

export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        retry: 1,
        staleTime: 30_000,
      },
    },
  });
}

export const APP_QUERY_CLIENT = createAppQueryClient();
