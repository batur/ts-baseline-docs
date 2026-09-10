import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();

/**
 * @param {string} command
 * @param {string[]} arguments_
 */
function run(command, arguments_) {
  const result = spawnSync(command, arguments_, {
    cwd: root,
    env: {
      ...process.env,
      ASYNCAPI_DISABLE_ANALYTICS: "true",
      BUF_CACHE_DIR: path.join(root, "tooling/engineering-baseline/.cache/buf"),
      PATH: `${path.join(root, "node_modules/.bin")}${path.delimiter}${process.env.PATH ?? ""}`,
      XDG_CACHE_HOME: path.join(root, "tooling/engineering-baseline/.cache"),
    },
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function lint() {
  run(path.join(root, "node_modules/.bin/redocly"), [
    "lint",
    "contracts/openapi/baseline-api.yaml",
  ]);
  run(path.join(root, "node_modules/.bin/asyncapi"), [
    "validate",
    "tooling/engineering-baseline/fixtures/contracts/asyncapi/current.yaml",
    "--fail-severity",
    "error",
  ]);
  run(path.join(root, "node_modules/.bin/graphql-inspector"), [
    "validate",
    "tooling/engineering-baseline/fixtures/contracts/graphql/operations.graphql",
    "tooling/engineering-baseline/fixtures/contracts/graphql/current.graphql",
    "--silent",
  ]);
  run(path.join(root, "node_modules/.bin/buf"), [
    "lint",
    "tooling/engineering-baseline/fixtures/contracts/proto/current.proto",
  ]);
  run(process.execPath, ["--import", "tsx", "tooling/engineering-baseline/src/cli.ts", "profiles"]);
}

function generate() {
  run(process.execPath, ["scripts/engineering-baseline/generate-contracts.mjs"]);
  run(process.execPath, [
    "--import",
    "tsx",
    "tooling/engineering-baseline/src/generation/generate-profiles.ts",
  ]);
  run(path.join(root, "node_modules/.bin/graphql-codegen"), ["--config", "codegen.ts"]);
  run(path.join(root, "node_modules/.bin/buf"), [
    "generate",
    "tooling/engineering-baseline/fixtures/contracts/proto/current.proto",
    "--template",
    "buf.gen.yaml",
  ]);
}

function checkGenerated() {
  run(process.execPath, ["scripts/engineering-baseline/generate-contracts.mjs", "--check"]);
}

function breaking() {
  run(process.execPath, ["--import", "tsx", "tooling/engineering-baseline/src/cli.ts", "profiles"]);
}

function testContracts() {
  run(path.join(root, "node_modules/.bin/vitest"), [
    "run",
    "tooling/engineering-baseline/src/contracts",
    "tests/contracts",
  ]);
}

const action = process.argv[2];
if (action === "lint") lint();
else if (action === "generate") generate();
else if (action === "check-generated") checkGenerated();
else if (action === "breaking") breaking();
else if (action === "test") testContracts();
else if (action === "check") {
  lint();
  checkGenerated();
  breaking();
  testContracts();
} else {
  process.stderr.write("Usage: contracts.mjs lint|generate|check-generated|breaking|test|check\n");
  process.exitCode = 2;
}
