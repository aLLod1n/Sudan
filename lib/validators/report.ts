import { z } from "zod";
import { REPORT_REASONS } from "@/lib/constants";

/** Shared by the report form (client) and the server action. Messages are i18n keys. */
export const reportSchema = z.object({
  listingId: z.string().regex(/^[a-z0-9]{20,40}$/),
  reason: z.enum(REPORT_REASONS, { error: "errorReason" }),
  comment: z.string().trim().max(500, { error: "errorComment" }).optional().default(""),
});

export type ReportInput = z.infer<typeof reportSchema>;
