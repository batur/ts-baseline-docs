"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useEffect } from "react";

import { Alert, Button, Card, StatusPanel } from "../../shared/ui";

import { CreateUserForm } from "./create-user-form";
import { UserActivityChart } from "./user-chart";
import { UserList } from "./user-list";
import { usersQueryOptions } from "./user-query-options";
import { createUser, listUsers } from "./user.api";
import { useUsersUiStore } from "./users-ui.store";

import type { CreateUserRequest } from "./create-user-form";
import type { CreateUserInput, ListUsersInput } from "./user.types";

interface UsersPageProps {
  readonly createUserRequest?: CreateUserRequest;
  readonly initialDensity?: "comfortable" | "compact";
  readonly loadUsers?: (input: ListUsersInput) => ReturnType<typeof listUsers>;
  readonly organizationId: string;
}

export function UsersPage({
  createUserRequest,
  initialDensity,
  loadUsers = listUsers,
  organizationId,
}: UsersPageProps) {
  const queryClient = useQueryClient();
  const submitUser: CreateUserRequest = createUserRequest ?? createUser;
  const density = useUsersUiStore((state) => state.density);
  const setDensity = useUsersUiStore((state) => state.setDensity);
  useEffect(() => {
    if (initialDensity !== undefined && density !== initialDensity) setDensity(initialDensity);
  }, [density, initialDensity, setDensity]);
  const usersQuery = useQuery(
    usersQueryOptions(
      {
        limit: 20,
        organizationId,
      },
      loadUsers,
    ),
  );
  const createMutation = useMutation({
    mutationFn: (input: CreateUserInput) => submitUser(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: usersQueryOptions({ limit: 20, organizationId }).queryKey,
      });
    },
  });

  return (
    <main className="mx-auto grid min-h-screen max-w-5xl gap-6 px-5 py-10 sm:px-8">
      <header className="grid gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Frontend tooling example
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Users</h1>
        <p className="max-w-2xl text-muted-foreground">
          Query data, typed forms, headless tables, accessible charts, client preferences and motion
          composed inside one feature boundary.
        </p>
      </header>
      <section aria-labelledby="create-user-heading">
        <Card>
          <h2 className="text-lg font-semibold" id="create-user-heading">
            Create a user
          </h2>
          {createMutation.isError ? (
            <Alert tone="error">{getErrorMessage(createMutation.error)}</Alert>
          ) : null}
          {createMutation.isSuccess ? <Alert>User created.</Alert> : null}
          <CreateUserForm
            createUserRequest={createMutation.mutateAsync}
            onCreated={() => {
              createMutation.reset();
            }}
            organizationId={organizationId}
          />
        </Card>
      </section>
      <section aria-labelledby="users-heading">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold" id="users-heading">
              Directory
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setDensity(density === "compact" ? "comfortable" : "compact");
                }}
                variant="outline"
              >
                {density === "compact" ? "Comfortable rows" : "Compact rows"}
              </Button>
              <Button onClick={() => void usersQuery.refetch()} variant="outline">
                Refresh
              </Button>
            </div>
          </div>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
          >
            <UserList
              error={usersQuery.error}
              isError={usersQuery.isError}
              isLoading={usersQuery.isPending}
              onRetry={() => void usersQuery.refetch()}
              users={usersQuery.data ?? []}
            />
          </motion.div>
        </Card>
      </section>
      {usersQuery.isSuccess ? <UserActivityChart /> : <StatusPanel>Chart awaits data.</StatusPanel>}
    </main>
  );
}

function getErrorMessage(error: Error | null): string {
  return error?.message ?? "Unable to create user.";
}
