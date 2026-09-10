import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const action = process.argv[2] ?? "check";
const allowed = new Set(["check", "validate", "lifecycle"]);

if (!allowed.has(action)) {
  process.stderr.write("Usage: bundle.mjs check|validate|lifecycle\n");
  process.exitCode = 2;
} else {
  const files =
    action === "validate"
      ? ["tooling/engineering-baseline/src/bundle/components.test.ts"]
      : action === "lifecycle"
        ? ["tooling/engineering-baseline/src/bundle/lifecycle.test.ts"]
        : [
            "tooling/engineering-baseline/src/bundle/components.test.ts",
            "tooling/engineering-baseline/src/bundle/lifecycle.test.ts",
          ];
  const result = spawnSync(path.join(root, "node_modules/.bin/vitest"), ["run", ...files], {
    cwd: root,
    stdio: "inherit",
  });
  process.exitCode = result.status ?? 1;
}
