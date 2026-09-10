import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";

import { APP_QUERY_CLIENT } from "../query-client";

import type { PropsWithChildren } from "react";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={APP_QUERY_CLIENT}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </QueryClientProvider>
  );
}
