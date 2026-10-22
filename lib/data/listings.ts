import "server-only";
import { prisma } from "@/lib/prisma";
import { fileUrl } from "@/lib/storage";
import type { Prisma } from "@/generated/prisma/client";
import { PAGE_SIZE } from "@/lib/constants";
import { toLatinDigits } from "@/lib/phone";
import type { CityWithNeighbourhoods } from "@/lib/data/locations";
import type { SearchFilters } from "@/lib/validators/search";

/** Fields needed to render a result card. */
export const listingCardSelect = {
  id: true,
  title: true,
  dealType: true,
  propertyType: true,
  price: true,
  currency: true,
  rooms: true,
  areaM2: true,
  verified: true,
  publishedAt: true,
  city: { select: { slug: true, nameAr: true, nameEn: true } },
  neighbourhood: { select: { slug: true, nameAr: true, nameEn: true } },
  photos: { orderBy: { position: "asc" }, take: 1, select: { key: true } },
} satisfies Prisma.ListingSelect;

type ListingCardRow = Prisma.ListingGetPayload<{ select: typeof listingCardSelect }>;

export type ListingCardData = Omit<ListingCardRow, "photos"> & { photoUrl: string | null };

export function toCardData(row: ListingCardRow): ListingCardData {
  const { photos, ...rest } = row;
  return { ...rest, photoUrl: photos[0] ? fileUrl(photos[0].key) : null };
}

export async function getLatestListings(options: { take: number; cityId?: string }) {
  const rows = await prisma.listing.findMany({
    where: { ...publicListingWhere(), ...(options.cityId ? { cityId: options.cityId } : {}) },
    orderBy: { publishedAt: "desc" },
    take: options.take,
    select: listingCardSelect,
  });
  return rows.map(toCardData);
}

/** Only these appear publicly: approved and not past their expiry date. */
export function publicListingWhere(): Prisma.ListingWhereInput {
  return { status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] };
}

/**
 * Keyword search: words in the title, description, city or neighbourhood
 * (every word must match somewhere), a listing ID, or a phone number.
 */
function keywordWhere(q: string): Prisma.ListingWhereInput {
  const or: Prisma.ListingWhereInput[] = [];
  if (/^c[a-z0-9]{20,30}$/.test(q)) or.push({ id: q });
  const digits = toLatinDigits(q).replace(/\D/g, "");
  // Phone: match the last 9 digits so 0912…, 912… and +249912… all work.
  if (digits.length >= 7 && digits.length === q.replace(/[\s+\-()]/g, "").length) {
    or.push({ contactPhone: { contains: digits.slice(-9) } });
  }
  const words = q.split(" ").filter((w) => w.length >= 2).slice(0, 6);
  if (words.length) {
    or.push({
      AND: words.map((w) => ({
        OR: [
          { title: { contains: w, mode: "insensitive" } },
          { description: { contains: w, mode: "insensitive" } },
          { neighbourhood: { OR: [{ nameAr: { contains: w } }, { nameEn: { contains: w, mode: "insensitive" } }] } },
          { city: { OR: [{ nameAr: { contains: w } }, { nameEn: { contains: w, mode: "insensitive" } }] } },
        ],
      })),
    });
  }
  // Nothing usable (e.g. a single letter): match nothing rather than everything.
  return or.length ? { OR: or } : { id: "__none__" };
}

/** Prisma filter for a search; shared by the results page and the live count. */
export function buildSearchWhere(filters: SearchFilters, cities: CityWithNeighbourhoods[]): Prisma.ListingWhereInput {
  const city = filters.city ? cities.find((c) => c.slug === filters.city) : undefined;
  const hood = city && filters.hood ? city.neighbourhoods.find((h) => h.slug === filters.hood) : undefined;

  // Price bounds only make sense within one currency.
  const priceFilter =
    filters.currency && (filters.minPrice !== undefined || filters.maxPrice !== undefined)
      ? {
          price: {
            ...(filters.minPrice !== undefined ? { gte: BigInt(filters.minPrice) } : {}),
            ...(filters.maxPrice !== undefined ? { lte: BigInt(filters.maxPrice) } : {}),
          },
        }
      : {};

  return {
    ...publicListingWhere(),
    ...(filters.q ? { AND: [keywordWhere(filters.q)] } : {}),
    ...(filters.deal ? { dealType: filters.deal } : {}),
    ...(filters.type.length ? { propertyType: { in: filters.type } } : {}),
    // Unknown city slug -> no results rather than silently ignoring it.
    ...(filters.city ? { cityId: city?.id ?? "__none__" } : {}),
    ...(hood ? { neighbourhoodId: hood.id } : {}),
    ...(filters.currency ? { currency: filters.currency } : {}),
    ...priceFilter,
    ...(filters.rooms ? { rooms: { gte: Number(filters.rooms) } } : {}),
    ...(filters.seller ? { owner: { role: filters.seller === "agent" ? "AGENT" : { not: "AGENT" } } } : {}),
    ...(filters.verified ? { verified: true } : {}),
  };
}

export async function countSearch(filters: SearchFilters, cities: CityWithNeighbourhoods[]) {
  return prisma.listing.count({ where: buildSearchWhere(filters, cities) });
}

export async function searchListings(filters: SearchFilters, cities: CityWithNeighbourhoods[]) {
  const where = buildSearchWhere(filters, cities);
  const orderBy: Prisma.ListingOrderByWithRelationInput[] =
    filters.sort === "newest"
      ? [{ publishedAt: "desc" }, { id: "desc" }]
      : // Mixed currencies can't be compared; group by currency, then price.
        [{ currency: "asc" }, { price: filters.sort === "price_asc" ? "asc" : "desc" }, { id: "desc" }];

  const total = await prisma.listing.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // A page past the end (old shared link) shows the last page instead of nothing.
  const page = Math.min(filters.page, pageCount);
  const rows = await prisma.listing.findMany({
    where,
    orderBy,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: listingCardSelect,
  });

  return { total, listings: rows.map(toCardData), page, pageCount };
}
