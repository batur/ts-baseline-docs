import { cn } from "./utils";

import type { ReactNode } from "react";

interface AlertProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly tone?: "error" | "neutral";
}

export function Alert({ children, className, tone = "neutral" }: AlertProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        tone === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-primary/20 bg-primary/5 text-foreground",
        className,
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
