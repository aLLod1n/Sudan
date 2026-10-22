"use client";

import { useState } from "react";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";

type Option = { slug: string; name: string };
type City = Option & { neighbourhoods: Option[] };

/** City -> neighbourhood dependent dropdowns for the search filters. */
export function CityHoodSelects({
  cities,
  defaultCity,
  defaultHood,
  labels,
}: {
  cities: City[];
  defaultCity?: string;
  defaultHood?: string;
  labels: { city: string; cityAny: string; hood: string; hoodAny: string; hoodPickCity: string };
}) {
  const [city, setCity] = useState(defaultCity ?? "");
  const hoods = cities.find((c) => c.slug === city)?.neighbourhoods ?? [];

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-city">{labels.city}</Label>
        <NativeSelect id="filter-city" name="city" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">{labels.cityAny}</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-hood">{labels.hood}</Label>
        {/* key resets the selection when the city changes */}
        <NativeSelect
          key={city}
          id="filter-hood"
          name="hood"
          defaultValue={city === defaultCity ? (defaultHood ?? "") : ""}
          disabled={!city}
        >
          <option value="">{city ? labels.hoodAny : labels.hoodPickCity}</option>
          {hoods.map((h) => (
            <option key={h.slug} value={h.slug}>
              {h.name}
            </option>
          ))}
        </NativeSelect>
      </div>
    </>
  );
}
