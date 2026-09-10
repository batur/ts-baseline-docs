import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const generatedRoots = [path.join(root, "docs/openapi"), path.join(root, "src/generated/openapi")];

/**
 * @param {string} directory
 * @param {string} [prefix]
 * @returns {Promise<string[]>}
 */
async function filesRecursively(directory, prefix = "") {
  const entries = await readdir(path.join(directory, prefix), { withFileTypes: true });
  /** @type {string[]} */
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...(await filesRecursively(directory, relative)));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}

async function generatedDigest() {
  const hash = createHash("sha256");
  for (const directory of generatedRoots) {
    for (const relative of await filesRecursively(directory)) {
      hash.update(`${path.relative(root, path.join(directory, relative)).replaceAll("\\", "/")}\0`);
      hash.update(await readFile(path.join(directory, relative)));
      hash.update("\0");
    }
  }
  return hash.digest("hex");
}

const before = await generatedDigest();
for (let index = 0; index < 2; index += 1) {
  const result = spawnSync(
    process.execPath,
    ["scripts/engineering-baseline/contracts.mjs", "generate"],
    { cwd: root, stdio: "inherit" },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const after = await generatedDigest();
if (before !== after) {
  process.stderr.write("Generation changed the managed artifact set; commit regenerated output.\n");
  process.exitCode = 1;
} else {
  process.stdout.write("Two deterministic generation passes left managed output unchanged.\n");
}
