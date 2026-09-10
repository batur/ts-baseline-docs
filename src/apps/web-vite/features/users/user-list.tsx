import { Alert, StatusPanel } from "../../shared/ui";

import { UserTable } from "./user-table";

import type { UserResponse } from "./user.types";

interface UserListProps {
  readonly error: Error | null;
  readonly isError: boolean;
  readonly isLoading: boolean;
  readonly onRetry: () => void;
  readonly users: readonly UserResponse[];
}

export function UserList({ error, isError, isLoading, onRetry, users }: UserListProps) {
  if (isLoading) return <StatusPanel>Loading users…</StatusPanel>;

  if (isError) {
    return (
      <Alert tone="error">
        <span>{error?.message ?? "Unable to load users."}</span>
        <button className="ml-3 underline" onClick={onRetry} type="button">
          Try again
        </button>
      </Alert>
    );
  }

  if (users.length === 0) return <StatusPanel>No users found.</StatusPanel>;

  return <UserTable users={users} />;
}
