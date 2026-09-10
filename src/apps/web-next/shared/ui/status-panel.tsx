import type { ReactNode } from "react";

export function StatusPanel({ children }: { readonly children: ReactNode }) {
  return (
    <p
      aria-live="polite"
      className="rounded-md border border-dashed p-4 text-sm text-muted-foreground"
    >
      {children}
    </p>
  );
}
