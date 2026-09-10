import { UsersPage } from "../features/users/index.js";

import { AppProviders } from "./providers/app-providers.js";

const DEMO_ORGANIZATION_ID = "org_demo";

export function App() {
  return (
    <AppProviders>
      <UsersPage organizationId={DEMO_ORGANIZATION_ID} />
    </AppProviders>
  );
}
