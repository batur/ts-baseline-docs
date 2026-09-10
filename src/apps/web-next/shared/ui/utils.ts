type ClassName = string | false | null | undefined;

export function cn(...values: readonly ClassName[]): string {
  return values
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .join(" ");
}
