import { cn } from "../utils";

import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("grid gap-4 rounded-xl border bg-card p-5 shadow-sm", className)}
      {...props}
    />
  );
}
