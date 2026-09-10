interface StatusPanelProps {
  readonly children: string;
  readonly tone?: "error" | "neutral";
}

export function StatusPanel({ children, tone = "neutral" }: StatusPanelProps) {
  return (
    <p
      aria-live="polite"
      className={`status-panel status-panel--${tone}`}
      role={tone === "error" ? "alert" : undefined}
    >
      {children}
    </p>
  );
}
