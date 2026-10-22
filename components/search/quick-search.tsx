import { getLocale, getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import type { CityWithNeighbourhoods } from "@/lib/data/locations";
import { localName } from "@/lib/format";
import { DEAL_TYPES, PROPERTY_TYPES } from "@/lib/constants";
import { QuickSearchForm } from "./quick-search-form";

/**
 * Floating search capsule (DESIGN.md signature element), myhome.ge flow:
 * type pills -> Next -> location popup -> Search, plus a keyword box.
 * Submits to a short, shareable /listings?… URL.
 */
export async function QuickSearch({ cities }: { cities: CityWithNeighbourhoods[] }) {
  const [locale, t, tHome, tSearch, tDeal, tType] = await Promise.all([
    getLocale(),
    getTranslations("QuickSearch"),
    getTranslations("Home"),
    getTranslations("Search"),
    getTranslations("Enums.DealType"),
    getTranslations("Enums.PropertyType"),
  ]);

  return (
    <QuickSearchForm
      action={getPathname({ href: "/listings", locale })}
      deals={DEAL_TYPES.map((d) => ({ value: d, label: tDeal(d) }))}
      types={PROPERTY_TYPES.map((p) => ({ value: p, label: tType(p) }))}
      cities={cities.map((c) => ({
        value: c.slug,
        label: localName(c, locale),
        allLabel: t("allOf", { city: localName(c, locale) }),
        hoods: c.neighbourhoods.map((h) => ({ value: h.slug, label: localName(h, locale) })),
      }))}
      labels={{
        type: t("type"),
        typeAny: tHome("anyType"),
        dealAny: tHome("anyDeal"),
        dealHeading: tSearch("deal"),
        typeHeading: tSearch("type"),
        location: t("location"),
        anywhere: t("anywhere"),
        chooseLocation: t("chooseLocation"),
        findHood: t("findHood"),
        separator: locale === "ar" ? "، " : ", ",
        noMatch: t("noMatch"),
        keyword: t("keyword"),
        keywordPlaceholder: t("keywordPlaceholder"),
        search: tHome("search"),
        next: t("next"),
        clear: t("clear"),
        close: t("close"),
      }}
    />
  );
}
