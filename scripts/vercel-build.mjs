// Vercel build: apply database migrations (when a database is configured),
// then build Next.js. Without DATABASE_URL the build still succeeds, so a
// first deploy works before the database is connected.

import "dotenv/config";
import { execSync } from "node:child_process";
import { resolveDatabaseUrl } from "../lib/database-url.js";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

const db = resolveDatabaseUrl();
if (db) {
  console.log(`Database: using ${db.name}`);
  run("npx prisma migrate deploy");
} else {
  console.warn(
    "\n⚠ No database connection string (DATABASE_URL / POSTGRES_URL): skipping migrations.\n" +
      "  Add a Postgres database (Vercel → Storage → Neon), connect it to this project and redeploy.\n",
  );
}

run("npx next build");
