import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  BadgeCheck,
  BedDouble,
  Building,
  Car,
  Droplets,
  Eye,
  Layers,
  Ruler,
  ShieldAlert,
  Sofa,
  Zap,
} from "lucide-react";
import { getPathname, Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContactButtons } from "@/components/listing/contact-buttons";
import { Gallery } from "@/components/listing/gallery";
import { ListingRow } from "@/components/listing/listing-row";
import { Price } from "@/components/listing/price";
import { ReportDialog } from "@/components/listing/report-dialog";
import { ViewTracker } from "@/components/listing/view-tracker";
import { getListingDetail, getSimilarListings, type ListingDetail } from "@/lib/data/listing-detail";
import { fileUrl } from "@/lib/storage";
import { formatDate, formatNumber, localName } from "@/lib/format";
import { formatPhone, toWhatsAppNumber } from "@/lib/phone";
import { REPORT_REASONS } from "@/lib/constants";
import { siteUrl } from "@/lib/site";

async function describe(listing: ListingDetail, locale: Locale) {
  const [t, tType, tCur] = await Promise.all([
    getTranslations({ locale, namespace: "Listing" }),
    getTranslations({ locale, namespace: "Enums.PropertyType" }),
    getTranslations({ locale, namespace: "Enums.Currency" }),
  ]);
  const sep = locale === "ar" ? "، " : ", ";
  const location = localName(listing.neighbourhood, locale) + sep + localName(listing.city, locale);
  const headline = t("headline", { type: tType(listing.propertyType), deal: listing.dealType });
  const price = `${formatNumber(listing.price, locale)} ${tCur(listing.currency)}${listing.dealType === "RENT" ? ` ${t("perMonth")}` : ""}`;
  return { headline, location, price };
}

export async function generateMetadata({ params }: PageProps<"/[locale]/listings/[id]">): Promise<Metadata> {
  const { locale, id } = (await params) as { locale: Locale; id: string };
  const listing = await getListingDetail(id);
  if (!listing?.visibility) return {};

  const { headline, location, price } = await describe(listing, locale);
  const description = `${headline} · ${location} · ${price}. ${listing.description.slice(0, 140)}`;
  const path = (l: Locale) => getPathname({ href: `/listings/${id}`, locale: l });
  const ogImage = `${siteUrl()}/api/og/listings/${id}`;

  return {
    title: listing.title,
    description,
    alternates: { canonical: path(locale), languages: { ar: path("ar"), en: path("en") } },
    robots: listing.visibility === "unavailable" ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "article",
      url: siteUrl() + path(locale),
      title: `${listing.title} — ${price}`,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: listing.title }],
    },
    twitter: { card: "summary_large_image", images: [ogImage] },
  };
}

export default async function ListingPage({ params }: PageProps<"/[locale]/listings/[id]">) {
  const { locale, id } = (await params) as { locale: Locale; id: string };
  setRequestLocale(locale);

  const listing = await getListingDetail(id);
  if (!listing?.visibility) notFound();

  const [t, tl, tEnumReport, tCommon, tReport, tDeal, tType] = await Promise.all([
    getTranslations("ListingPage"),
    getTranslations("Listing"),
    getTranslations("Enums.ReportReason"),
    getTranslations("Common"),
    getTranslations("Report"),
    getTranslations("Enums.DealType"),
    getTranslations("Enums.PropertyType"),
  ]);
  const { headline, location } = await describe(listing, locale);

  if (listing.visibility === "unavailable") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
        <Building className="size-12 text-foggy" strokeWidth={1.4} aria-hidden />
        <h1 className="text-heading-sm font-semibold">{t("unavailableTitle")}</h1>
        <p className="text-foggy">{t("unavailableBody")}</p>
        <Link
          href={{ pathname: "/listings", query: { city: listing.city.slug, type: listing.propertyType } }}
          className={buttonVariants()}
        >
          {t("browseSimilar")}
        </Link>
      </div>
    );
  }

  const similar = await getSimilarListings(listing);
  const listingUrl = siteUrl() + getPathname({ href: `/listings/${id}`, locale });
  const whatsappNumber = toWhatsAppNumber(listing.agent?.whatsapp ?? listing.contactPhone);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    t("whatsappMessage", { title: listing.title, url: listingUrl }),
  )}`;
  const contactLabels = {
    call: t("call"),
    callNumber: t("callNumber", { phone: formatPhone(listing.contactPhone) }),
    whatsapp: t("whatsapp"),
  };

  const facts = [
    listing.rooms !== null && { icon: BedDouble, label: tl("rooms", { count: listing.rooms }) },
    listing.areaM2 !== null && { icon: Ruler, label: tl("area", { value: formatNumber(listing.areaM2, locale) }) },
    listing.floor !== null && {
      icon: Layers,
      label: listing.floor === 0 ? `${t("floor")}: ${t("groundFloor")}` : tl("floor", { value: listing.floor }),
    },
  ].filter(Boolean) as { icon: typeof BedDouble; label: string }[];

  const features = [
    listing.furnished && { icon: Sofa, label: t("furnished") },
    listing.hasElectricity && { icon: Zap, label: t("electricity") },
    listing.hasWaterTank && { icon: Droplets, label: t("waterTank") },
    listing.hasParking && { icon: Car, label: t("parking") },
  ].filter(Boolean) as { icon: typeof Sofa; label: string }[];

  const details: [string, string][] = [
    [t("dealType"), tDeal(listing.dealType)],
    [t("propertyType"), tType(listing.propertyType)],
    ...(listing.rooms !== null ? [[t("rooms"), formatNumber(listing.rooms, locale)] as [string, string]] : []),
    ...(listing.areaM2 !== null ? [[t("area"), tl("area", { value: formatNumber(listing.areaM2, locale) })] as [string, string]] : []),
    ...(listing.floor !== null
      ? [[t("floor"), listing.floor === 0 ? t("groundFloor") : formatNumber(listing.floor, locale)] as [string, string]]
      : []),
  ];

  const lister = listing.agent
    ? { name: listing.agent.officeName, role: t("agent"), logo: listing.agent.logoKey ? fileUrl(listing.agent.logoKey) : null }
    : { name: listing.owner.name, role: t("privateOwner"), logo: null };

  return (
    <>
      <ViewTracker listingId={listing.id} />
      <article className="mx-auto max-w-[1120px] px-4 pt-0 pb-10 md:px-10 md:pt-8 md:pb-16">
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Title above the gallery on desktop, below it on phones (same element). */}
          <h1 dir="auto" className="order-2 text-subheading font-semibold tracking-subheading md:order-1 md:text-heading-sm">
            {listing.title}
          </h1>
          <div className="order-1 md:order-2">
            <Gallery
              photos={listing.photos}
              alt={listing.title}
              labels={{
                showAll: t("showAllPhotos", { count: listing.photos.length }),
                close: t("closeGallery"),
                gallery: t("gallery"),
                photoOf: listing.photos.map((_, i) => t("photoOf", { current: i + 1, total: listing.photos.length })),
              }}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-10 md:mt-8 md:grid-cols-[1fr_360px] lg:gap-16">
          <div className="flex min-w-0 flex-col">
            <section className="flex flex-col gap-2 border-b border-bebe pb-6">
              <p className="text-ui font-medium">
                {headline} · {location}
              </p>
              {facts.length > 0 && (
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-foggy">
                  {facts.map((f) => (
                    <li key={f.label} className="inline-flex items-center gap-1.5">
                      <f.icon className="size-4" aria-hidden />
                      {f.label}
                    </li>
                  ))}
                </ul>
              )}
              {listing.verified && (
                <p className="mt-2 inline-flex items-center gap-2 text-sm">
                  <Badge variant="overlay" className="gap-1">
                    <BadgeCheck aria-hidden />
                    {tl("verified")}
                  </Badge>
                  <span className="text-foggy">{t("verifiedHint")}</span>
                </p>
              )}
            </section>

            <section className="flex items-center gap-4 border-b border-bebe py-6">
              <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-hof text-lg font-semibold text-white">
                {lister.logo ? (
                  <Image src={lister.logo} alt="" fill sizes="48px" className="object-cover" />
                ) : (
                  lister.name.trim().charAt(0)
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium" dir="auto">
                  {lister.name}
                </p>
                <p className="text-sm text-foggy">
                  {lister.role} · {t("memberSince", { date: formatDate(listing.owner.createdAt, locale) })}
                </p>
              </div>
              {listing.agent && (
                <Link href={`/agents/${listing.agent.slug}`} className={buttonVariants({ variant: "outline" })}>
                  {t("viewProfile")}
                </Link>
              )}
            </section>

            <section className="border-b border-bebe py-6">
              <h2 className="mb-3 text-subheading font-semibold tracking-subheading">{t("description")}</h2>
              <p dir="auto" className="text-start whitespace-pre-line">
                {listing.description}
              </p>
            </section>

            {features.length > 0 && (
              <section className="border-b border-bebe py-6">
                <h2 className="mb-4 text-subheading font-semibold tracking-subheading">{t("features")}</h2>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {features.map((f) => (
                    <li key={f.label} className="flex items-center gap-3">
                      <f.icon className="size-6" strokeWidth={1.5} aria-hidden />
                      {f.label}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="border-b border-bebe py-6">
              <h2 className="mb-4 text-subheading font-semibold tracking-subheading">{t("details")}</h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                {details.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-sm text-foggy">{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="flex flex-col gap-1 py-6 text-sm text-foggy">
              {listing.publishedAt && <p>{t("postedOn", { date: formatDate(listing.publishedAt, locale) })}</p>}
              <p className="inline-flex items-center gap-1.5">
                <Eye className="size-4" aria-hidden />
                {t("views", { count: listing.views })}
              </p>
              <p>{t("listingId", { id: listing.id })}</p>
              <div className="mt-3">
                <ReportDialog
                  listingId={listing.id}
                  labels={{
                    button: tReport("button"),
                    title: tReport("title"),
                    reason: tReport("reason"),
                    comment: tReport("comment"),
                    commentPlaceholder: tReport("commentPlaceholder"),
                    submit: tReport("submit"),
                    sending: tReport("sending"),
                    success: tReport("success"),
                    close: tCommon("close"),
                    reasons: REPORT_REASONS.map((r) => ({ value: r, label: tEnumReport(r) })),
                    errors: {
                      errorReason: tReport("errorReason"),
                      errorComment: tReport("errorComment"),
                      errorRateLimit: tReport("errorRateLimit"),
                      errorGeneric: tReport("errorGeneric"),
                    },
                  }}
                />
              </div>
            </section>
          </div>

          {/* Desktop: sticky contact card */}
          <aside className="hidden md:block">
            <div className="sticky top-28 flex flex-col gap-4 rounded-xl border border-deco bg-white p-6 shadow-menu">
              <Price price={listing.price} currency={listing.currency} dealType={listing.dealType} className="text-subheading" />
              <p className="text-sm text-foggy">{t("contactTitle")}</p>
              <ContactButtons
                listingId={listing.id}
                phone={listing.contactPhone}
                whatsappUrl={whatsappUrl}
                labels={contactLabels}
                className="grid-cols-1"
                showNumber
              />
              <p className="flex gap-2 text-xs text-foggy">
                <ShieldAlert className="size-4 shrink-0" aria-hidden />
                {t("safetyTip")}
              </p>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <div className="mt-8 border-t border-bebe pt-10">
            <ListingRow
              title={t("similar")}
              href={`/listings?city=${listing.city.slug}&type=${listing.propertyType}`}
              listings={similar}
            />
          </div>
        )}
      </article>

      {/* Phones: contact bar pinned above the bottom tab bar */}
      <div data-contact-bar className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-bebe bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-3">
          <Price
            price={listing.price}
            currency={listing.currency}
            dealType={listing.dealType}
            className="min-w-0 flex-1 text-sm leading-tight"
          />
          <ContactButtons
            listingId={listing.id}
            phone={listing.contactPhone}
            whatsappUrl={whatsappUrl}
            labels={contactLabels}
            className="shrink-0 [&>a]:h-11"
          />
        </div>
      </div>
    </>
  );
}
