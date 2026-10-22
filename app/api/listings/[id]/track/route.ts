import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";

// POST /api/listings/:id/track?event=view|contact
// Counts page views and Call/WhatsApp clicks. Sent with navigator.sendBeacon,
// so it never blocks the page. Each visitor counts at most once per window,
// so refreshing or repeated clicks don't inflate the numbers.
const WINDOWS = {
  view: 30 * 60, // one view per visitor per listing per 30 min
  contact: 10 * 60, // one contact click per visitor per listing per 10 min
} as const;

export async function POST(req: Request, ctx: RouteContext<"/api/listings/[id]/track">) {
  const { id } = await ctx.params;
  const event = new URL(req.url).searchParams.get("event");
  if (event !== "view" && event !== "contact") return new Response(null, { status: 400 });
  if (!/^[a-z0-9]{20,40}$/.test(id)) return new Response(null, { status: 404 });

  const ip = await clientIp();
  const limited = await rateLimit(`${event}:${ip}:${id}`, 1, WINDOWS[event]);
  if (!limited.ok) return new Response(null, { status: 204 });

  await prisma.listing.updateMany({
    where: { id, status: "ACTIVE" },
    data: event === "view" ? { views: { increment: 1 } } : { contactClicks: { increment: 1 } },
  });
  return new Response(null, { status: 204 });
}
