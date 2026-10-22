import { z } from "zod";
import { normalizePhone, toLatinDigits } from "@/lib/phone";

// Shared by the login form (client) and the server actions.
// Error messages are keys in the "Auth.errors" translations.

/** Accepts local (0912345678 / 912345678) or international input, outputs E.164. */
export const phoneSchema = z.string().transform((value, ctx) => {
  const phone = normalizePhone(value);
  if (!phone) {
    ctx.addIssue({ code: "custom", message: "invalidPhone" });
    return z.NEVER;
  }
  return phone;
});

export const codeSchema = z
  .string()
  .transform((v) => toLatinDigits(v).replace(/\D/g, ""))
  .pipe(z.string().length(6, { error: "invalidCode" }));

export const nameSchema = z
  .string()
  .trim()
  .min(2, { error: "invalidName" })
  .max(60, { error: "invalidName" })
  // At least one letter (Arabic or Latin), not only digits/symbols.
  .regex(/[\p{L}]/u, { error: "invalidName" });

export type AuthErrorKey =
  | "invalidPhone"
  | "invalidCode"
  | "expiredCode"
  | "tooManyAttempts"
  | "rateLimited"
  | "blocked"
  | "invalidName"
  | "generic";
