import { useCallback, useEffect, useState } from "react";

import { listUsers } from "./user.api.js";

import type { ListUsersInput, UserResponse } from "./user.types.js";

export type LoadUsers = (input: ListUsersInput) => Promise<readonly UserResponse[]>;

export type UsersState =
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "loading" }
  | { readonly status: "success"; readonly users: readonly UserResponse[] };

export function useUsers(organizationId: string, loadUsers: LoadUsers = listUsers) {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<UsersState>({ status: "loading" });

  const reload = useCallback(() => {
    setReloadKey((currentKey) => currentKey + 1);
  }, []);

  useEffect(() => {
    let isCurrent = true;

    if (organizationId.trim() === "") {
      setState({ message: "An organization is required.", status: "error" });
      return () => {
        isCurrent = false;
      };
    }

    setState({ status: "loading" });

    void loadUsers({
      limit: 20,
      organizationId,
    })
      .then((users) => {
        if (isCurrent) setState({ status: "success", users });
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setState({
            message: error instanceof Error ? error.message : "Unable to load users.",
            status: "error",
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [loadUsers, organizationId, reloadKey]);

  return { reload, state };
}
