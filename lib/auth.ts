import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { phoneNumber } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";
import { getOtpSender } from "@/lib/otp";
import { normalizePhone, placeholderEmail } from "@/lib/phone";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Phone number + one-time code login. The account is created on the first
 * successful code. The UI calls these endpoints through server actions
 * (server/actions/auth.ts), so no auth client JS ships to the browser.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? siteUrl(),
  session: {
    expiresIn: 60 * 60 * 24 * 60, // 60 days: people rarely want to log in again on their phone
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      role: { type: "string", input: false, defaultValue: "USER" },
      banned: { type: "boolean", input: false, defaultValue: false },
    },
  },
  // Endpoints we don't use (no passwords / emails); closed to reduce attack surface.
  disabledPaths: [
    "/sign-in/phone-number",
    "/phone-number/request-password-reset",
    "/phone-number/reset-password",
    "/sign-up/email",
    "/sign-in/email",
    "/update-user",
    "/change-email",
    "/delete-user",
  ],
  rateLimit: {
    enabled: true,
    storage: "memory",
    window: 60,
    max: 60,
    customRules: {
      "/phone-number/send-otp": { window: 60, max: 3 },
      "/phone-number/verify": { window: 60, max: 10 },
    },
  },
  databaseHooks: {
    session: {
      create: {
        // Blocked users can't start a session.
        before: async (session) => {
          const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { banned: true } });
          if (user?.banned) throw new APIError("FORBIDDEN", { message: "ACCOUNT_BLOCKED" });
        },
      },
    },
  },
  plugins: [
    phoneNumber({
      otpLength: 6,
      expiresIn: 5 * 60,
      allowedAttempts: 5,
      phoneNumberValidator: (phone) => normalizePhone(phone) === phone,
      sendOTP: async ({ phoneNumber: phone, code }, ctx) => {
        // Per-number limits apply however the endpoint is reached.
        const [short, daily] = await Promise.all([
          rateLimit(`otp:phone:${phone}`, 3, 10 * 60),
          rateLimit(`otp:phone-day:${phone}`, 10, 24 * 60 * 60),
        ]);
        if (!short.ok || !daily.ok) throw new APIError("TOO_MANY_REQUESTS", { message: "OTP_RATE_LIMIT" });
        const locale = ctx?.request?.headers.get("x-locale") === "en" ? "en" : "ar";
        await getOtpSender().send(phone, code, locale);
      },
      signUpOnVerification: {
        getTempEmail: placeholderEmail,
        // Name defaults to the phone number until the user sets one.
        getTempName: (phone) => phone,
      },
    }),
    nextCookies(), // must stay last: lets server actions set the session cookie
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
