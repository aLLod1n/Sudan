import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";

// GET /api/health — deployment check: is the database reachable and are the
// required settings present? Never returns secret values.
export const dynamic = "force-dynamic";

function describeDatabaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return "missing";
  try {
    const host = new URL(raw).hostname;
    if (["localhost", "127.0.0.1"].includes(host) && process.env.VERCEL) return "points to localhost (wrong on Vercel)";
    return `set (${host})`;
  } catch {
    return "invalid URL";
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
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "set" : "missing",
    ADMIN_PHONE: process.env.ADMIN_PHONE ? "set" : "missing",
    OTP_PROVIDER: process.env.OTP_PROVIDER ?? "missing (defaults to console)",
    STORAGE_DRIVER: process.env.STORAGE_DRIVER ?? "local",
    siteUrl: siteUrl(),
  };

  const ok = database.startsWith("ok");
  return Response.json({ ok, database, settings }, { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
