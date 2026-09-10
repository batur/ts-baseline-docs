import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  hashFiles,
  normalizeRepositoryPath,
  parseMarkdownDocument,
  sortDiagnostics,
} from "./index.js";

describe("engineering baseline core", () => {
  it("sorts diagnostics by path, line, and code", () => {
    expect(
      sortDiagnostics([
        { code: "Z", line: 2, message: "last", path: "b.md" },
        { code: "B", line: 1, message: "second", path: "a.md" },
        { code: "A", line: 1, message: "first", path: "a.md" },
      ]).map(({ code }) => code),
    ).toEqual(["A", "B", "Z"]);
  });

  it("hashes an artifact set independently of caller order", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "baseline-core-"));
    await writeFile(path.join(root, "a.txt"), "a\n", "utf8");
    await writeFile(path.join(root, "b.txt"), "b\n", "utf8");

    await expect(hashFiles(root, ["b.txt", "a.txt"])).resolves.toBe(
      await hashFiles(root, ["a.txt", "b.txt"]),
    );
  });

  it("loads YAML frontmatter and normalizes repository paths", () => {
    const parsed = parseMarkdownDocument("---\nlane: full\nstatus: draft\n---\n# Feature\n");

    expect(parsed.frontmatter).toEqual({ lane: "full", status: "draft" });
    expect(parsed.body).toBe("# Feature\n");
    expect(normalizeRepositoryPath("a\\b\\c.md")).toBe("a/b/c.md");
  });
});
