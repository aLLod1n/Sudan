/** Only same-site paths are allowed as post-login destinations (no open redirects). */
export function safeNext(next: unknown, fallback = "/account"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
