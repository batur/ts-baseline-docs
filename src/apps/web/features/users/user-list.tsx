import { StatusPanel } from "../../shared/ui/index.js";

import type { UsersState } from "./use-users.js";

export function UserList({ state }: { readonly state: UsersState }) {
  if (state.status === "loading") return <StatusPanel>Loading users…</StatusPanel>;
  if (state.status === "error") return <StatusPanel tone="error">{state.message}</StatusPanel>;
  if (state.users.length === 0) return <StatusPanel>No users found.</StatusPanel>;

  return (
    <ul aria-label="Users" className="user-list">
      {state.users.map((user) => (
        <li className="user-list__item" key={user.id}>
          <span>{user.displayName}</span>
          <small>{user.id}</small>
        </li>
      ))}
    </ul>
  );
}
