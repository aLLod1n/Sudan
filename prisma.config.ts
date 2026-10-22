import "dotenv/config";
import { defineConfig } from "prisma/config";
import { resolveDatabaseUrl } from "./lib/database-url.js";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations need a session connection: DIRECT_URL (e.g. Supabase session
    // pooler, port 5432) when the app itself uses a transaction pooler.
    // Optional so `prisma generate` (run on every npm install) works without a database.
    url: process.env.DIRECT_URL || resolveDatabaseUrl()?.url || "",
  },
});
