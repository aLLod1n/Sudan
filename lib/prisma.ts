import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { resolveDatabaseUrl } from "./database-url.js";

// Reuse one client across hot reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaPg({
    connectionString: resolveDatabaseUrl()?.url,
    // Serverless (Vercel) runs many small instances: keep each pool tiny so they
    // don't exhaust the database's connection limit. Use a transaction pooler
    // (e.g. Supabase port 6543) as DATABASE_URL there.
    max: process.env.VERCEL ? 2 : 10,
    idleTimeoutMillis: 10_000,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
