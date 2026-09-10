import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const complete = process.argv[2] === "--complete";

/**
 * @param {string} label
 * @param {string} command
 * @param {string[]} arguments_
 */
function run(label, command, arguments_) {
  process.stdout.write(`\n[baseline] ${label}\n`);
  const result = spawnSync(command, arguments_, {
    cwd: root,
    env: {
      ...process.env,
      BUF_CACHE_DIR: path.join(root, "tooling/engineering-baseline/.cache/buf"),
      PATH: `${path.join(root, "node_modules/.bin")}${path.delimiter}${process.env.PATH ?? ""}`,
      XDG_CACHE_HOME: path.join(root, "tooling/engineering-baseline/.cache"),
    },
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("Spec Kit components and lifecycle", process.execPath, [
  "scripts/engineering-baseline/bundle.mjs",
  "check",
]);
run("Specification and gates", process.execPath, [
  "--import",
  "tsx",
  "tooling/engineering-baseline/src/cli.ts",
  "specification",
]);
run("Traceability", process.execPath, [
  "--import",
  "tsx",
  "tooling/engineering-baseline/src/cli.ts",
  "traceability-check",
]);
run("Generated contract drift", process.execPath, [
  "scripts/engineering-baseline/generate-contracts.mjs",
  "--check",
]);

if (complete) {
  run("Contract profiles", process.execPath, [
    "scripts/engineering-baseline/contracts.mjs",
    "check",
  ]);
  run("Formatting", path.join(root, "node_modules/.bin/prettier"), [".", "--check"]);
  run("Lint", path.join(root, "node_modules/.bin/eslint"), ["."]);
  run("Typecheck", path.join(root, "node_modules/.bin/tsc"), ["--noEmit"]);
  run("Vitest", path.join(root, "node_modules/.bin/vitest"), ["run"]);
  run("Cucumber dry run", process.execPath, [
    "--import",
    "tsx",
    "./node_modules/@cucumber/cucumber/bin/cucumber.js",
    "--config",
    "cucumber.mjs",
    "--profile",
    "dry",
  ]);
  run("Cucumber executable behavior", process.execPath, [
    "--import",
    "tsx",
    "./node_modules/@cucumber/cucumber/bin/cucumber.js",
    "--config",
    "cucumber.mjs",
    "--profile",
    "default",
  ]);
  run("Playwright", path.join(root, "node_modules/.bin/playwright"), [
    "test",
    "--pass-with-no-tests",
  ]);
  run("Build", path.join(root, "node_modules/.bin/tsc"), ["-p", "tsconfig.build.json"]);
  run("Agent skills", process.execPath, ["scripts/validate-skills.mjs"]);
}

process.stdout.write("\nEngineering baseline verification passed.\n");
