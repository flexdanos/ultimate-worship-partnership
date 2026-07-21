"use client";

import { useState } from "react";
import { ImageLightbox } from "@/components/gallery/image-lightbox";

interface GalleryItem {
  id: string;
  alt: string;
  url: string;
  focalX: number;
  focalY: number;
}

export function GalleryGrid({ images }: { images: GalleryItem[] }) {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setSelected(image)}
            className="aspect-video overflow-hidden rounded-xl border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.alt}
              style={{ objectPosition: `${image.focalX}% ${image.focalY}%` }}
              className="h-full w-full object-cover transition hover:scale-105"
            />
          </button>
        ))}
      </div>

      <ImageLightbox image={selected} onClose={() => setSelected(null)} />
    </>
  );
}
