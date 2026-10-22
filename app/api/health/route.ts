import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";
import { databaseEnvNames, resolveDatabaseUrl } from "@/lib/database-url.js";

// GET /api/health — deployment check: is the database reachable and are the
// required settings present? Never returns secret values.
export const dynamic = "force-dynamic";

function describeDatabaseUrl() {
  const db = resolveDatabaseUrl();
  if (!db) return "missing";
  try {
    const host = new URL(db.url).hostname;
    if (["localhost", "127.0.0.1"].includes(host) && process.env.VERCEL) return `${db.name} points to localhost (wrong on Vercel)`;
    return `set via ${db.name} (${host})`;
  } catch {
    return `${db.name} is not a valid URL`;
  }
}

export async function GET() {
  let database: string;
  try {
    const cities = await prisma.city.count();
    database = cities > 0 ? `ok (${cities} cities)` : "ok, but empty — run the seed";
  } catch (err) {
    const code = (err as { code?: string }).code;
    const message = err instanceof Error ? err.message.split("\n").filter(Boolean).pop() : String(err);
    database = `error${code ? ` ${code}` : ""}: ${message?.slice(0, 200)}`;
  }

  const settings = {
    DATABASE_URL: describeDatabaseUrl(),
    // Names only (no values), to spot integrations that use another name.
    databaseVariablesFound: databaseEnvNames(),
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "set" : "missing",
    ADMIN_PHONE: process.env.ADMIN_PHONE ? "set" : "missing",
    OTP_PROVIDER: process.env.OTP_PROVIDER ?? "missing (defaults to console)",
    STORAGE_DRIVER: process.env.STORAGE_DRIVER ?? "local",
    siteUrl: siteUrl(),
  };

  const ok = database.startsWith("ok");
  return Response.json({ ok, database, settings }, { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
