"use client";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";

/** Circular globe button that keeps the current page and filters. */
export function LanguageSwitcher({ label, ariaLabel }: { label: string; ariaLabel: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const target = locale === "ar" ? "en" : "ar";
  const query = Object.fromEntries(searchParams.entries());

  return (
    <Link
      href={{ pathname, query }}
      locale={target}
      hrefLang={target}
      aria-label={`${ariaLabel}: ${label}`}
      className="inline-flex h-10 items-center gap-1.5 rounded-full bg-faint px-3 text-sm font-medium hover:bg-bebe"
    >
      <Globe className="size-4" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}
