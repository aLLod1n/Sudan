import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";

// GET /api/og/listings/:id — 1200x630 JPEG preview for WhatsApp / Facebook.
// Built from the first photo (WhatsApp previews don't reliably support WebP).
// Falls back to a plain branded card when the listing has no photo.

const WIDTH = 1200;
const HEIGHT = 630;

const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="100%" height="100%" fill="#f7f7f7"/>
  <path transform="translate(480 195) scale(7.5)" fill="#ff385c"
    d="M16 3.2 2.9 14.1a1.6 1.6 0 0 0 2 2.5l1.5-1.2v11.4A2.2 2.2 0 0 0 8.6 29h4.9v-7.4a2.5 2.5 0 0 1 5 0V29h4.9a2.2 2.2 0 0 0 2.2-2.2V15.4l1.5 1.2a1.6 1.6 0 0 0 2-2.5Z"/>
</svg>`;

export async function GET(_req: Request, ctx: RouteContext<"/api/og/listings/[id]">) {
  const { id } = await ctx.params;
  if (!/^[a-z0-9]{20,40}$/.test(id)) return new Response("Not found", { status: 404 });

  const photo = await prisma.listingPhoto.findFirst({
    where: { listingId: id, listing: { status: { in: ["ACTIVE", "EXPIRED"] } } },
    orderBy: { position: "asc" },
    select: { key: true },
  });

  let input: Buffer;
  try {
    input = photo ? await getStorage().read(photo.key) : Buffer.from(fallbackSvg);
  } catch {
    input = Buffer.from(fallbackSvg);
  }

  const jpeg = await sharp(input)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      // Photos rarely change; let CDNs and WhatsApp's crawler cache it.
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
