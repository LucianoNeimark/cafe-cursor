import { spawnSync } from "node:child_process";
import { join } from "node:path";

const requestedTarget = process.argv[2];
const useProductionSchema = requestedTarget === "production" || (
  requestedTarget !== "local" && (
    process.env.PRISMA_SCHEMA === "production" || process.env.VERCEL === "1"
  )
);
const schema = useProductionSchema
  ? "prisma/schema.production.prisma"
  : "prisma/schema.prisma";
const prismaBinary = join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "prisma.cmd" : "prisma"
);

console.log(`Generating Prisma Client from ${schema}`);

const result = spawnSync(prismaBinary, ["generate", "--schema", schema], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
