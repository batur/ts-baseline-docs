import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (process.argv.includes("migrate") && !databaseUrl) {
  throw new Error("DATABASE_URL is required to run Drizzle migrations.");
}

export default defineConfig({
  dbCredentials: {
    url: databaseUrl ?? "",
  },
  dialect: "postgresql",
  out: "./drizzle/migrations",
  schema: "./src/shared/database/schema/**/*.ts",
  strict: true,
  verbose: true,
});
