import { z } from "zod";
import { CURRENCIES, DEAL_TYPES, PROPERTY_TYPES } from "@/lib/constants";
import { toLatinDigits } from "@/lib/phone";
import type { PropertyType } from "@/generated/prisma/enums";

export const SORTS = ["newest", "price_asc", "price_desc"] as const;
export const SELLERS = ["owner", "agent"] as const;
/** Minimum rooms filter; "5" means 5 or more. */
export const ROOM_OPTIONS = ["1", "2", "3", "4", "5"] as const;

// Each field falls back to undefined when the value is missing or invalid,
// so a mangled shared link still opens with whatever filters are valid.
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.enum(values).optional().catch(undefined);

const optionalSlug = z
  .string()
  .regex(/^[a-z0-9-]{1,60}$/)
  .optional()
  .catch(undefined);

const optionalAmount = z
  .preprocess(
    (v) => (typeof v === "string" ? toLatinDigits(v).replace(/[,\s]/g, "") : v),
    z.coerce.number().int().min(0).max(1e13),
  )
  .optional()
  .catch(undefined);

/** Several property types: "?type=APARTMENT,HOUSE" (or repeated params). Unknown values are dropped. */
const typeList = z.preprocess((v) => {
  const raw = (Array.isArray(v) ? v : typeof v === "string" ? [v] : []).flatMap((s) => String(s).split(","));
  return [...new Set(raw.filter((s): s is PropertyType => (PROPERTY_TYPES as readonly string[]).includes(s)))];
}, z.array(z.enum(PROPERTY_TYPES)));

/** Free-text search: trimmed, collapsed spaces, max 100 chars; empty -> undefined. */
const keyword = z
  .string()
  .transform((v) => v.replace(/\s+/g, " ").trim().slice(0, 100))
  .pipe(z.string().min(1))
  .optional()
  .catch(undefined);

export const searchSchema = z.object({
  q: keyword,
  deal: optionalEnum(DEAL_TYPES),
  type: typeList.catch([]),
  city: optionalSlug,
  hood: optionalSlug,
  currency: optionalEnum(CURRENCIES),
  minPrice: optionalAmount,
  maxPrice: optionalAmount,
  rooms: optionalEnum(ROOM_OPTIONS),
  seller: optionalEnum(SELLERS),
  verified: z.literal("1").optional().catch(undefined),
  sort: z.enum(SORTS).catch("newest").default("newest"),
  page: z.coerce.number().int().min(1).max(500).catch(1).default(1),
});

export type SearchFilters = z.infer<typeof searchSchema>;

/** Next.js searchParams (string | string[]) -> validated filters. */
export function parseSearchParams(params: Record<string, string | string[] | undefined>): SearchFilters {
  const flat = Object.fromEntries(
    Object.entries(params)
      // "type" may repeat; every other key uses its first value.
      .map(([k, v]) => [k, k === "type" ? v : Array.isArray(v) ? v[0] : v])
      .filter(([, v]) => v !== "" && v !== undefined),
  );
  return searchSchema.parse(flat);
}

/** Filters -> query object for links (drops defaults and empty values). */
export function toQuery(filters: Partial<SearchFilters>): Record<string, string> {
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length) query[key] = value.join(",");
      continue;
    }
    if (key === "sort" && value === "newest") continue;
    if (key === "page" && value === 1) continue;
    query[key] = String(value);
  }
  return query;
}

/** Number of filters the user set (for the "Filters (3)" button). */
export function countActiveFilters(f: SearchFilters): number {
  const scalar = (["q", "deal", "city", "hood", "currency", "minPrice", "maxPrice", "rooms", "seller", "verified"] as const).filter(
    (k) => f[k] !== undefined,
  ).length;
  return scalar + (f.type.length ? 1 : 0);
}
