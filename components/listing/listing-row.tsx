import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ListingCardData } from "@/lib/data/listings";
import { ListingCard } from "./listing-card";

/**
 * Horizontal scroll row with "Section Title with Arrow" (DESIGN.md).
 * CSS scroll-snap only: swipe on phones, shift+wheel / trackpad on desktop.
 */
export function ListingRow({
  title,
  href,
  listings,
  priorityCount = 0,
}: {
  title: string;
  href: string;
  listings: ListingCardData[];
  priorityCount?: number;
}) {
  return (
    <section className="@container flex flex-col gap-4">
      <h2 className="text-heading-sm font-medium tracking-display">
        <Link href={href} className="inline-flex items-center gap-2 hover:underline hover:underline-offset-4">
          {title}
          <ArrowRight className="size-5 rtl:-scale-x-100" aria-hidden />
        </Link>
      </h2>
      <ul className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 md:-mx-10 md:scroll-px-10 md:px-10">
        {listings.map((listing, i) => (
          <li
            key={listing.id}
            // Sized by the row width (container queries), not the screen.
            className="w-[72%] shrink-0 snap-start @lg:w-[42%] @3xl:w-[calc((100%-2*1rem)/3)] @5xl:w-[calc((100%-3*1rem)/4)] @7xl:w-[calc((100%-5*1rem)/6)]"
          >
            <ListingCard listing={listing} priority={i < priorityCount} />
          </li>
        ))}
      </ul>
    </section>
  );
}
