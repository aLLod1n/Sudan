// Shared by the app, prisma.config.ts and scripts/vercel-build.mjs (plain JS so
// all three can import it).
//
// Vercel's database integrations name the connection string differently
// (DATABASE_URL, POSTGRES_URL, STORAGE_DATABASE_URL, …), so accept any of them.

const PREFERRED = ["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL", "DATABASE_POSTGRES_URL"];

/** Names of environment variables that look like a database connection string. */
export function databaseEnvNames() {
  return Object.keys(process.env).filter((k) => /(DATABASE|POSTGRES)_(URL|PRISMA_URL)$/.test(k) && process.env[k]);
}

/** @returns {{ name: string, url: string } | null} */
export function resolveDatabaseUrl() {
  for (const name of PREFERRED) {
    if (process.env[name]) return { name, url: process.env[name] };
  }
  // Prefixed variants from custom integration names, e.g. STORAGE_DATABASE_URL.
  const name = databaseEnvNames().find((k) => !k.includes("UNPOOLED") && !k.includes("NON_POOLING"));
  return name ? { name, url: process.env[name] } : null;
}
