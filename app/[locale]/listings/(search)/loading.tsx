import { Skeleton } from "@/components/ui/skeleton";

// Shown instantly while results stream in — matters most on slow connections.
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 md:px-10 md:py-8" aria-busy>
      <div className="flex gap-2 overflow-hidden py-3">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-11 w-28 shrink-0 rounded-full bg-deco" />
        ))}
      </div>
      <Skeleton className="mt-6 h-8 w-64 bg-deco" />
      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="aspect-square rounded-xl bg-deco" />
            <Skeleton className="h-4 w-3/4 bg-deco" />
            <Skeleton className="h-4 w-1/2 bg-deco" />
          </div>
        ))}
      </div>
    </div>
  );
}
