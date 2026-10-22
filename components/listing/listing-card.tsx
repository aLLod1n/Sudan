import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { BadgeCheck, BedDouble, Home, Ruler } from "lucide-react";
import { cn } from "cn";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import type { ListingCardData } from "@/lib/data/listings";
import { formatNumber, localName } from "@/lib/format";
import { Price } from "./price";

/**
 * Result card (DESIGN.md "Property Listing Card"): flat white surface, no
 * border or shadow, 1:1 photo with 12px radius, verified pill top-start.
 */
export async function ListingCard({
  listing,
  priority = false,
  className,
}: {
  listing: ListingCardData;
  priority?: boolean;
  className?: string;
}) {
  const [locale, t, tType] = await Promise.all([
    getLocale(),
    getTranslations("Listing"),
    getTranslations("Enums.PropertyType"),
  ]);

  const separator = locale === "ar" ? "، " : ", ";
  const location = localName(listing.neighbourhood, locale) + separator + localName(listing.city, locale);

  return (
    <article className={cn("group relative overflow-hidden rounded-xl bg-card has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-hof", className)}>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-deco">
        {listing.photoUrl ? (
          <Image
            src={listing.photoUrl}
            alt={t("photoAlt", { title: listing.title })}
            fill
            priority={priority}
            quality={60}
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, (min-width: 480px) 45vw, 85vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-foggy">
            <Home className="size-10" aria-hidden />
            <span className="sr-only">{t("noPhoto")}</span>
          </div>
        )}
        {listing.verified && (
          <Badge variant="overlay" className="absolute start-3 top-3 gap-1">
            <BadgeCheck className="text-hof" aria-hidden />
            {t("verified")}
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-0.5 p-3">
        <p className="truncate text-sm font-medium">
          {t("headline", { type: tType(listing.propertyType), deal: listing.dealType })} · {location}
        </p>
        <h3 dir="auto" className="truncate text-start text-sm text-foggy">
          {/* Whole card is clickable via the stretched link */}
          <Link href={`/listings/${listing.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {listing.title}
          </Link>
        </h3>
        {(listing.rooms !== null || listing.areaM2 !== null) && (
          <p className="flex items-center gap-3 text-sm text-foggy">
            {listing.rooms !== null && (
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <BedDouble className="size-3.5" aria-hidden />
                {t("rooms", { count: listing.rooms })}
              </span>
            )}
            {listing.areaM2 !== null && (
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <Ruler className="size-3.5" aria-hidden />
                {t("area", { value: formatNumber(listing.areaM2, locale) })}
              </span>
            )}
          </p>
        )}
        <Price price={listing.price} currency={listing.currency} dealType={listing.dealType} className="mt-1 text-sm" />
      </div>
    </article>
  );
}
