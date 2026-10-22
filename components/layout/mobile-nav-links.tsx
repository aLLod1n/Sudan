"use client";

import { BriefcaseBusiness, CircleUserRound, House, Search, SquarePlus } from "lucide-react";
import { cn } from "cn";
import { Link, usePathname } from "@/i18n/navigation";
import { AuthLink } from "@/components/auth/auth-link";

const icons = {
  home: House,
  search: Search,
  post: SquarePlus,
  agents: BriefcaseBusiness,
  account: CircleUserRound,
};

/** `auth`: needs an account; guests get the login popup first. */
type Item = { href: string; label: string; icon: keyof typeof icons; auth?: boolean };

export function MobileNavLinks({ items }: { items: Item[] }) {
  const pathname = usePathname();

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-bebe bg-white md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = icons[item.icon];
          const active =
            item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
          // "/listings" shouldn't light up on "/listings/new"
          const isActive = active && !(item.href === "/listings" && pathname.startsWith("/listings/new"));
          const LinkComponent = item.auth ? AuthLink : Link;
          return (
            <li key={item.href}>
              <LinkComponent
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-xs",
                  isActive ? "font-medium text-rausch" : "text-foggy",
                )}
              >
                <Icon className="size-6" strokeWidth={isActive ? 2.2 : 1.6} aria-hidden />
                <span>{item.label}</span>
              </LinkComponent>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
