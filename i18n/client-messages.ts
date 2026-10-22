import type { Messages } from "next-intl";

/** Message namespaces available to Client Components (useTranslations). */
export const CLIENT_NAMESPACES = ["Common", "Auth"] as const satisfies readonly (keyof Messages)[];

export function pickMessages<K extends keyof Messages>(messages: Messages, keys: readonly K[]) {
  return Object.fromEntries(keys.map((k) => [k, messages[k]])) as Pick<Messages, K>;
}
