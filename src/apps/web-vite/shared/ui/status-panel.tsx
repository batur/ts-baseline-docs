import type { ReactNode } from "react";

interface StatusPanelProps {
  readonly children: ReactNode;
}

export function StatusPanel({ children }: StatusPanelProps) {
  return (
    <p
      aria-live="polite"
      className="rounded-md border border-dashed p-4 text-sm text-muted-foreground"
    >
      {children}
    </p>
  );
}
