// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UsersPage } from "./users-page.js";

describe("UsersPage", () => {
  it("renders data returned by the feature API boundary", async () => {
    render(
      <UsersPage
        createUserRequest={() =>
          Promise.resolve({
            createdAt: "2026-01-01T00:00:00.000Z",
            displayName: "Ada Lovelace",
            id: "usr_123",
          })
        }
        loadUsers={() =>
          Promise.resolve([
            {
              createdAt: "2026-01-01T00:00:00.000Z",
              displayName: "Ada Lovelace",
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
    render(<UsersPage loadUsers={() => Promise.resolve([])} organizationId="org_demo" />);

    expect(await screen.findByText("No users found.")).toBeTruthy();
  });
});
