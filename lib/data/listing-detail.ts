import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { fileUrl } from "@/lib/storage";
import { listingCardSelect, publicListingWhere, toCardData } from "@/lib/data/listings";

/** Everything the public listing page needs. Cached per request (page + metadata). */
export const getListingDetail = cache(async (id: string) => {
  if (!/^[a-z0-9]{20,40}$/.test(id)) return null;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      city: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
      neighbourhood: { select: { slug: true, nameAr: true, nameEn: true } },
      photos: { orderBy: { position: "asc" }, select: { id: true, key: true, width: true, height: true } },
      owner: {
        select: {
          name: true,
          role: true,
          createdAt: true,
          agentProfile: { select: { slug: true, officeName: true, logoKey: true, whatsapp: true } },
        },
      },
    },
  });
  if (!listing) return null;

  const expired = listing.status === "EXPIRED" || (listing.expiresAt !== null && listing.expiresAt <= new Date());
  return {
    ...listing,
    /** "active": normal page, "unavailable": expired notice, null: 404. */
    visibility: listing.status === "ACTIVE" && !expired ? "active" : listing.status === "ACTIVE" || listing.status === "EXPIRED" ? "unavailable" : null,
    photos: listing.photos.map((p) => ({ ...p, url: fileUrl(p.key) })),
    agent: listing.owner.role === "AGENT" ? listing.owner.agentProfile : null,
  } as const;
});

export type ListingDetail = NonNullable<Awaited<ReturnType<typeof getListingDetail>>>;

/** Same city and property type, excluding the listing itself. */
export async function getSimilarListings(listing: { id: string; cityId: string; propertyType: ListingDetail["propertyType"] }) {
  const rows = await prisma.listing.findMany({
    where: { ...publicListingWhere(), cityId: listing.cityId, propertyType: listing.propertyType, id: { not: listing.id } },
    orderBy: { publishedAt: "desc" },
    take: 8,
    select: listingCardSelect,
  });
  return rows.map(toCardData);
}
