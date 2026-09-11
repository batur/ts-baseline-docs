"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";

import {
  CreateUserForm,
  UserActivityChart,
  UserTable,
  createUser,
  usersQueryOptions,
} from "../features/users";
import { useUiStore } from "../shared/stores";
import { Alert, Button, Card, StatusPanel } from "../shared/ui";

import type { CreateUserInput, UserResponse } from "../features/users";

export default function Page() {
  const organizationId = "org_demo";
  const queryClient = useQueryClient();
  const density = useUiStore((state) => state.density);
  const setDensity = useUiStore((state) => state.setDensity);
  const usersQuery = useQuery(usersQueryOptions({ limit: 20, organizationId }));
  const createMutation = useMutation<UserResponse, Error, CreateUserInput>({
    mutationFn: (input: CreateUserInput) => createUser(input),
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
          Next.js App Router example
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Users</h1>
        <p className="max-w-2xl text-muted-foreground">
          The route owns this page composition; client data, state and UI remain feature-owned.
        </p>
      </header>
      <Card>
        <h2 className="text-lg font-semibold">Create a user</h2>
        {createMutation.isError ? <Alert tone="error">{createMutation.error.message}</Alert> : null}
        {createMutation.isSuccess ? <Alert>User created.</Alert> : null}
        <CreateUserForm
          createUserRequest={createMutation.mutateAsync}
          onCreated={() => {
            createMutation.reset();
          }}
          organizationId={organizationId}
        />
      </Card>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Directory</h2>
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
        <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 4 }}>
          {usersQuery.isPending ? <StatusPanel>Loading users…</StatusPanel> : null}
          {usersQuery.isError ? (
            <Alert tone="error">
              {usersQuery.error.message}
              <button
                className="ml-3 underline"
                onClick={() => void usersQuery.refetch()}
                type="button"
              >
                Try again
              </button>
            </Alert>
          ) : null}
          {usersQuery.isSuccess && usersQuery.data.length === 0 ? (
            <StatusPanel>No users found.</StatusPanel>
          ) : null}
          {usersQuery.isSuccess && usersQuery.data.length > 0 ? (
            <UserTable users={usersQuery.data} />
          ) : null}
        </motion.div>
      </Card>
      {usersQuery.isSuccess ? <UserActivityChart /> : null}
    </main>
  );
}
