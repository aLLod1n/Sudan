import { prisma } from "./prisma";

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

/**
 * Fixed-window rate limiter backed by Postgres, so it works across
 * server instances without Redis. Counts one hit per call.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);

  // Single atomic upsert: start a new window if the old one ended,
  // otherwise increment the counter.
  const rows = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO "rate_limit" ("key", "count", "resetAt")
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "rate_limit"."resetAt" <= ${now} THEN 1 ELSE "rate_limit"."count" + 1 END,
      "resetAt" = CASE WHEN "rate_limit"."resetAt" <= ${now} THEN ${resetAt} ELSE "rate_limit"."resetAt" END
    RETURNING "count", "resetAt"
  `;

  const row = rows[0];
  if (row.count > limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((row.resetAt.getTime() - now.getTime()) / 1000)),
    };
  }
  return { ok: true };
}

/** Removes windows that ended more than a day ago. Called by the cron job. */
export async function pruneRateLimits() {
  await prisma.rateLimit.deleteMany({
    where: { resetAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });
}
