import { getCurrentUser } from "@/lib/session";

// GET /api/me — who is logged in, for the header (pages stay cacheable).
export async function GET() {
  const user = await getCurrentUser();
  return Response.json(
    { user: user ? { name: user.name, role: user.role, needsName: user.needsName } : null },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
