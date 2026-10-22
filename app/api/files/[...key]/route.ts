import { promises as fs } from "node:fs";
import { resolveLocalPath } from "@/lib/storage";

// Serves files from the local storage driver (development only).
export async function GET(_req: Request, ctx: RouteContext<"/api/files/[...key]">) {
  if (process.env.STORAGE_DRIVER === "r2") return new Response("Not found", { status: 404 });

  const { key } = await ctx.params;
  const file = resolveLocalPath(key.join("/"));
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
    return new Response("Not found", { status: 404 });
  }
}
