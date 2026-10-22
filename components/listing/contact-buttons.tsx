"use client";

import { Phone } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { WhatsAppIcon } from "./whatsapp-icon";

function track(listingId: string) {
  // Fire-and-forget; never delays opening the dialer / WhatsApp.
  navigator.sendBeacon?.(`/api/listings/${listingId}/track?event=contact`);
}

/**
 * Call (coral, the page's one primary action) and WhatsApp (black, so the
 * design keeps a single accent colour). Plain links: work without JS.
 */
export function ContactButtons({
  listingId,
  phone,
  whatsappUrl,
  labels,
  showNumber = false,
  className,
}: {
  listingId: string;
  /** E.164 */
  phone: string;
  whatsappUrl: string;
  labels: { call: string; callNumber: string; whatsapp: string };
  /** Show the number on the Call button (desktop, where tel: may not dial). */
  showNumber?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      <a
        href={`tel:${phone}`}
        onClick={() => track(listingId)}
        className={buttonVariants({ variant: "brand", size: "lg", className: "px-3" })}
      >
        <Phone className="size-5" aria-hidden />
        {showNumber ? <span dir="ltr">{labels.callNumber}</span> : labels.call}
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track(listingId)}
        className={buttonVariants({ size: "lg", className: "px-3" })}
      >
        <WhatsAppIcon className="size-5" />
        {labels.whatsapp}
      </a>
    </div>
  );
}
