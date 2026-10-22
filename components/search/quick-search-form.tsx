"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin, Search, X } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { PropertyTypeIcon } from "@/components/listing/property-type-icon";
import type { DealType, PropertyType } from "@/generated/prisma/enums";
import { CleanGetForm } from "./clean-get-form";

type Option<T extends string> = { value: T; label: string };
/** allLabel: "All of Khartoum" (precomputed on the server). */
type City = Option<string> & { allLabel: string; hoods: Option<string>[] };
type Step = "type" | "location" | null;
type Labels = {
  type: string;
  typeAny: string;
  dealAny: string;
  dealHeading: string;
  typeHeading: string;
  location: string;
  anywhere: string;
  chooseLocation: string;
  findHood: string;
  /** Between neighbourhood and city in the summary: "، " or ", ". */
  separator: string;
  noMatch: string;
  keyword: string;
  keywordPlaceholder: string;
  search: string;
  next: string;
  clear: string;
  close: string;
};

const pill =
  "relative inline-flex h-11 shrink-0 cursor-pointer select-none items-center gap-2 rounded-full border border-deco bg-white px-4 text-sm whitespace-nowrap transition-colors hover:border-hof has-[:checked]:border-hof has-[:checked]:bg-hof has-[:checked]:font-medium has-[:checked]:text-white has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-hof/30";

/** Matches Arabic and English names, ignoring case and Arabic letter variants. */
function normalize(s: string) {
  return s.toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").trim();
}

/**
 * Home search capsule (myhome.ge flow): Type -> Next -> Location -> Search,
 * plus a free-text box for keyword / listing ID / phone.
 */
export function QuickSearchForm({
  action,
  deals,
  types,
  cities,
  labels,
}: {
  action: string;
  deals: Option<DealType>[];
  types: Option<PropertyType>[];
  cities: City[];
  labels: Labels;
}) {
  const [deal, setDeal] = useState<DealType | "">("");
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>([]);
  const [city, setCity] = useState("");
  const [hood, setHood] = useState("");
  const [hoodFilter, setHoodFilter] = useState("");
  const [step, setStep] = useState<Step>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Close the panel on outside click / Escape.
  useEffect(() => {
    if (!step) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !rootRef.current?.contains(e.target as Node)) setStep(null);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [step]);

  const dealLabel = deals.find((d) => d.value === deal)?.label;
  const typeNames = types.filter((t) => selectedTypes.includes(t.value)).map((t) => t.label);
  const typePart = typeNames.length === 0 ? null : typeNames.length === 1 ? typeNames[0] : `${typeNames[0]} +${typeNames.length - 1}`;
  const typeSummary = [dealLabel, typePart].filter(Boolean).join(" · ") || labels.typeAny;

  const cityObj = cities.find((c) => c.value === city);
  const hoodObj = cityObj?.hoods.find((h) => h.value === hood);
  const locationSummary = cityObj ? (hoodObj ? hoodObj.label + labels.separator + cityObj.label : cityObj.label) : labels.anywhere;

  const query = normalize(hoodFilter);
  const visibleCities = cities
    .map((c) => ({
      ...c,
      hoods: query ? c.hoods.filter((h) => normalize(h.label).includes(query)) : c.hoods,
      cityMatches: !query || normalize(c.label).includes(query),
    }))
    .filter((c) => c.cityMatches || c.hoods.length > 0);

  const segment =
    "relative flex min-w-0 flex-col items-start justify-center gap-0.5 rounded-full px-6 py-3 text-start transition-colors hover:bg-faint md:h-full md:py-0";
  const summary = "flex w-full items-center justify-between gap-2 text-sm text-foggy";
  const choice = (selected: boolean) =>
    cn(
      "w-full rounded-lg px-3 py-2 text-start text-sm transition-colors",
      selected ? "bg-hof font-medium text-white" : "hover:bg-faint",
    );

  return (
    <div ref={rootRef} className="relative mx-auto w-full max-w-[880px]">
      <CleanGetForm ref={formRef} action={action} role="search" onNavigate={() => setStep(null)}>
        <input type="hidden" name="city" value={city} />
        <input type="hidden" name="hood" value={hood} />

        <div className="flex flex-col rounded-2xl bg-white p-2 shadow-search md:h-[66px] md:flex-row md:items-center md:rounded-full md:p-0 md:ps-2">
          <button
            type="button"
            className={cn(segment, "md:w-[30%] md:shrink-0", step === "type" && "md:bg-faint")}
            aria-expanded={step === "type"}
            aria-controls="quick-search-panel"
            onClick={() => setStep((s) => (s === "type" ? null : "type"))}
          >
            <span className="text-xs font-semibold text-hof">{labels.type}</span>
            <span className={summary}>
              <span className="truncate">{typeSummary}</span>
              <ChevronDown className={cn("size-4 shrink-0 transition-transform", step === "type" && "rotate-180")} aria-hidden />
            </span>
          </button>

          <span className="mx-4 h-px bg-bebe md:mx-0 md:h-8 md:w-px" aria-hidden />

          <button
            type="button"
            className={cn(segment, "md:w-[26%] md:shrink-0", step === "location" && "md:bg-faint")}
            aria-expanded={step === "location"}
            aria-controls="quick-search-panel"
            onClick={() => setStep((s) => (s === "location" ? null : "location"))}
          >
            <span className="text-xs font-semibold text-hof">{labels.location}</span>
            <span className={summary}>
              <span className="truncate">{locationSummary}</span>
              <ChevronDown className={cn("size-4 shrink-0 transition-transform", step === "location" && "rotate-180")} aria-hidden />
            </span>
          </button>

          <span className="mx-4 h-px bg-bebe md:mx-0 md:h-8 md:w-px" aria-hidden />

          <label className={cn(segment, "flex-1 focus-within:bg-faint")}>
            <span className="text-xs font-semibold text-hof">{labels.keyword}</span>
            <input
              type="search"
              name="q"
              maxLength={100}
              enterKeyHint="search"
              placeholder={labels.keywordPlaceholder}
              onFocus={() => setStep(null)}
              className="w-full bg-transparent text-sm text-hof outline-none placeholder:text-foggy [&::-webkit-search-cancel-button]:hidden"
            />
          </label>

          <button
            type="submit"
            className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-rausch px-4 font-medium text-white transition-colors hover:bg-rausch-600 focus-visible:ring-3 focus-visible:ring-hof/30 focus-visible:outline-none md:mt-0 md:me-2 md:w-12 md:shrink-0 md:rounded-full md:px-0"
          >
            <Search className="size-4 md:size-[18px]" strokeWidth={2.5} aria-hidden />
            <span className="md:sr-only">{labels.search}</span>
          </button>
        </div>

        {/* One panel, two steps. Inputs stay in the DOM when hidden, so they always submit. */}
        <div
          id="quick-search-panel"
          hidden={!step}
          className={cn(
            "z-30 mt-2 rounded-2xl bg-white shadow-menu md:absolute md:inset-x-0 md:top-full",
            // Phones: the long location list gets the full screen with a pinned footer.
            step === "location" && "max-md:fixed max-md:inset-0 max-md:z-50 max-md:mt-0 max-md:flex max-md:flex-col max-md:rounded-none",
          )}
        >
          <div hidden={step !== "type"} className="p-5 md:p-6">
            <div role="radiogroup" aria-label={labels.dealHeading}>
              <h3 className="mb-3 text-ui font-semibold">{labels.dealHeading}</h3>
              <div className="flex flex-wrap gap-2">
                {[{ value: "" as const, label: labels.dealAny }, ...deals].map((d) => (
                  <label key={d.value || "any"} className={pill}>
                    <input
                      type="radio"
                      name="deal"
                      value={d.value}
                      checked={deal === d.value}
                      onChange={() => setDeal(d.value)}
                      className="sr-only"
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>

            <div role="group" aria-label={labels.typeHeading} className="mt-6">
              <h3 className="mb-3 text-ui font-semibold">{labels.typeHeading}</h3>
              <div className="flex flex-wrap gap-2">
                {types.map((t) => (
                  <label key={t.value} className={pill}>
                    <input
                      type="checkbox"
                      name="type"
                      value={t.value}
                      checked={selectedTypes.includes(t.value)}
                      onChange={(e) =>
                        setSelectedTypes((prev) => (e.target.checked ? [...prev, t.value] : prev.filter((x) => x !== t.value)))
                      }
                      className="sr-only"
                    />
                    <PropertyTypeIcon type={t.value} className="size-4" />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-bebe pt-4">
              <Button type="button" variant="ghost" onClick={() => setStep(null)}>
                {labels.close}
              </Button>
              <Button type="button" onClick={() => setStep("location")}>
                {labels.next}
              </Button>
            </div>
          </div>

          <div hidden={step !== "location"} className="max-md:flex max-md:min-h-0 max-md:flex-1 max-md:flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-bebe px-5 py-4 md:px-6">
              <h3 className="text-subheading font-semibold tracking-subheading">{labels.chooseLocation}</h3>
              <Button type="button" variant="secondary" size="icon" aria-label={labels.close} onClick={() => setStep(null)}>
                <X aria-hidden />
              </Button>
            </div>

            <div className="px-5 pt-4 md:px-6">
              <label className="flex h-11 items-center gap-2 rounded-lg border border-input px-3 focus-within:border-hof">
                <MapPin className="size-4 text-foggy" aria-hidden />
                <input
                  type="text"
                  value={hoodFilter}
                  onChange={(e) => setHoodFilter(e.target.value)}
                  placeholder={labels.findHood}
                  aria-label={labels.findHood}
                  className="w-full bg-transparent text-base outline-none placeholder:text-foggy md:text-sm"
                />
              </label>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 md:max-h-[360px] md:px-6">
              {visibleCities.length === 0 ? (
                <p className="py-6 text-center text-sm text-foggy">{labels.noMatch}</p>
              ) : (
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 md:grid-cols-4">
                  {visibleCities.map((c) => (
                    <div key={c.value} className="flex flex-col gap-1">
                      <button
                        type="button"
                        aria-pressed={city === c.value && !hood}
                        onClick={() => {
                          setCity(c.value);
                          setHood("");
                        }}
                        className={cn(choice(city === c.value && !hood), "text-ui font-semibold")}
                      >
                        {c.label}
                        <span className={cn("block text-xs font-normal", city === c.value && !hood ? "text-white/80" : "text-foggy")}>
                          {c.allLabel}
                        </span>
                      </button>
                      <ul className="flex flex-col">
                        {c.hoods.map((h) => (
                          <li key={h.value}>
                            <button
                              type="button"
                              aria-pressed={city === c.value && hood === h.value}
                              onClick={() => {
                                setCity(c.value);
                                setHood(h.value);
                              }}
                              className={choice(city === c.value && hood === h.value)}
                            >
                              {h.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-bebe px-5 py-4 md:px-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setCity("");
                  setHood("");
                  setHoodFilter("");
                }}
              >
                {labels.clear}
              </Button>
              <Button type="submit" variant="brand">
                <Search aria-hidden />
                {labels.search}
              </Button>
            </div>
          </div>
        </div>
      </CleanGetForm>
    </div>
  );
}
