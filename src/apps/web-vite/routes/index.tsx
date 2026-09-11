import { createFileRoute } from "@tanstack/react-router";

import { UsersPage } from "../pages/users";

export const Route = createFileRoute("/")({
  component: HomeRoute,
});

function HomeRoute() {
  return <UsersPage organizationId="org_demo" />;
}
