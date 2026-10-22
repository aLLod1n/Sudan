import { getTranslations } from "next-intl/server";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "cn";
import { Link } from "@/i18n/navigation";

/** Server-rendered pagination; every page is a real, shareable link. */
export async function Pagination({
  page,
  pageCount,
  queryFor,
}: {
  page: number;
  pageCount: number;
  queryFor: (page: number) => Record<string, string>;
}) {
  if (pageCount <= 1) return null;
  const t = await getTranslations("Search");

  // Window of up to 5 page numbers around the current one.
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, i) => start + i);
  const href = (p: number) => ({ pathname: "/listings", query: queryFor(p) });
  const item = "flex size-10 items-center justify-center rounded-full text-sm";

  return (
    <nav aria-label={t("pagination")} className="flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={href(page - 1)} className={cn(item, "hover:bg-white")} aria-label={t("previous")} rel="prev">
          <ChevronLeft className="size-4 rtl:-scale-x-100" aria-hidden />
        </Link>
      ) : (
        <span className={cn(item, "text-grey-500")} aria-hidden>
          <ChevronLeft className="size-4 rtl:-scale-x-100" />
        </span>
      )}
      {pages.map((p) =>
        p === page ? (
          <span key={p} aria-current="page" className={cn(item, "bg-hof font-medium text-white")}>
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            className={cn(item, "hover:bg-white")}
            aria-label={t("pageOf", { page: p, total: pageCount })}
          >
            {p}
          </Link>
        ),
      )}
      {page < pageCount ? (
        <Link href={href(page + 1)} className={cn(item, "hover:bg-white")} aria-label={t("next")} rel="next">
          <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden />
        </Link>
      ) : (
        <span className={cn(item, "text-grey-500")} aria-hidden>
          <ChevronRight className="size-4 rtl:-scale-x-100" />
        </span>
      )}
    </nav>
  );
}
