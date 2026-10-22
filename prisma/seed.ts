// Seed script: cities + neighbourhoods, an admin user (ADMIN_PHONE), sample
// owners/agents and ~20 listings with generated placeholder photos.
// Safe to re-run: locations are upserted, sample users' listings are rebuilt.
//
// Run: npm run db:seed

import "dotenv/config";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { prisma } from "../lib/prisma";
import { storeImage } from "../lib/images";
import { getStorage } from "../lib/storage";
import { normalizePhone, placeholderEmail } from "../lib/phone";
import { cities, listings, users, type SeedUserKey } from "./seed-data";
import { placeholderSvg } from "./placeholder-photos";

const DAY = 24 * 60 * 60 * 1000;

async function seedLocations() {
  const cityIds = new Map<string, string>();
  const hoodIds = new Map<string, string>(); // "city/hood" -> id

  for (const [cityIndex, city] of cities.entries()) {
    const row = await prisma.city.upsert({
      where: { slug: city.slug },
      update: { nameAr: city.nameAr, nameEn: city.nameEn, sortOrder: cityIndex },
      create: { slug: city.slug, nameAr: city.nameAr, nameEn: city.nameEn, sortOrder: cityIndex },
    });
    cityIds.set(city.slug, row.id);

    for (const [hoodIndex, hood] of city.neighbourhoods.entries()) {
      const h = await prisma.neighbourhood.upsert({
        where: { cityId_slug: { cityId: row.id, slug: hood.slug } },
        update: { nameAr: hood.nameAr, nameEn: hood.nameEn, sortOrder: hoodIndex },
        create: { cityId: row.id, slug: hood.slug, nameAr: hood.nameAr, nameEn: hood.nameEn, sortOrder: hoodIndex },
      });
      hoodIds.set(`${city.slug}/${hood.slug}`, h.id);
    }
  }
  console.log(`✓ ${cities.length} cities, ${hoodIds.size} neighbourhoods`);
  return { cityIds, hoodIds };
}

async function upsertUser(phone: string, name: string, role: "USER" | "AGENT" | "ADMIN") {
  return prisma.user.upsert({
    where: { phoneNumber: phone },
    update: { role, name },
    create: {
      id: randomUUID(),
      name,
      email: placeholderEmail(phone),
      phoneNumber: phone,
      phoneNumberVerified: true,
      role,
    },
  });
}

async function seedAdmin() {
  const phone = normalizePhone(process.env.ADMIN_PHONE ?? "");
  if (!phone) {
    console.warn("! ADMIN_PHONE is missing or invalid — skipping admin user");
    return;
  }
  await upsertUser(phone, "Admin", "ADMIN");
  console.log(`✓ admin user ${phone}`);
}

async function seedUsers(cityIds: Map<string, string>) {
  const ids = {} as Record<SeedUserKey, string>;
  for (const [key, u] of Object.entries(users) as [SeedUserKey, (typeof users)[SeedUserKey]][]) {
    const user = await upsertUser(u.phone, u.name, u.agent ? "AGENT" : "USER");
    ids[key] = user.id;

    if (u.agent) {
      const data = {
        slug: u.agent.slug,
        officeName: u.agent.officeName,
        bio: u.agent.bio,
        whatsapp: u.phone,
        cities: { set: u.agent.cities.map((slug) => ({ id: cityIds.get(slug)! })) },
      };
      await prisma.agentProfile.upsert({
        where: { userId: user.id },
        update: data,
        create: { ...data, userId: user.id, cities: { connect: data.cities.set } },
      });
    }
  }
  console.log(`✓ ${Object.keys(users).length} sample users (2 agents)`);
  return ids;
}

async function seedListings(
  userIds: Record<SeedUserKey, string>,
  cityIds: Map<string, string>,
  hoodIds: Map<string, string>,
) {
  // Rebuild sample listings from scratch, removing their old photo files.
  const ownerIds = Object.values(userIds);
  const oldPhotos = await prisma.listingPhoto.findMany({
    where: { listing: { ownerId: { in: ownerIds } } },
    select: { key: true },
  });
  await Promise.all(oldPhotos.map((p) => getStorage().delete(p.key)));
  await prisma.listing.deleteMany({ where: { ownerId: { in: ownerIds } } });

  let variant = 0;
  for (const l of listings) {
    const publishedAt = l.pending ? null : new Date(Date.now() - l.daysAgo * DAY - variant * 37 * 60 * 1000);
    const hoodId = hoodIds.get(`${l.city}/${l.hood}`);
    if (!hoodId) throw new Error(`Unknown neighbourhood ${l.city}/${l.hood}`);

    const listing = await prisma.listing.create({
      data: {
        ownerId: userIds[l.owner],
        dealType: l.deal,
        propertyType: l.type,
        cityId: cityIds.get(l.city)!,
        neighbourhoodId: hoodId,
        title: l.title,
        description: l.description,
        price: BigInt(l.price),
        currency: l.currency,
        rooms: l.rooms ?? null,
        areaM2: l.area ?? null,
        floor: l.floor ?? null,
        furnished: l.furnished ?? false,
        hasElectricity: l.electricity ?? false,
        hasWaterTank: l.water ?? false,
        hasParking: l.parking ?? false,
        contactPhone: users[l.owner].phone,
        status: l.pending ? "PENDING" : "ACTIVE",
        verified: l.verified ?? false,
        publishedAt,
        expiresAt: publishedAt ? new Date(publishedAt.getTime() + 30 * DAY) : null,
        views: l.pending ? 0 : Math.floor(Math.random() * 300) + 20,
        contactClicks: l.pending ? 0 : Math.floor(Math.random() * 25),
      },
    });

    for (let i = 0; i < l.photos; i++) {
      const png = await sharp(Buffer.from(placeholderSvg(l.type, variant + i))).png().toBuffer();
      const stored = await storeImage(png, `listings/${listing.id}`);
      await prisma.listingPhoto.create({ data: { listingId: listing.id, position: i, ...stored } });
    }
    variant++;
  }
  const pending = listings.filter((l) => l.pending).length;
  console.log(`✓ ${listings.length - pending} active + ${pending} pending listings with photos`);
}

async function main() {
  const { cityIds, hoodIds } = await seedLocations();
  await seedAdmin();
  const userIds = await seedUsers(cityIds);
  await seedListings(userIds, cityIds, hoodIds);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
