import { UserActivityChart } from "./user-chart";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: UserActivityChart,
  title: "Features/Users/UserActivityChart",
} satisfies Meta<typeof UserActivityChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
