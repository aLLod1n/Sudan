"use server";

import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { sanitizeLine } from "@/lib/sanitize";
import { getCurrentUser } from "@/lib/session";
import { codeSchema, nameSchema, phoneSchema, type AuthErrorKey } from "@/lib/validators/auth";

type Fail = { ok: false; error: AuthErrorKey };

/** Seconds the UI waits before offering "resend code". */
const RESEND_AFTER = 60;

function mapAuthError(err: unknown): AuthErrorKey {
  if (!(err instanceof APIError)) return "generic";
  const code = (err.body as { code?: string; message?: string } | undefined)?.code;
  const message = (err.body as { message?: string } | undefined)?.message;
  if (message === "ACCOUNT_BLOCKED") return "blocked";
  if (message === "OTP_RATE_LIMIT" || err.status === "TOO_MANY_REQUESTS") return "rateLimited";
  if (code === "OTP_EXPIRED" || code === "OTP_NOT_FOUND") return "expiredCode";
  if (code === "TOO_MANY_ATTEMPTS") return "tooManyAttempts";
  if (code === "INVALID_OTP") return "invalidCode";
  if (code === "INVALID_PHONE_NUMBER") return "invalidPhone";
  return "generic";
}

/** Step 1: send a 6-digit code to the number. */
export async function requestOtp(input: {
  phone: string;
  locale: "ar" | "en";
}): Promise<{ ok: true; phone: string; resendAfter: number } | Fail> {
  const parsed = phoneSchema.safeParse(input.phone);
  if (!parsed.success) return { ok: false, error: "invalidPhone" };
  const phone = parsed.data;

  // Per-IP limit on top of the per-number limits inside sendOTP (lib/auth.ts).
  const ip = await clientIp();
  if (!(await rateLimit(`otp:ip:${ip}`, 10, 60 * 60)).ok) return { ok: false, error: "rateLimited" };

  try {
    const h = new Headers(await headers());
    h.set("x-locale", input.locale);
    await auth.api.sendPhoneNumberOTP({ body: { phoneNumber: phone }, headers: h });
    return { ok: true, phone, resendAfter: RESEND_AFTER };
  } catch (err) {
    const error = mapAuthError(err);
    if (error === "generic") console.error("requestOtp failed", err);
    return { ok: false, error };
  }
}

/** Step 2: check the code; logs in (creating the account on first login). */
export async function verifyOtp(input: {
  phone: string;
  code: string;
}): Promise<{ ok: true; needsName: boolean } | Fail> {
  const phone = phoneSchema.safeParse(input.phone);
  const code = codeSchema.safeParse(input.code);
  if (!phone.success) return { ok: false, error: "invalidPhone" };
  if (!code.success) return { ok: false, error: "invalidCode" };

  try {
    const res = await auth.api.verifyPhoneNumber({
      body: { phoneNumber: phone.data, code: code.data },
      headers: await headers(),
    });
    return { ok: true, needsName: res.user?.name === phone.data };
  } catch (err) {
    const error = mapAuthError(err);
    if (error === "generic") console.error("verifyOtp failed", err);
    return { ok: false, error };
  }
}

/** Step 3 (new accounts) and the account page: set the display name. */
export async function saveName(name: string): Promise<{ ok: true } | Fail> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "generic" };
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) return { ok: false, error: "invalidName" };

  await prisma.user.update({ where: { id: user.id }, data: { name: sanitizeLine(parsed.data) } });
  return { ok: true };
}

export async function signOut(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
}
