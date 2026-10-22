import sanitizeHtml from "sanitize-html";

/**
 * Strips all HTML from user text and normalises whitespace.
 * Listing text is rendered as plain text, so no markup is ever kept.
 */
export function sanitizeText(value: string): string {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&") // last, so "&amp;lt;" stays "&lt;"
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Single-line variant for titles and names. */
export function sanitizeLine(value: string): string {
  return sanitizeText(value).replace(/\s+/g, " ");
}
