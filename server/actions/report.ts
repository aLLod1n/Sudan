"use server";

import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { sanitizeText } from "@/lib/sanitize";
import { reportSchema } from "@/lib/validators/report";

export type ReportState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; error: "errorReason" | "errorComment" | "errorRateLimit" | "errorGeneric" };

/**
 * Anyone can report a listing (no account needed), limited to 5 reports per
 * hour per IP and one open report per listing per IP-day.
 */
export async function reportListing(_prev: ReportState, formData: FormData): Promise<ReportState> {
  const parsed = reportSchema.safeParse({
    listingId: formData.get("listingId"),
    reason: formData.get("reason") ?? undefined,
    comment: formData.get("comment") ?? undefined,
  });
  if (!parsed.success) {
    const code = parsed.error.issues[0]?.message;
    return { status: "error", error: code === "errorComment" ? "errorComment" : code === "errorReason" ? "errorReason" : "errorGeneric" };
  }
  const { listingId, reason, comment } = parsed.data;

  const ip = await clientIp();
  const [hourly, perListing] = await Promise.all([
    rateLimit(`report:${ip}`, 5, 60 * 60),
    rateLimit(`report:${ip}:${listingId}`, 1, 24 * 60 * 60),
  ]);
  if (!hourly.ok) return { status: "error", error: "errorRateLimit" };
  // Same person reporting the same listing again: thank them, store nothing.
  if (!perListing.ok) return { status: "success" };

  try {
    const exists = await prisma.listing.count({ where: { id: listingId } });
    if (!exists) return { status: "error", error: "errorGeneric" };
    // reporterId is filled in once login exists (step 3 of the new order).
    await prisma.report.create({
      data: { listingId, reason, comment: comment ? sanitizeText(comment) : null },
    });
    return { status: "success" };
  } catch (err) {
    console.error("reportListing failed", err);
    return { status: "error", error: "errorGeneric" };
  }
}
