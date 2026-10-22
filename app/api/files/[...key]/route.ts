import { promises as fs } from "node:fs";
import { resolveLocalPath } from "@/lib/storage";

// Serves files from the local storage driver.
// If the file isn't on this server's disk (always the case on Vercel, whose
// disk isn't persistent), fall back to the bundled sample photos in
// public/demo-photos — enough for demos until cloud storage is configured.
export async function GET(req: Request, ctx: RouteContext<"/api/files/[...key]">) {
  if (process.env.STORAGE_DRIVER === "r2") return new Response("Not found", { status: 404 });

  const { key } = await ctx.params;
  const joined = key.join("/");
  const file = resolveLocalPath(joined);
  if (!file) return new Response("Not found", { status: 404 });

  try {
    const body = await fs.readFile(/*turbopackIgnore: true*/ file);
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": file.endsWith(".webp") ? "image/webp" : "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    // Proxy the static copy (no redirect: next/image doesn't follow those).
    const demo = await fetch(new URL(`/demo-photos/${joined}`, req.url));
    if (!demo.ok) return new Response("Not found", { status: 404 });
    return new Response(demo.body, {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  }
}
