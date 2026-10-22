import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Search, SearchX, X } from "lucide-react";
import { getPathname, Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { CLIENT_NAMESPACES, pickMessages } from "@/i18n/client-messages";
import { buttonVariants } from "@/components/ui/button";
import { pillClass } from "@/components/ui/pill";
import { ListingCard } from "@/components/listing/listing-card";
import { PropertyTypeIcon } from "@/components/listing/property-type-icon";
import { FiltersDialog } from "@/components/search/filters-dialog";
import { FiltersFields } from "@/components/search/filters-form";
import { Pagination } from "@/components/search/pagination";
import { SortSelect } from "@/components/search/sort-select";
import { getCities, type CityWithNeighbourhoods } from "@/lib/data/locations";
import { searchListings } from "@/lib/data/listings";
import { localName } from "@/lib/format";
import { DEAL_TYPES, PROPERTY_TYPES } from "@/lib/constants";
import { countActiveFilters, parseSearchParams, SORTS, toQuery, type SearchFilters } from "@/lib/validators/search";

async function pageTitle(filters: SearchFilters, cities: CityWithNeighbourhoods[], locale: Locale) {
  const t = await getTranslations({ locale, namespace: "Search" });
  const city = cities.find((c) => c.slug === filters.city);
  return t("metaTitle", {
    // Several types selected -> generic "Property".
    type: filters.type.length === 1 ? filters.type[0] : "any",
    deal: filters.deal ?? "any",
    city: city ? localName(city, locale) : "none",
  });
}

export async function generateMetadata({ params, searchParams }: PageProps<"/[locale]/listings">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const filters = parseSearchParams(await searchParams);
  const cities = await getCities();
  const title = await pageTitle(filters, cities, locale);
  const query = toQuery({ deal: filters.deal, type: filters.type.length === 1 ? filters.type : [], city: filters.city });

  return {
    title,
    alternates: {
      // Canonical keeps only the "landing page" filters; the rest are variations.
      canonical: getPathname({ href: { pathname: "/listings", query }, locale }),
      languages: {
        ar: getPathname({ href: { pathname: "/listings", query }, locale: "ar" }),
        en: getPathname({ href: { pathname: "/listings", query }, locale: "en" }),
      },
    },
    // Deep filter combinations and pages beyond 1 are not worth indexing.
    robots: countActiveFilters(filters) > 3 || filters.page > 1 ? { index: false, follow: true } : undefined,
  };
}

export default async function ListingsPage({ params, searchParams }: PageProps<"/[locale]/listings">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const filters = parseSearchParams(await searchParams);

  const [t, tDeal, tType, cities, messages] = await Promise.all([
    getTranslations("Search"),
    getTranslations("Enums.DealType"),
    getTranslations("Enums.PropertyType"),
    getCities(),
    getMessages(),
  ]);
  const [{ total, listings, page, pageCount }, title] = await Promise.all([
    searchListings(filters, cities),
    pageTitle(filters, cities, locale),
  ]);

  const action = getPathname({ href: "/listings", locale });
  const sortLabels = { newest: t("sortNewest"), price_asc: t("sortPriceAsc"), price_desc: t("sortPriceDesc") };
  const sortHref = Object.fromEntries(
    SORTS.map((s) => [s, getPathname({ href: { pathname: "/listings", query: toQuery({ ...filters, sort: s, page: 1 }) }, locale })]),
  );
  // Quick pills toggle one filter and keep the rest.
  const toggle = (change: Partial<SearchFilters>) => ({
    pathname: "/listings",
    query: toQuery({ ...filters, ...change, page: 1 }),
  });

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 md:px-10 md:py-8">
      <div className="sticky top-16 z-30 -mx-4 border-b border-bebe bg-background/95 px-4 py-3 backdrop-blur md:top-20 md:-mx-10 md:px-10">
        <div className="scrollbar-none flex items-center gap-2 overflow-x-auto">
          {/* Only the filters popup needs these messages; scoped to this page. */}
          <NextIntlClientProvider messages={pickMessages(messages, [...CLIENT_NAMESPACES, "Search"])}>
            <FiltersDialog action={action} activeCount={countActiveFilters(filters)} initialCount={total}>
              <FiltersFields filters={filters} cities={cities} />
            </FiltersDialog>
          </NextIntlClientProvider>

          <span className="mx-1 h-8 w-px shrink-0 bg-deco" aria-hidden />

          {filters.q && (
            <Link
              href={toggle({ q: undefined })}
              aria-label={t("removeKeyword", { q: filters.q })}
              className={pillClass(true)}
            >
              <Search className="size-4" aria-hidden />
              <span dir="auto" className="max-w-48 truncate">
                {filters.q}
              </span>
              <X className="size-4" aria-hidden />
            </Link>
          )}

          <nav aria-label={t("quickFilters")} className="flex items-center gap-2">
            {DEAL_TYPES.map((d) => (
              <Link
                key={d}
                href={toggle({ deal: filters.deal === d ? undefined : d })}
                aria-current={filters.deal === d ? "true" : undefined}
                className={pillClass(filters.deal === d)}
              >
                {tDeal(d)}
              </Link>
            ))}
            {PROPERTY_TYPES.map((p) => {
              const on = filters.type.includes(p);
              return (
                <Link
                  key={p}
                  href={toggle({ type: on ? filters.type.filter((x) => x !== p) : [...filters.type, p] })}
                  aria-current={on ? "true" : undefined}
                  className={pillClass(on)}
                >
                  <PropertyTypeIcon type={p} className="size-4" />
                  {tType(p)}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <section aria-labelledby="results-title" className="mt-6 flex flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 id="results-title" className="text-heading-sm font-medium tracking-display">
              {title}
            </h1>
            <p className="mt-1 text-sm text-foggy" aria-live="polite">
              {t("results", { count: total })}
            </p>
          </div>
          <SortSelect
            label={t("sort")}
            value={filters.sort}
            options={SORTS.map((s) => ({ value: s, label: sortLabels[s] }))}
            hrefFor={sortHref}
          />
        </header>

        {listings.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-6 py-16 text-center">
            <SearchX className="size-10 text-foggy" strokeWidth={1.4} aria-hidden />
            <h2 className="text-ui font-semibold">{t("emptyTitle")}</h2>
            <p className="max-w-sm text-foggy">{t("emptyBody")}</p>
            <a href={action} className={buttonVariants({ variant: "outline" })}>
              {t("clear")}
            </a>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {listings.map((listing, i) => (
              <li key={listing.id}>
                <ListingCard listing={listing} priority={i < 2} />
              </li>
            ))}
          </ul>
        )}

        <Pagination page={page} pageCount={pageCount} queryFor={(p) => toQuery({ ...filters, page: p })} />
      </section>
    </div>
  );
}
