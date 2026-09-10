import { spawnSync } from "node:child_process";

const result = spawnSync("pnpm", ["baseline:verify"], { stdio: "inherit" });
process.exitCode = result.status ?? 1;
