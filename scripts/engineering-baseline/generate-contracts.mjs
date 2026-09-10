import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { parse, stringify } from "yaml";

const root = process.cwd();
const sourcePath = path.join(root, "contracts/openapi/baseline-api.yaml");
const outputRoot = path.join(root, "src/generated/openapi");
const manifestPath = path.join(outputRoot, "generated-manifest.json");

/** @param {string | NodeJS.ArrayBufferView} value */
function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

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
    else if (entry.isFile() && relative !== "generated-manifest.json") files.push(relative);
  }
  return files;
}

async function postprocessGeneratedImports() {
  for (const relative of await filesRecursively(outputRoot)) {
    if (!relative.endsWith(".ts")) continue;
    const file = path.join(outputRoot, relative);
    const source = await readFile(file, "utf8");
    const updated = source.replaceAll(
      /(from\s+['"])(\.\.?\/[^'"]+?)(['"])/gu,
      (_match, start, specifier, end) => {
        if (/\.[cm]?[jt]sx?$/u.test(specifier)) return `${start}${specifier}${end}`;
        if (specifier === "./models") return `${start}./models/index.js${end}`;
        return `${start}${specifier}.js${end}`;
      },
    );
    await writeFile(file, updated.replace(/\n+$/u, "\n"), "utf8");
  }
}

/** @param {string} source */
async function expectedManifest(source) {
  const files = await filesRecursively(outputRoot);
  /** @type {Record<string, string>} */
  const generated = {};
  for (const relative of files)
    generated[relative.replaceAll("\\", "/")] = digest(
      await readFile(path.join(outputRoot, relative)),
    );
  return {
    generated,
    schemaVersion: 1,
    source: "contracts/openapi/baseline-api.yaml",
    sourceSha256: digest(source),
    tool: "orval@8.30.0",
  };
}

async function check() {
  const source = await readFile(sourcePath, "utf8");
  const document = parse(source);
  const publishedYaml = await readFile(path.join(root, "docs/openapi/openapi.yaml"), "utf8").catch(
    () => "",
  );
  const publishedJson = await readFile(path.join(root, "docs/openapi/openapi.json"), "utf8").catch(
    () => "",
  );
  const manifest = JSON.parse(await readFile(manifestPath, "utf8").catch(() => "{}"));
  const current = await expectedManifest(source);
  const expectedYaml = stringify(document, { lineWidth: 100 });
  const expectedJson = `${JSON.stringify(document, null, 2)}\n`;
  if (
    publishedYaml !== expectedYaml ||
    publishedJson !== expectedJson ||
    JSON.stringify(manifest) !== JSON.stringify(current)
  ) {
    process.stderr.write("Generated OpenAPI artifacts are stale. Run pnpm contracts:generate.\n");
    process.exitCode = 1;
    return;
  }
  process.stdout.write("Generated OpenAPI artifacts are current.\n");
}

async function generate() {
  const source = await readFile(sourcePath, "utf8");
  const document = parse(source);
  await mkdir(path.join(root, "docs/openapi"), { recursive: true });
  await writeFile(
    path.join(root, "docs/openapi/openapi.yaml"),
    stringify(document, { lineWidth: 100 }),
    "utf8",
  );
  await writeFile(
    path.join(root, "docs/openapi/openapi.json"),
    `${JSON.stringify(document, null, 2)}\n`,
    "utf8",
  );

  const orval = spawnSync(
    path.join(root, "node_modules/.bin/orval"),
    ["--config", "orval.config.ts"],
    { cwd: root, encoding: "utf8" },
  );
  if (orval.status !== 0) {
    process.stderr.write(orval.stderr || orval.stdout);
    process.exitCode = orval.status ?? 1;
    return;
  }
  await postprocessGeneratedImports();
  await writeFile(
    manifestPath,
    `${JSON.stringify(await expectedManifest(source), null, 2)}\n`,
    "utf8",
  );
  process.stdout.write("Contract-first OpenAPI artifacts generated with Orval 8.30.0.\n");
}

if (process.argv[2] === "--check") await check();
else await generate();
