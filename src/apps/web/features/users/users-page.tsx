import { CreateUserForm } from "./create-user-form.js";
import { useUsers } from "./use-users.js";
import { UserList } from "./user-list.js";
import { listUsers } from "./user.api.js";

import type { CreateUserRequest } from "./create-user-form.js";
import type { LoadUsers } from "./use-users.js";

interface UsersPageProps {
  readonly createUserRequest?: CreateUserRequest;
  readonly loadUsers?: LoadUsers;
  readonly organizationId: string;
}

export function UsersPage({
  createUserRequest,
  loadUsers = listUsers,
  organizationId,
}: UsersPageProps) {
  const { reload, state } = useUsers(organizationId, loadUsers);

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="eyebrow">Frontend feature example</p>
        <h1>Users</h1>
        <p>Feature UI, form validation, API mapping and explicit network states.</p>
      </header>
      <section aria-labelledby="create-user-heading" className="card">
        <h2 id="create-user-heading">Create a user</h2>
        <CreateUserForm
          {...(createUserRequest === undefined ? {} : { createUserRequest })}
          onCreated={() => {
            reload();
          }}
          organizationId={organizationId}
        />
      </section>
      <section aria-labelledby="users-heading" className="card">
        <div className="section-heading">
          <h2 id="users-heading">Directory</h2>
          <button onClick={reload} type="button">
            Refresh
          </button>
        </div>
        <UserList state={state} />
      </section>
    </main>
  );
}
