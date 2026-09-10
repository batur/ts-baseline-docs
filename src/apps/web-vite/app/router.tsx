import { createRouter } from "@tanstack/react-router";

import { routeTree } from "../route-tree.gen";

import { APP_QUERY_CLIENT } from "./query-client";

export const router = createRouter({
  context: {
    queryClient: APP_QUERY_CLIENT,
  },
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
