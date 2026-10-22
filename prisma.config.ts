import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Optional here so `prisma generate` (run on every `npm install`, e.g. on
    // Vercel) works without a database. Migrate/seed still fail clearly if unset.
    url: process.env.DATABASE_URL ?? "",
  },
});
