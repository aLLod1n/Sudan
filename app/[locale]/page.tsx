import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { QuickSearch } from "@/components/search/quick-search";
import { ListingRow } from "@/components/listing/listing-row";
import { getCities } from "@/lib/data/locations";
import { getLatestListings } from "@/lib/data/listings";
import { localName } from "@/lib/format";
import { PROPERTY_TYPES } from "@/lib/constants";
import { PropertyTypeIcon } from "@/components/listing/property-type-icon";

// Static HTML, refreshed at most once a minute: fast on slow connections
// while new listings still appear quickly.
export const revalidate = 60;

// Empty list = nothing prerendered at build (no DB needed), but each locale is
// cached after its first request (ISR). Other pages stay dynamic by default.
export function generateStaticParams() {
  return [];
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale as "ar" | "en");

  const [t, tType, cities, latest] = await Promise.all([
    getTranslations("Home"),
    getTranslations("Enums.PropertyType"),
    getCities(),
    getLatestListings({ take: 12 }),
  ]);

  const cityRows = await Promise.all(
    cities.map(async (city) => ({ city, listings: await getLatestListings({ take: 10, cityId: city.id }) })),
  );

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-4 pt-6 pb-12 md:px-10 md:pt-10">
      {/* The search capsule is the hero (DESIGN.md: no hero image). */}
      <section className="flex flex-col gap-5">
        <h1 className="text-center text-subheading font-semibold tracking-subheading md:text-heading-sm">
          {t("heroTitle")}
        </h1>
        <QuickSearch cities={cities} />
      </section>

      <nav aria-label={t("browseByType")}>
        <ul className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:justify-center md:gap-8 md:px-0">
          {PROPERTY_TYPES.map((type) => {
            return (
              <li key={type}>
                <Link
                  href={`/listings?type=${type}`}
                  className="flex min-w-20 flex-col items-center gap-2 rounded-lg px-3 py-2 text-xs text-foggy hover:bg-white hover:text-hof"
                >
                  <PropertyTypeIcon type={type} className="size-6 text-hof" />
                  {tType(type)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {latest.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-foggy">{t("empty")}</p>
      ) : (
        <ListingRow title={t("latest")} href="/listings" listings={latest} priorityCount={2} />
      )}

      {cityRows
        .filter((row) => row.listings.length > 0)
        .map(({ city, listings }) => (
          <ListingRow
            key={city.id}
            title={t("latestIn", { city: localName(city, locale) })}
            href={`/listings?city=${city.slug}`}
            listings={listings}
          />
        ))}
    </div>
  );
}
