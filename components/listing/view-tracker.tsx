"use client";

import { useEffect } from "react";

/** Counts one page view per browser session (the server also rate-limits by IP). */
export function ViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    const key = `viewed:${listingId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked (private mode): the server-side limit still applies.
    }
    navigator.sendBeacon?.(`/api/listings/${listingId}/track?event=view`);
  }, [listingId]);

  return null;
}
