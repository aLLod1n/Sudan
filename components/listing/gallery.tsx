"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Grid3x3, Home, X } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

type Photo = { id: string; url: string; width: number; height: number };

/**
 * Phones: full-width swipe carousel (CSS scroll-snap) with a counter.
 * Desktop: DESIGN.md-style grid of up to 5 photos.
 * Both open every photo in a native <dialog> (Esc / back closes it).
 */
export function Gallery({
  photos,
  alt,
  labels,
}: {
  photos: Photo[];
  alt: string;
  labels: { showAll: string; close: string; gallery: string; photoOf: string[] };
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-deco text-foggy md:aspect-[2/1]">
        <Home className="size-12" strokeWidth={1.4} aria-hidden />
      </div>
    );
  }

  const open = (i: number) => {
    dialogRef.current?.showModal();
    // Jump to the tapped photo inside the dialog.
    requestAnimationFrame(() => document.getElementById(`photo-${photos[i].id}`)?.scrollIntoView());
  };

  return (
    <section aria-label={labels.gallery}>
      {/* Phone carousel */}
      <div className="relative -mx-4 md:hidden">
        <ul
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
          }}
        >
          {photos.map((photo, i) => (
            <li key={photo.id} className="relative aspect-[4/3] w-full shrink-0 snap-center">
              <button type="button" className="absolute inset-0" onClick={() => open(i)} aria-label={labels.photoOf[i]}>
                <Image
                  src={photo.url}
                  alt={`${alt} (${i + 1})`}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  quality={75}
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
        <span className="pointer-events-none absolute end-3 bottom-3 rounded-full bg-hof/75 px-2.5 py-1 text-xs font-medium text-white" dir="ltr">
          {index + 1} / {photos.length}
        </span>
      </div>

      {/* Desktop grid */}
      <div
        className={cn(
          "relative hidden h-[460px] gap-2 overflow-hidden rounded-xl md:grid",
          photos.length >= 5 ? "grid-cols-4 grid-rows-2" : photos.length >= 3 ? "grid-cols-3 grid-rows-2" : "grid-cols-2",
        )}
      >
        {photos.slice(0, 5).map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => open(i)}
            aria-label={labels.photoOf[i]}
            className={cn(
              "relative overflow-hidden bg-deco hover:brightness-90",
              i === 0 && photos.length >= 3 && "col-span-2 row-span-2",
            )}
          >
            <Image
              src={photo.url}
              alt={`${alt} (${i + 1})`}
              fill
              sizes={i === 0 ? "50vw" : "25vw"}
              quality={75}
              className="object-cover"
            />
          </button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="absolute end-4 bottom-4 border-hof bg-white"
          onClick={() => open(0)}
        >
          <Grid3x3 aria-hidden />
          {labels.showAll}
        </Button>
      </div>

      <dialog
        ref={dialogRef}
        aria-label={labels.gallery}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-white p-0 backdrop:bg-black/60"
      >
        <div className="sticky top-0 z-10 flex h-16 items-center border-b border-bebe bg-white px-4">
          <Button type="button" variant="secondary" size="icon" aria-label={labels.close} onClick={() => dialogRef.current?.close()}>
            <X aria-hidden />
          </Button>
        </div>
        <ul className="mx-auto flex max-w-3xl flex-col gap-3 p-3 md:p-6">
          {photos.map((photo, i) => (
            <li key={photo.id} id={`photo-${photo.id}`} className="scroll-mt-20">
              <Image
                src={photo.url}
                alt={`${alt} (${i + 1})`}
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 768px) 768px, 100vw"
                quality={75}
                className="h-auto w-full rounded-lg"
              />
            </li>
          ))}
        </ul>
      </dialog>
    </section>
  );
}
