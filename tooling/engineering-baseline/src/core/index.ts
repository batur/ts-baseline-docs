import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { parse as parseYaml } from "yaml";

export interface Diagnostic {
  readonly code: string;
  readonly line?: number;
  readonly message: string;
  readonly path: string;
}

export interface MarkdownDocument {
  readonly body: string;
  readonly frontmatter: Readonly<Record<string, unknown>>;
}

export function normalizeRepositoryPath(filePath: string): string {
  return filePath.replaceAll("\\", "/");
}

export function sortDiagnostics(diagnostics: readonly Diagnostic[]): Diagnostic[] {
  return [...diagnostics].sort(
    (left, right) =>
      left.path.localeCompare(right.path) ||
      (left.line ?? 0) - (right.line ?? 0) ||
      left.code.localeCompare(right.code) ||
      left.message.localeCompare(right.message),
  );
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function hashFiles(root: string, filePaths: readonly string[]): Promise<string> {
  const hash = createHash("sha256");

  for (const filePath of [...filePaths].map(normalizeRepositoryPath).sort()) {
    hash.update(`${filePath}\0`);
    hash.update(await readFile(path.resolve(root, filePath)));
    hash.update("\0");
  }

  return hash.digest("hex");
}

export function parseMarkdownDocument(text: string): MarkdownDocument {
  if (!text.startsWith("---\n")) {
    return { body: text, frontmatter: {} };
  }

  const end = text.indexOf("\n---\n", 4);
  if (end === -1) {
    return { body: text, frontmatter: {} };
  }

  const parsed: unknown = parseYaml(text.slice(4, end));
  const frontmatter =
    typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Readonly<Record<string, unknown>>)
      : {};

  return {
    body: text.slice(end + 5),
    frontmatter,
  };
}
