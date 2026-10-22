"use client";

import { Link, getPathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useAuth } from "./auth-provider";

/**
 * Link to a page that needs an account (Post, Account). Logged-out visitors
 * get the login popup first, then continue to the page. Without JS it is a
 * normal link and the page itself redirects to /login.
 */
export function AuthLink({ href, ...props }: React.ComponentProps<typeof Link> & { href: string }) {
  const { user, openLogin } = useAuth();
  const locale = useLocale();

  return (
    <Link
      href={href}
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        if (user === null) {
          event.preventDefault();
          openLogin(getPathname({ href, locale }));
        }
      }}
    />
  );
}
