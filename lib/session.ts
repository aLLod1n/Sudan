import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getPathname, redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Role } from "@/generated/prisma/enums";

export type CurrentUser = {
  id: string;
  name: string;
  phone: string;
  role: Role;
  createdAt: Date;
  /** True until the user sets a real name (it defaults to the phone number). */
  needsName: boolean;
};

/** The logged-in user, or null. Blocked users count as logged out. Cached per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.banned) return null;
  const { user } = session;
  const phone = user.phoneNumber ?? "";
  return {
    id: user.id,
    name: user.name,
    phone,
    role: (user.role as Role) ?? "USER",
    createdAt: user.createdAt,
    needsName: user.name === phone,
  };
});

/** For pages: redirects to /login (then back) when logged out. */
export async function requireUser(locale: Locale, next: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  // `next` is localized so an English user comes back to the English page.
  if (!user) return redirect({ href: { pathname: "/login", query: { next: getPathname({ href: next, locale }) } }, locale });
  return user;
}

export async function requireAdmin(locale: Locale, next: string): Promise<CurrentUser> {
  const user = await requireUser(locale, next);
  if (user.role !== "ADMIN") return redirect({ href: "/", locale });
  return user;
}
