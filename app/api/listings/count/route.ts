import { countSearch } from "@/lib/data/listings";
import { getCities } from "@/lib/data/locations";
import { parseSearchParams } from "@/lib/validators/search";

// GET /api/listings/count?<same query as /listings> -> { count }
// Powers the live "Show N results" button in the filters popup.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const params: Record<string, string | string[]> = {};
  for (const key of new Set(url.searchParams.keys())) {
    const all = url.searchParams.getAll(key);
    params[key] = all.length > 1 ? all : all[0];
  }
  const count = await countSearch(parseSearchParams(params), await getCities());
  return Response.json({ count }, { headers: { "Cache-Control": "public, max-age=30" } });
}
