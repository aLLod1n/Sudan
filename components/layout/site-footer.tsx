import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCities } from "@/lib/data/locations";
import { localName } from "@/lib/format";

export async function SiteFooter() {
  const [t, locale, cities] = await Promise.all([getTranslations("Footer"), getLocale(), getCities()]);

  const columns = [
    {
      title: t("explore"),
      links: [
        { href: "/listings?deal=RENT", label: t("forRent") },
        { href: "/listings?deal=SALE", label: t("forSale") },
        { href: "/agents", label: t("agents") },
      ],
    },
    {
      title: t("cities"),
      links: cities.map((c) => ({ href: `/listings?city=${c.slug}`, label: localName(c, locale) })),
    },
    {
      title: t("owners"),
      links: [
        { href: "/listings/new", label: t("postListing") },
        { href: "/account/agent", label: t("becomeAgent") },
      ],
    },
  ];

  return (
    <footer className="border-t border-bebe bg-faint">
      <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-10">
        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="mb-3 text-sm font-semibold">{col.title}</h2>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-foggy hover:text-hof">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-bebe pt-6 text-sm text-foggy sm:flex-row sm:items-center sm:justify-between">
          <span>{t("rights", { year: new Date().getFullYear() })}</span>
          <span>{t("tagline")}</span>
        </div>
      </div>
    </footer>
  );
}
