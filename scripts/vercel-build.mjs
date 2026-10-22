// Vercel build: apply database migrations (when a database is configured),
// then build Next.js. Without DATABASE_URL the build still succeeds, so a
// first deploy works before the database is connected.

import "dotenv/config";
import { execSync } from "node:child_process";
import { resolveDatabaseUrl } from "../lib/database-url.js";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

const db = resolveDatabaseUrl();
if (db) {
  console.log(`Database: app uses ${db.name}, migrations use ${process.env.DIRECT_URL ? "DIRECT_URL" : db.name}`);
  try {
    run("npx prisma migrate deploy");
  } catch {
    // e.g. the session pool is still held by the previous deployment. The
    // existing schema keeps working; rerun `prisma migrate deploy` if a new
    // migration was part of this release (check /api/health after deploy).
    console.warn("\n⚠ prisma migrate deploy failed — continuing with the existing database schema.\n");
  }
} else {
  console.warn(
    "\n⚠ No database connection string (DATABASE_URL / POSTGRES_URL): skipping migrations.\n" +
      "  Add a Postgres database (Vercel → Storage → Neon), connect it to this project and redeploy.\n",
  );
}

run("npx next build");
