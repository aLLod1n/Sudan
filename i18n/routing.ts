import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  // Arabic URLs have no prefix (/listings), English uses /en/listings.
  localePrefix: "as-needed",
  // Always start in Arabic; shared links must open the same way for everyone.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

export const localeDirection: Record<Locale, "rtl" | "ltr"> = { ar: "rtl", en: "ltr" };
