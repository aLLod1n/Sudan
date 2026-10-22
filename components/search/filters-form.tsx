import { getLocale, getTranslations } from "next-intl/server";
import { Input } from "@/components/ui/input";
import { PillGroup, PillInput } from "@/components/ui/pill";
import { PropertyTypeIcon } from "@/components/listing/property-type-icon";
import type { CityWithNeighbourhoods } from "@/lib/data/locations";
import { localName } from "@/lib/format";
import { CURRENCIES, DEAL_TYPES, PROPERTY_TYPES } from "@/lib/constants";
import { ROOM_OPTIONS, type SearchFilters } from "@/lib/validators/search";
import { CityHoodSelects } from "./city-hood-selects";

/**
 * Body of the filters popup. Short option lists are pills (one tap, all
 * visible); city/neighbourhood stay dropdowns (long lists). Plain radios and
 * checkboxes underneath, so the form also works before JS loads.
 */
export async function FiltersFields({
  filters,
  cities,
}: {
  filters: SearchFilters;
  cities: CityWithNeighbourhoods[];
}) {
  const [locale, t, tDeal, tType, tCur] = await Promise.all([
    getLocale(),
    getTranslations("Search"),
    getTranslations("Enums.DealType"),
    getTranslations("Enums.PropertyType"),
    getTranslations("Enums.Currency"),
  ]);
  const section = "border-b border-bebe py-6 last:border-0";

  return (
    <>
      <PillGroup legend={t("type")} className={section}>
        {PROPERTY_TYPES.map((p) => (
          <PillInput
            key={p}
            type="checkbox"
            name="type"
            value={p}
            defaultChecked={filters.type.includes(p)}
            icon={<PropertyTypeIcon type={p} className="size-4" />}
          >
            {tType(p)}
          </PillInput>
        ))}
      </PillGroup>

      <PillGroup legend={t("deal")} className={section}>
        <PillInput type="radio" name="deal" value="" defaultChecked={!filters.deal}>
          {t("dealAny")}
        </PillInput>
        {DEAL_TYPES.map((d) => (
          <PillInput key={d} type="radio" name="deal" value={d} defaultChecked={filters.deal === d}>
            {tDeal(d)}
          </PillInput>
        ))}
      </PillGroup>

      <div role="group" aria-labelledby="filters-location" className={section}>
        <h3 id="filters-location" className="mb-3 text-ui font-semibold">
          {t("location")}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <CityHoodSelects
            cities={cities.map((c) => ({
              slug: c.slug,
              name: localName(c, locale),
              neighbourhoods: c.neighbourhoods.map((h) => ({ slug: h.slug, name: localName(h, locale) })),
            }))}
            defaultCity={filters.city}
            defaultHood={filters.hood}
            labels={{
              city: t("city"),
              cityAny: t("cityAny"),
              hood: t("hood"),
              hoodAny: t("hoodAny"),
              hoodPickCity: t("hoodPickCity"),
            }}
          />
        </div>
      </div>

      <div role="group" aria-labelledby="filters-price" className={section}>
        <h3 id="filters-price" className="mb-3 text-ui font-semibold">
          {t("price")}
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("currency")}>
            <PillInput type="radio" name="currency" value="" defaultChecked={!filters.currency}>
              {t("currencyAny")}
            </PillInput>
            {CURRENCIES.map((c) => (
              <PillInput key={c} type="radio" name="currency" value={c} defaultChecked={filters.currency === c}>
                {tCur(c)}
              </PillInput>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              name="minPrice"
              inputMode="numeric"
              placeholder={t("minPrice")}
              aria-label={t("minPrice")}
              defaultValue={filters.minPrice ?? ""}
              aria-describedby="price-hint"
            />
            <Input
              name="maxPrice"
              inputMode="numeric"
              placeholder={t("maxPrice")}
              aria-label={t("maxPrice")}
              defaultValue={filters.maxPrice ?? ""}
              aria-describedby="price-hint"
            />
          </div>
          <p id="price-hint" className="text-xs text-foggy">
            {t("priceHint")}
          </p>
        </div>
      </div>

      <PillGroup legend={t("rooms")} className={section}>
        <PillInput type="radio" name="rooms" value="" defaultChecked={!filters.rooms}>
          {t("roomsAny")}
        </PillInput>
        {ROOM_OPTIONS.map((r) => (
          <PillInput key={r} type="radio" name="rooms" value={r} defaultChecked={filters.rooms === r} className="min-w-14">
            {r}+
          </PillInput>
        ))}
      </PillGroup>

      <PillGroup legend={t("seller")} className={section}>
        <PillInput type="radio" name="seller" value="" defaultChecked={!filters.seller}>
          {t("sellerAny")}
        </PillInput>
        <PillInput type="radio" name="seller" value="owner" defaultChecked={filters.seller === "owner"}>
          {t("sellerOwner")}
        </PillInput>
        <PillInput type="radio" name="seller" value="agent" defaultChecked={filters.seller === "agent"}>
          {t("sellerAgent")}
        </PillInput>
      </PillGroup>

      <div className={section}>
        <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
          <span>
            <span className="block text-ui font-semibold">{t("verifiedOnly")}</span>
            <span className="text-sm text-foggy">{t("verifiedHint")}</span>
          </span>
          {/* Switch built on a checkbox */}
          <input
            type="checkbox"
            name="verified"
            value="1"
            defaultChecked={filters.verified === "1"}
            className="peer relative h-8 w-12 shrink-0 cursor-pointer appearance-none rounded-full bg-deco transition-colors before:absolute before:start-1 before:top-1 before:size-6 before:rounded-full before:bg-white before:shadow-tooltip before:transition-transform checked:bg-hof checked:before:translate-x-4 rtl:checked:before:-translate-x-4 focus-visible:ring-3 focus-visible:ring-hof/30 focus-visible:outline-none"
          />
        </label>
      </div>

      {filters.sort !== "newest" && <input type="hidden" name="sort" value={filters.sort} />}
      {/* The keyword is edited from its chip on the page, not in the popup. */}
      {filters.q && <input type="hidden" name="q" value={filters.q} />}
    </>
  );
}
