import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { UsersPage } from "../features/users";

const USERS_SEARCH_SCHEMA = z.object({
  density: z.enum(["comfortable", "compact"]).catch("comfortable"),
});

export const Route = createFileRoute("/users")({
  component: UsersRoute,
  validateSearch: USERS_SEARCH_SCHEMA,
});

function UsersRoute() {
  const { density } = Route.useSearch();

  return (
    <div data-search-density={density}>
      <UsersPage organizationId="org_demo" />
    </div>
  );
}
