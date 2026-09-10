import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { sha256 } from "../core/index.js";

export interface InstallBundleOptions {
  readonly integration: "codex" | "copilot" | "opencode";
  readonly projectRoot: string;
  readonly sourceRoot: string;
}

const MANAGED_DIRECTORY = ".specify/typescript-engineering-baseline";
const MANIFEST_PATH = ".specify/baseline-managed.json";

async function filesRecursively(root: string, prefix = ""): Promise<string[]> {
  const directory = path.join(root, prefix);
  const entries = await readdir(directory, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) results.push(...(await filesRecursively(root, relative)));
    else if (entry.isFile()) results.push(relative);
  }
  return results;
}

export async function installBundle(options: InstallBundleOptions): Promise<void> {
  const target = path.join(options.projectRoot, MANAGED_DIRECTORY);
  await mkdir(path.dirname(target), { recursive: true });
  await rm(target, { force: true, recursive: true });
  await cp(options.sourceRoot, target, { recursive: true });
  const files = (await filesRecursively(options.sourceRoot)).map((file) =>
    file.replaceAll("\\", "/"),
  );
  await writeFile(
    path.join(options.projectRoot, MANIFEST_PATH),
    `${JSON.stringify({ files, integration: options.integration, schemaVersion: 1, version: "0.1.0" }, null, 2)}\n`,
    "utf8",
  );
}

export async function updateBundle(options: InstallBundleOptions): Promise<void> {
  await installBundle(options);
}

export async function removeBundle(projectRoot: string): Promise<void> {
  await rm(path.join(projectRoot, MANAGED_DIRECTORY), { force: true, recursive: true });
  await rm(path.join(projectRoot, MANIFEST_PATH), { force: true });
}

export async function managedTreeDigest(projectRoot: string): Promise<string> {
  const root = path.join(projectRoot, MANAGED_DIRECTORY);
  const files = await filesRecursively(root);
  const content = await Promise.all(
    files.map(
      async (file) =>
        `${file.replaceAll("\\", "/")}\0${await readFile(path.join(root, file), "utf8")}\0`,
    ),
  );
  return sha256(content.join(""));
}
