// Vercel build: apply database migrations (when a database is configured),
// then build Next.js. Without DATABASE_URL the build still succeeds, so a
// first deploy works before the database is connected.

import "dotenv/config";
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

if (process.env.DATABASE_URL) {
  run("npx prisma migrate deploy");
} else {
  console.warn(
    "\n⚠ DATABASE_URL is not set: skipping database migrations.\n" +
      "  Add a Postgres database (Vercel → Storage → Neon) and redeploy.\n",
  );
}

run("npx next build");
