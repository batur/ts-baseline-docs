// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UsersPage } from "./users-page";

import type { PropsWithChildren, ReactNode } from "react";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });
}

function renderWithQueryClient(ui: ReactNode) {
  const client = createTestQueryClient();
  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper });
}

describe("UsersPage", () => {
  it("renders data returned by the feature API boundary", async () => {
    renderWithQueryClient(
      <UsersPage
        createUserRequest={() =>
          Promise.resolve({
            createdAt: "2026-01-01T00:00:00.000Z",
            displayName: "Ada Lovelace",
            email: "ada@example.com",
            id: "usr_123",
          })
        }
        loadUsers={() =>
          Promise.resolve([
            {
              createdAt: "2026-01-01T00:00:00.000Z",
              displayName: "Ada Lovelace",
              email: "ada@example.com",
              id: "usr_123",
            },
          ])
        }
        organizationId="org_demo"
      />,
    );

    expect(await screen.findByText("Ada Lovelace")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Directory" })).toBeTruthy();
  });

  it("renders an empty state", async () => {
    renderWithQueryClient(
      <UsersPage loadUsers={() => Promise.resolve([])} organizationId="org_demo" />,
    );

    expect(await screen.findByText("No users found.")).toBeTruthy();
  });
});
