import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";

import { UsersPage } from "./users-page";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  component: UsersPage,
  decorators: [
    (storyComponent) => {
      const StoryComponent = storyComponent;
      const queryClient = new QueryClient({
        defaultOptions: {
          mutations: { retry: false },
          queries: { retry: false },
        },
      });

      return (
        <QueryClientProvider client={queryClient}>
          <MotionConfig reducedMotion="user">
            <StoryComponent />
          </MotionConfig>
        </QueryClientProvider>
      );
    },
  ],
  title: "Features/Users/UsersPage",
} satisfies Meta<typeof UsersPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
  args: {
    loadUsers: () =>
      Promise.resolve([
        {
          createdAt: "2026-01-01T00:00:00.000Z",
          displayName: "Ada Lovelace",
          email: "ada@example.com",
          id: "usr_123",
        },
      ]),
    organizationId: "org_demo",
  },
};

export const Empty: Story = {
  args: {
    loadUsers: () => Promise.resolve([]),
    organizationId: "org_demo",
  },
};
