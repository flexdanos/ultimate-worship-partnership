"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { ImageLightbox } from "@/components/gallery/image-lightbox";

interface GalleryItem {
  id: string;
  alt: string;
  url: string;
  focalX: number;
  focalY: number;
}

const SIZES = ["9rem", "7rem", "11rem", "7.5rem", "10rem", "8rem"];
const OFFSETS = [0, 28, -18, 12, -24];

export function GalleryGrid({ images }: { images: GalleryItem[] }) {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-10 sm:gap-x-6">
        {images.map((image, i) => {
          const size = SIZES[i % SIZES.length];
          const offset = OFFSETS[i % OFFSETS.length];

          return (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelected(image)}
              aria-label={`View ${image.alt || "photo"} full size`}
              style={{
                width: `clamp(5.5rem, 20vw, ${size})`,
                height: `clamp(5.5rem, 20vw, ${size})`,
                marginTop: offset,
                animationDelay: `${(i % 7) * 0.35}s`,
                animationDuration: `${6 + (i % 4)}s`,
              }}
              className="group relative shrink-0 rounded-full shadow-md ring-1 ring-border transition-transform duration-500 ease-out-expo hover:z-10 hover:scale-125 hover:shadow-2xl hover:[animation-play-state:paused] motion-safe:animate-float motion-reduce:hover:scale-110"
            >
              <span className="block h-full w-full overflow-hidden rounded-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt}
                  style={{ objectPosition: `${image.focalX}% ${image.focalY}%` }}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-110"
                />
              </span>

              <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Eye className="h-5 w-5 translate-y-1 text-white transition-transform duration-300 group-hover:translate-y-0" />
                {image.alt && (
                  <span className="line-clamp-2 max-w-[80%] translate-y-1 text-center text-[0.65rem] font-medium leading-tight text-white/90 transition-transform duration-300 group-hover:translate-y-0">
                    {image.alt}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <ImageLightbox image={selected} onClose={() => setSelected(null)} />
    </>
  );
}
