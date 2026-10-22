import type { Currency, DealType, ListingStatus, PropertyType, ReportReason } from "@/generated/prisma/enums";

// Client-safe enum value lists (the generated enums module has no server deps).
export const DEAL_TYPES = ["RENT", "SALE"] as const satisfies readonly DealType[];
export const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "LAND", "SHOP", "OFFICE"] as const satisfies readonly PropertyType[];
export const CURRENCIES = ["SDG", "USD"] as const satisfies readonly Currency[];
export const LISTING_STATUSES = ["PENDING", "ACTIVE", "REJECTED", "EXPIRED", "REMOVED"] as const satisfies readonly ListingStatus[];
export const REPORT_REASONS = ["FAKE", "UNAVAILABLE", "WRONG_INFO", "OTHER"] as const satisfies readonly ReportReason[];

export const MAX_PHOTOS = 8;
export const LISTING_LIFETIME_DAYS = 30;
export const PAGE_SIZE = 20;
