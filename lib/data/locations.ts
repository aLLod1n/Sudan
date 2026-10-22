import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** Active cities with their active neighbourhoods, in display order. */
export const getCities = cache(async () => {
  return prisma.city.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
    select: {
      id: true,
      slug: true,
      nameAr: true,
      nameEn: true,
      neighbourhoods: {
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
        select: { id: true, slug: true, nameAr: true, nameEn: true },
      },
    },
  });
});

export type CityWithNeighbourhoods = Awaited<ReturnType<typeof getCities>>[number];
