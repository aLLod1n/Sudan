import type { Locale } from "@/i18n/routing";

/**
 * Latin digits in both languages: prices and phone numbers are easier to
 * read and compare that way, and it matches how most Sudanese sites show them.
 */
export function numberLocale(locale: Locale | string) {
  return locale === "ar" ? "ar-u-nu-latn" : "en-US";
}

export function formatNumber(value: number | bigint, locale: Locale | string) {
  return new Intl.NumberFormat(numberLocale(locale)).format(value);
}

export function formatDate(date: Date, locale: Locale | string) {
  return new Intl.DateTimeFormat(numberLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Khartoum",
  }).format(date);
}

/** Picks the Arabic or English name of a city / neighbourhood. */
export function localName(item: { nameAr: string; nameEn: string }, locale: Locale | string) {
  return locale === "ar" ? item.nameAr : item.nameEn;
}
