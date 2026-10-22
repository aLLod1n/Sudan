"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/server/actions/auth";
import { useAuth } from "./auth-provider";

type Labels = { account: string; login: string; myListings: string; post: string; admin: string; logout: string };

/**
 * Header pill (hamburger + avatar). Logged out: opens the login popup.
 * Logged in: small menu with account links.
 */
export function HeaderAccount({ labels }: { labels: Labels }) {
  const { user, openLogin, refresh } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const initial = user && !user.needsName ? user.name.trim().charAt(0) : null;

  return (
    <div ref={rootRef} className="relative hidden md:block">
      <button
        type="button"
        aria-label={user ? labels.account : labels.login}
        aria-haspopup={user ? "menu" : "dialog"}
        aria-expanded={user ? open : undefined}
        onClick={() => (user ? setOpen((o) => !o) : user === null && openLogin())}
        className="flex h-11 items-center gap-2 rounded-full border border-deco bg-white ps-3 pe-1.5 transition-shadow hover:shadow-tooltip"
      >
        <Menu className="size-4" aria-hidden />
        <span className="flex size-8 items-center justify-center rounded-full bg-foggy text-sm font-semibold text-white data-[user=true]:bg-hof" data-user={!!user}>
          {initial ?? <UserRound className="size-4" aria-hidden />}
        </span>
      </button>

      {user && open && (
        <div role="menu" className="absolute end-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl bg-white py-2 shadow-menu">
          <p className="truncate px-4 py-2 text-sm font-semibold" dir="auto">
            {user.name}
          </p>
          <div className="my-1 h-px bg-bebe" />
          {[
            { href: "/account", label: labels.account },
            { href: "/account#listings", label: labels.myListings },
            { href: "/listings/new", label: labels.post },
            ...(user.role === "ADMIN" ? [{ href: "/admin", label: labels.admin }] : []),
          ].map((item) => (
            <Link
              key={item.href}
              role="menuitem"
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm hover:bg-faint"
            >
              {item.label}
            </Link>
          ))}
          <div className="my-1 h-px bg-bebe" />
          <button
            type="button"
            role="menuitem"
            className="block w-full px-4 py-2.5 text-start text-sm hover:bg-faint"
            onClick={async () => {
              setOpen(false);
              await signOut();
              await refresh();
              router.refresh();
            }}
          >
            {labels.logout}
          </button>
        </div>
      )}
    </div>
  );
}
