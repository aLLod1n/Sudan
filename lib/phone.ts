import { parsePhoneNumberFromString } from "libphonenumber-js/min";

/**
 * Normalises user input to an E.164 phone number.
 * Local numbers without a country code are treated as Sudanese (+249).
 * Returns null when the number is not valid.
 */
export function normalizePhone(input: string): string | null {
  const cleaned = toLatinDigits(input).replace(/[\s\-().]/g, "");
  if (!cleaned) return null;
  const withPrefix = cleaned.startsWith("00") ? `+${cleaned.slice(2)}` : cleaned;
  const parsed = parsePhoneNumberFromString(withPrefix, "SD");
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number;
}

/** "+249912345678" -> "249912345678" (format used by wa.me links). */
export function toWhatsAppNumber(e164: string): string {
  return e164.replace(/^\+/, "");
}

/** Human-friendly international format, e.g. "+249 91 234 5678". */
export function formatPhone(e164: string): string {
  return parsePhoneNumberFromString(e164)?.formatInternational() ?? e164;
}

/** Converts Arabic-Indic (٠-٩) and Persian (۰-۹) digits to 0-9. */
export function toLatinDigits(value: string): string {
  return value
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/**
 * Better Auth requires an email on every user. Phone-only accounts get this
 * placeholder (".invalid" is a reserved TLD, so it can never receive mail).
 */
export function placeholderEmail(e164: string): string {
  return `${e164.replace(/^\+/, "")}@phone.darna.invalid`;
}
