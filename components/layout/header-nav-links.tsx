"use client";

import { useSearchParams } from "next/navigation";
import { cn } from "cn";
import { Link, usePathname } from "@/i18n/navigation";

type Item = { pathname: string; deal?: "SALE" | "RENT"; label: string };

/**
 * Centre tabs (desktop): "For sale", "For rent", "Real estate agents".
 * Active tab gets the 2px #222 underline from the design.
 */
export function HeaderNavLinks({ items }: { items: Item[] }) {
  const pathname = usePathname();
  const deal = useSearchParams().get("deal");

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {items.map((item) => {
        const onPath = pathname === item.pathname || pathname.startsWith(`${item.pathname}/`);
        // Listing tabs are only "active" on the search page with that deal type.
        const active = item.deal ? pathname === item.pathname && deal === item.deal : onPath;
        return (
          <Link
            key={item.label}
            href={item.deal ? { pathname: item.pathname, query: { deal: item.deal } } : item.pathname}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative py-2 text-ui font-medium whitespace-nowrap transition-colors",
              active
                ? "text-hof after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-hof"
                : "text-foggy hover:text-hof",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
